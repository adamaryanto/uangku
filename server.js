const express = require('express');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');
const cron = require('node-cron');

const app = express();
app.use(bodyParser.json());

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
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
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
