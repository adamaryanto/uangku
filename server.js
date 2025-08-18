const express = require('express');
// Use global fetch if available (Node 18+), fallback to dynamic import for node-fetch
const fetchFn = globalThis.fetch
  ? globalThis.fetch.bind(globalThis)
  : (...args) => import('node-fetch').then(({ default: f }) => f(...args));
const bodyParser = require('body-parser');
const cron = require('node-cron');
const Database = require('better-sqlite3');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Configure nodemailer with app password
let transporter;

// Function to create email transporter
const createTransporter = () => {
  try {
    console.log('🔧 Initializing email transporter...');
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      const errorMsg = '❌ EMAIL_USER or EMAIL_PASS environment variables not set';
      console.warn(errorMsg);
      throw new Error(errorMsg);
    }
    
    console.log('📧 Using email:', process.env.EMAIL_USER);
    
    const transport = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        // Do not fail on invalid certs
        rejectUnauthorized: false
      },
      debug: true,
      logger: true
    });
    
    // Verify connection configuration
    transport.verify(function(error, success) {
      if (error) {
        console.error('❌ SMTP Connection Error:', error);
      } else {
        console.log('✅ SMTP Server is ready to send emails');
      }
    });
    
    return transport;
  } catch (error) {
    console.error('❌ Failed to create email transporter:', error);
    return null;
  }
};

// Initialize transporter
transporter = createTransporter();

// Verify connection configuration
if (transporter) {
  transporter.verify(function(error, success) {
    if (error) {
      console.error('SMTP Connection Error:', error);
    } else {
      console.log('SMTP Server is ready to take our messages');
    }
  });
}

// In-memory store for OTPs (in production, use Redis or a database)
const otpStore = new Map();

const app = express();
app.use(bodyParser.json());
// Simple CORS for development (adjust origins as needed)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});
// Simple request logger
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check
app.get('/health', (_req, res) => res.json({ ok: true }));

// ====== Auth DB setup (better-sqlite3) ======
const db = new Database('users.db');
db.pragma('journal_mode = WAL');
db.exec(`
  -- Users table
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  
  -- Transactions table
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    category TEXT,
    amount REAL NOT NULL,
    description TEXT,
    icon TEXT,
    source TEXT,
    date TEXT NOT NULL,
    display_date TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  -- Targets table
  CREATE TABLE IF NOT EXISTS targets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    target_amount REAL NOT NULL,
    saved_amount REAL DEFAULT 0,
    start_date TEXT,
    end_date TEXT,
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  -- Target transactions (for tracking contributions to targets)
  CREATE TABLE IF NOT EXISTS target_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    target_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    date TEXT NOT NULL,
    notes TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY(target_id) REFERENCES targets(id) ON DELETE CASCADE
  );

  -- Password reset tokens
  CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    used INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, date);
  CREATE INDEX IF NOT EXISTS idx_password_reset_token ON password_reset_tokens(token);
`);

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
}

// ====== Auth Endpoints ======
app.post('/api/register', (req, res) => {
  try {
    const { fullName, email, password } = req.body || {};
    if (!fullName || !email || !password) {
      return res.status(400).json({ success: false, message: 'fullName, email, and password are required' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const password_hash = hashPassword(password, salt);
    const created_at = new Date().toISOString();

    const info = db
      .prepare('INSERT INTO users (full_name, email, password_hash, salt, created_at) VALUES (?, ?, ?, ?, ?)')
      .run(fullName, email.toLowerCase(), password_hash, salt, created_at);

    return res.json({ success: true, userId: info.lastInsertRowid });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Generate a random 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP via email
async function sendOTP(email, otp) {
  console.log(`\n=== SENDING OTP TO ${email} ===`);
  
  if (!transporter) {
    console.error('❌ Email transporter not initialized');
    return false;
  }

  // Simple email validation
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error('❌ Invalid email format:', email);
    return false;
  }

  try {
    console.log(`📧 Preparing to send OTP ${otp} to ${email}`);
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Kode Verifikasi Reset Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #005AE0;">Reset Password</h2>
          <p>Anda meminta untuk mereset password akun UangKu Anda. Gunakan kode OTP berikut untuk melanjutkan:</p>
          <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0; font-size: 24px; letter-spacing: 5px; font-weight: bold; color: #005AE0;">
            ${otp}
          </div>
          <p>Kode ini akan kedaluwarsa dalam 10 menit. Jika Anda tidak meminta reset password, Anda dapat mengabaikan email ini.</p>
          <p>Terima kasih,<br>Tim UangKu</p>
        </div>
      `
    };

    console.log('📤 Sending email...');
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    
    return true;
  } catch (error) {
    console.error('❌ Error sending OTP email:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    
    if (error.response) {
      console.error('SMTP Response Code:', error.responseCode);
      console.error('SMTP Response:', error.response);
    }
    
    if (error.command) {
      console.error('Failed command:', error.command);
    }
    
    return false;
  }
}

// Request password reset OTP
app.post('/api/auth/forgot-password', async (req, res) => {
  console.log('=== FORGOT PASSWORD REQUEST START ===');
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Raw body:', req.body);
  
  // Ensure we have a valid JSON body
  if (typeof req.body !== 'object' || req.body === null) {
    console.error('Invalid request body:', req.body);
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid request format. Please send JSON data.'
    });
  }
  
  try {
    const { email } = req.body;
    console.log('Email from request:', email);
    
    if (!email) {
      console.log('Email is required');
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Check if user exists
    const user = db.prepare('SELECT id, email FROM users WHERE email = ?').get(email.toLowerCase());
    if (!user) {
      console.log('User not found, but returning success for security');
      // For security, don't reveal if email exists or not
      return res.json({ 
        success: true, 
        message: 'Jika email Anda terdaftar, Anda akan menerima kode OTP' 
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    console.log(`Generated OTP ${otp} for ${email}, expires at ${expiresAt}`);
    
    // Store OTP in memory (in production, use a database with TTL)
    otpStore.set(email.toLowerCase(), { 
      otp, 
      expiresAt: expiresAt.toISOString() 
    });

    // In development, log the OTP instead of sending email
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV] OTP for ${email}: ${otp}`);
      return res.json({ 
        success: true, 
        message: 'Kode OTP telah dibuat (development mode)',
        debug: { otp } // Only include in development
      });
    }

    // In production, send actual email
    try {
      console.log('Attempting to send OTP email to:', email);
      const sent = await sendOTP(email, otp);
      if (!sent) {
        console.error('Failed to send OTP email');
        return res.status(500).json({ 
          success: false, 
          message: 'Gagal mengirim kode OTP. Silakan coba lagi nanti.' 
        });
      }
    } catch (emailError) {
      console.error('Error in sendOTP:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengirim email. Pastikan email valid dan coba lagi.',
        error: process.env.NODE_ENV === 'development' ? emailError.message : undefined
      });
    }

    console.log(`OTP sent successfully to ${email}`);
    res.json({ 
      success: true, 
      message: 'Kode OTP telah dikirim ke email Anda' 
    });
    
  } catch (error) {
    console.error('Error in forgot password:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan. Silakan coba lagi nanti.' 
    });
  }
});

// Verify OTP
app.post('/api/auth/verify-otp', (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email dan kode OTP diperlukan' });
    }

    const storedData = otpStore.get(email);
    const now = new Date();
    
    // Check if OTP exists and is not expired
    if (!storedData || new Date(storedData.expiresAt) < now) {
      return res.status(400).json({ success: false, message: 'Kode OTP tidak valid atau sudah kedaluwarsa' });
    }

    // Verify OTP
    if (storedData.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Kode OTP tidak valid' });
    }

    // Generate a reset token (for the next step)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour from now
    
    // Store the reset token (in production, store in database)
    otpStore.set(`reset_${email}`, { 
      token: resetToken, 
      expiresAt: expiresAt.toISOString(),
      verified: true
    });

    // Clear the OTP after successful verification
    otpStore.delete(email);

    res.json({ 
      success: true, 
      message: 'OTP berhasil diverifikasi',
      resetToken
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan. Silakan coba lagi nanti.' });
  }
});

// Reset password with token
app.post('/api/auth/reset-password', (req, res) => {
  try {
    const { email, token, newPassword } = req.body;
    if (!email || !token || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email, token, dan password baru diperlukan' });
    }

    // Verify token
    const storedData = otpStore.get(`reset_${email}`);
    const now = new Date();
    
    if (!storedData || !storedData.verified || new Date(storedData.expiresAt) < now) {
      return res.status(400).json({ success: false, message: 'Token tidak valid atau sudah kedaluwarsa' });
    }

    if (storedData.token !== token) {
      return res.status(400).json({ success: false, message: 'Token tidak valid' });
    }

    // Get user
    const user = db.prepare('SELECT id, salt FROM users WHERE email = ?').get(email.toLowerCase());
    if (!user) {
      return res.status(400).json({ success: false, message: 'Akun tidak ditemukan' });
    }

    // Update password
    const password_hash = hashPassword(newPassword, user.salt);
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(password_hash, user.id);
    
    // Clear the reset token
    otpStore.delete(`reset_${email}`);

    res.json({ success: true, message: 'Password berhasil diubah. Silakan login dengan password baru Anda.' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan. Silakan coba lagi nanti.' });
  }
});

app.post('/api/login', (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'email and password are required' });
    }

    const user = db.prepare('SELECT id, full_name, email, password_hash, salt FROM users WHERE email = ?').get(email.toLowerCase());
    if (!user) {
      return res.status(401).json({ success: false, message: 'Email atau password salah!' });
    }

    const computed = hashPassword(password, user.salt);
    if (computed !== user.password_hash) {
      return res.status(401).json({ success: false, message: 'Email atau password salah!' });
    }

    // Simple session token (for demo). In production, use JWT or proper session store.
    const token = crypto.randomBytes(24).toString('hex');
    return res.json({
      success: true,
      token,
      user: { id: user.id, fullName: user.full_name, email: user.email }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ====== Transactions Endpoints ======
// Create a transaction for a user
app.post('/api/transactions', (req, res) => {
  try {
    const { userId, type, category, amount, description, icon, source, date, displayDate } = req.body || {};
    if (!userId || !type || amount == null || !date) {
      return res.status(400).json({ success: false, message: 'userId, type, amount, and date are required' });
    }
    const created_at = new Date().toISOString();
    const info = db.prepare(`
      INSERT INTO transactions (user_id, type, category, amount, description, icon, source, date, display_date, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(userId, type, category || null, Number(amount), description || null, icon || null, source || null, date, displayDate || null, created_at);
    return res.json({ success: true, id: info.lastInsertRowid });
  } catch (err) {
    console.error('Create transaction error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get transactions for a user, optional date filter (YYYY-MM-DD)
app.get('/api/transactions', (req, res) => {
  try {
    const userId = Number(req.query.userId);
    const date = req.query.date;
    
    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId is required' });
    }
    
    let rows;
    if (date) {
      rows = db.prepare('SELECT * FROM transactions WHERE user_id = ? AND date = ? ORDER BY created_at DESC').all(userId, date);
    } else {
      rows = db.prepare('SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC').all(userId);
    }
    
    return res.json({ success: true, transactions: rows });
  } catch (err) {
    console.error('Error fetching transactions:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ====== Target Endpoints ======
// Create a new target
app.post('/api/targets', (req, res) => {
  try {
    const { userId, name, targetAmount, savedAmount = 0, startDate, endDate, notes } = req.body;
    
    if (!userId || !name || !targetAmount) {
      return res.status(400).json({ success: false, message: 'userId, name, and targetAmount are required' });
    }
    
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO targets (user_id, name, target_amount, saved_amount, start_date, end_date, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const info = stmt.run(
      userId,
      name,
      targetAmount,
      savedAmount,
      startDate || null,
      endDate || null,
      notes || null,
      now,
      now
    );
    
    res.json({ 
      success: true, 
      targetId: info.lastInsertRowid,
      message: 'Target created successfully' 
    });
  } catch (err) {
    console.error('Error creating target:', err);
    res.status(500).json({ success: false, message: 'Failed to create target' });
  }
});

// Get all targets for a user
app.get('/api/targets', (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId is required' });
    }
    
    const targets = db.prepare(`
      SELECT id, name, target_amount as targetAmount, saved_amount as savedAmount, 
             start_date as startDate, end_date as endDate, notes, created_at as createdAt,
             (saved_amount >= target_amount) as isCompleted
      FROM targets 
      WHERE user_id = ?
      ORDER BY created_at DESC
    `).all(userId);
    
    res.json({ success: true, data: targets });
  } catch (err) {
    console.error('Error fetching targets:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch targets' });
  }
});

// Add to a target's saved amount
app.post('/api/targets/:id/contribute', (req, res) => {
  try {
    const { id } = req.params;
    const { amount, notes } = req.body;
    
    if (!amount || isNaN(amount)) {
      return res.status(400).json({ success: false, message: 'Valid amount is required' });
    }
    
    // Start transaction
    db.exec('BEGIN TRANSACTION');
    
    try {
      // Update target's saved amount
      db.prepare(`
        UPDATE targets 
        SET saved_amount = saved_amount + ?, 
            updated_at = ?
        WHERE id = ?
      `).run(amount, new Date().toISOString(), id);
      
      // Record the transaction
      db.prepare(`
        INSERT INTO target_transactions (target_id, amount, date, notes, created_at)
        VALUES (?, ?, ?, ?, ?)
      `).run(id, amount, new Date().toISOString().split('T')[0], notes || null, new Date().toISOString());
      
      // Commit transaction
      db.exec('COMMIT');
      
      res.json({ success: true, message: 'Contribution added successfully' });
    } catch (err) {
      // Rollback on error
      db.exec('ROLLBACK');
      throw err;
    }
  } catch (err) {
    console.error('Error contributing to target:', err);
    res.status(500).json({ success: false, message: 'Failed to add contribution' });
  }
});

// Get target details with transactions
app.get('/api/targets/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    // Get target
    const target = db.prepare(`
      SELECT id, name, target_amount as targetAmount, saved_amount as savedAmount, 
             start_date as startDate, end_date as endDate, notes, created_at as createdAt
      FROM targets 
      WHERE id = ?
    `).get(id);
    
    if (!target) {
      return res.status(404).json({ success: false, message: 'Target not found' });
    }
    
    // Get transactions
    const transactions = db.prepare(`
      SELECT id, amount, date, notes, created_at as createdAt
      FROM target_transactions
      WHERE target_id = ?
      ORDER BY date DESC, created_at DESC
    `).all(id);
    
    res.json({ 
      success: true, 
      data: {
        ...target,
        transactions,
        progress: Math.min(100, (target.savedAmount / target.targetAmount) * 100)
      } 
    });
  } catch (err) {
    console.error('Error fetching target details:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch target details' });
  }
});

// Delete a target
app.delete('/api/targets/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    // Delete target (cascade will delete transactions)
    const stmt = db.prepare('DELETE FROM targets WHERE id = ?');
    const result = stmt.run(id);
    
    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: 'Target not found' });
    }
    
    res.json({ success: true, message: 'Target deleted successfully' });
  } catch (err) {
    console.error('Error deleting target:', err);
    res.status(500).json({ success: false, message: 'Failed to delete target' });
  }
});

// Update a target
app.put('/api/targets/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, targetAmount, startDate, endDate, notes } = req.body;
    
    const updates = [];
    const params = [];
    
    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }
    
    if (targetAmount !== undefined) {
      updates.push('target_amount = ?');
      params.push(targetAmount);
    }
    
    if (startDate !== undefined) {
      updates.push('start_date = ?');
      params.push(startDate || null);
    }
    
    if (endDate !== undefined) {
      updates.push('end_date = ?');
      params.push(endDate || null);
    }
    
    if (notes !== undefined) {
      updates.push('notes = ?');
      params.push(notes || null);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }
    
    // Add updated_at and id to params
    updates.push('updated_at = ?');
    params.push(new Date().toISOString(), id);
    
    const query = `UPDATE targets SET ${updates.join(', ')} WHERE id = ?`;
    const stmt = db.prepare(query);
    const result = stmt.run(...params);
    
    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: 'Target not found' });
    }
    
    res.json({ success: true, message: 'Target updated successfully' });
  } catch (err) {
    console.error('Error updating target:', err);
    res.status(500).json({ success: false, message: 'Failed to update target' });
  }
});

let tokens = []; // simpan token sementara

// Endpoint untuk simpan token
app.post('/save-token', (req, res) => {
  const { token } = req.body;
  if (token && !tokens.includes(token)) {
    tokens.push(token);
    console.log('Token baru disimpan:', token);
  }
  res.json({ success: true, tokens });
});

// Cron job tiap 1 menit kirim notif test (buat uji coba)
cron.schedule('* * * * *', async () => {
  console.log('Kirim notif test ke semua token...');
  for (let t of tokens) {
    await sendPushNotification(t, 'Pengingat Cicilan', 'Ini notifikasi dari server backend.');
  }
});

// Fungsi kirim notif ke Expo Push Service
async function sendPushNotification(expoPushToken, title, body) {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title,
    body,
    data: { customData: 'Hello from backend' },
  };

  try {
    const response = await fetchFn('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    const data = await response.json();
    console.log('Response Expo:', data);
  } catch (err) {
    console.error('Gagal kirim notif:', err);
  }
}

app.listen(3000, () => {
  console.log('Server berjalan di port 3000');
});

