import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LanguageContext = createContext();

const translations = {
  en: {
    // Common
    save: 'Save',
    cancel: 'Cancel',
    back: 'Back',
    next: 'Next',
    done: 'Done',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    confirm: 'Confirm',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    search: 'Search',
    noData: 'No data available',
    
    // Auth
    login: 'Login',
    register: 'Register',
    welcome: 'Welcome',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    forgotPassword: 'Forgot Password?',
    verification: 'Verification',
    createNewPassword: 'Create New Password',
    dontHaveAccount: "Don't have an account? ",
    alreadyHaveAccount: 'Already have an account? ',
    loginSuccess: 'Login successful!',
    registerSuccess: 'Registration successful!',
    successLogin: 'Login Successful',
    successRegister: 'Registration Successful',
    successForgotPassword: 'Reset Password Successful',
    
    // Main Tabs
    home: 'Home',
    transactions: 'Transactions',
    targets: 'Targets',
    installments: 'Installments',
    diagram: 'Diagram',
    profile: 'Profile',
    
    // Settings
    settings: 'Settings',
    language: 'Language',
    notifications: 'Enable Notifications',
    notificationsOn: 'Notifications enabled',
    notificationsOff: 'Notifications disabled',
    notificationsEnabledMessage: 'Notifications enabled! You will receive installment reminders.',
    notificationsDisabledMessage: 'Notifications disabled. You will not receive installment reminders.',
    notificationToggleError: 'An error occurred while changing notification settings',
    reminderNotificationTitle: 'Installment Reminder',
    reminderNotificationBody: 'This is an example of an installment reminder notification.',
    notificationPermissionDenied: 'Notification permission denied!',
    notificationsDeviceOnly: 'Notifications only work on a physical device',
    logout: 'Logout',
    confirmLogout: 'Are you sure you want to logout?',
    deleteData: 'Delete Data',
    changePassword: 'Change Password',
    theme: 'Theme',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    
    // Transactions
    addTransaction: 'Add Transaction',
    income: 'Income',
    expense: 'Expense',
    transfer: 'Transfer',
    amount: 'Amount',
    category: 'Category',
    date: 'Date',
    description: 'Description',
    totalTransactionFunds: 'Total transaction funds:',
    transferFunds: 'Transfer funds',
    transactionCount: 'Transaction Count',
    noTransactions: 'No transactions yet',
    addFirstTransaction: 'Add your first transaction',
    seeMore: 'See More',
    seeLess: 'Show Less',
    transactionHistory: 'Transaction History',
    moneyOut: 'Money Out',
    moneyIn: 'Money In',

    // App Screens
    applicationDescription: 'Application Description',
    updateTargetProgress: 'Update Target Progress',
    updateInstallmentPayment: 'Update Installment Payment',
    yourFinancialGoals: 'Your Financial Goals',
    manageAndTrackTargets: 'Set and track your financial targets.',
    manageInstallmentsTitle: 'Manage Your Installments',
    manageInstallmentsSubtitle: 'Manage and track all installments and their due dates',
    financialAnalysisTitle: 'Financial Analysis',
    financialAnalysisSubtitle: 'Review spending and income patterns graphically',
    transactionsTodayTitle: 'Your transactions today:',
    transactionsOnDatePrefix: 'Your transactions on',
    
    // Targets
    addTarget: 'Add Target',
    targetName: 'Target Name',
    targetAmount: 'Target Amount',
    currentAmount: 'Current Amount',
    deadline: 'Deadline',
    collected: 'Collected',
    remaining: 'Remaining',
    completed: 'Completed',
    notCompleted: 'Not Completed',
    finish: 'Finish',
    target: 'Target',
    targetsLabel: 'Targets',
    notYetTargets: 'Not Yet Targets',
    completedTargets: 'Completed Targets',
    totalTargetFundsLabel: 'Total target funds :',
    targetFulfilled: 'Target fulfilled :',
    remainingTargetFunds: 'Remaining target funds :',
    yourTargets: 'Your Targets :',
    noTargetsYet: 'No Targets Yet',
    createFirstTarget: 'Create your first financial target',
    targetHistory: 'Target History',
    addNewTarget: 'Add New Target',
    
    // Installments
    addInstallment: 'Add Installment',
    installmentName: 'Installment Name',
    totalAmount: 'Total Amount',
    paidAmount: 'Paid Amount',
    remainingAmount: 'Remaining',
    dueDate: 'Due Date',
    paymentDate: 'Payment Date',
    installmentsLabel: 'Installments',
    unpaid: 'Unpaid',
    paid: 'Paid',
    totalInstallmentFundsLabel: 'Total installment funds :',
    installmentsFulfilled: 'Installments fulfilled :',
    remainingInstallments: 'Remaining installments :',
    yourInstallments: 'Your installments :',
    noInstallmentsYet: 'No Installments Yet',
    addFirstInstallment: 'Add your first installment',
    installmentHistory: 'Installment History',
    addNewInstallment: 'Add New Installment',
    paidOff: 'Paid Off',
    notPaidOff: 'Not Paid Off',
    paymentAmount: 'Payment Amount',
    addPaymentForInstallment: 'Add payment for:',
    chooseDate: 'Choose date',

    // Installment Alerts/Messages
    installmentNameAndAmountRequired: 'Installment name and amount are required.',
    installmentAmountMustBeValid: 'Installment amount must be a valid number greater than 0.',
    installmentAddedSuccess: 'Installment added successfully.',
    invalidInstallmentData: 'Invalid installment data',
    paymentAmountRequired: 'Payment amount is required',
    paymentAmountMustBeValid: 'Payment amount must be a valid number greater than 0',
    installmentPaymentAddedSuccess: 'Installment payment added successfully',
    installmentUpdatedSuccess: 'Installment updated successfully.',
    installmentNameTotalDueRequired: 'Installment name, total amount, and due date are required.',
    
    // Categories
    food: 'Food',
    transportation: 'Transportation',
    shopping: 'Shopping',
    bills: 'Bills',
    entertainment: 'Entertainment',
    health: 'Health',
    education: 'Education',
    others: 'Others',
    
    // Time
    today: 'Today',
    yesterday: 'Yesterday',
    thisWeek: 'This Week',
    thisMonth: 'This Month',
    lastMonth: 'Last Month',
    custom: 'Custom',
    
    // Messages
    confirmDelete: 'Are you sure you want to delete this item?',
    dataDeleted: 'Data has been deleted',
    changesSaved: 'Changes have been saved',
    somethingWentWrong: 'Something went wrong. Please try again.',
    noInternet: 'No internet connection',
    tryAgain: 'Try Again',

    // Forms & Labels
    sourceOfFunds: 'Source of Funds',
    destination: 'Destination',
    notes: 'Notes',
    addNoteOptional: 'Add a note (optional)',
    ok: 'OK',
    fromDate: 'From date :',
    toDate: 'To date :',
    transactionPeriod: 'Transaction Period :',
    exportPdf: 'Export Pdf',
    expenseSummary: 'Expense Summary',
    noDataForPeriod: 'No expense data for this period',
    totalOverallFunds: 'Total overall funds :',
    totalIncomeLabel: 'Total Income :',
    totalExpenseLabel: 'Total Expense :',
    balanceLabel: 'Balance :',

    // Placeholders
    datePlaceholder: 'DD-MM-YYYY',

    // Target Form Labels
    targetNameLabel: 'Target Name',
    targetAmountLabel: 'Target Amount',
    exampleTargetName: 'Example: Vacation to Bali',
    exampleTargetAmount: 'Example: 5,000,000',

    // Target Screens Alerts/Messages
    targetNameAndAmountRequired: 'Target name and amount are required.',
    targetAmountMustBeValid: 'Target amount must be a valid number greater than 0.',
    targetAddedSuccess: 'Target added successfully.',
    amountRequired: 'Amount is required.',
    amountMustBeValid: 'Amount must be a valid number greater than 0.',
    progressUpdatedSuccess: 'Target progress updated successfully.',
    addFundsForTarget: 'Add funds for target:',
    endDateMustBeAfterStartDate: 'End date must be the same as or after the start date.',

    // Screen Titles & Subtitles
    transferBalanceTitle: 'Transfer Balance',
    transferBalanceSubtitle: 'Record all fund movements between your accounts or funding sources.',
    expenseBalanceTitle: 'Expense Balance',
    expenseBalanceSubtitle: 'Record every expense you make like shopping, transport, or other needs.',
    incomeBalanceTitle: 'Income Balance',
    incomeBalanceSubtitle: 'Record all income you receive such as salary, bonus, or other sources.',

    // Alerts
    requiredFieldsTransfer: 'Source, destination, and amount are required.',
    requiredFieldsExpenseIncome: 'Category, source, and amount are required.',
    invalidAmount: 'Amount must be a valid number greater than 0.',
    transferSaved: 'Transfer has been recorded.',
    expenseSaved: 'Expense has been recorded.',
    incomeSaved: 'Income has been recorded.',
    
    // Validation
    requiredField: 'This field is required',
    invalidEmail: 'Please enter a valid email',
    passwordNotMatch: 'Passwords do not match',
    minLength: 'Minimum {length} characters required',
    
    // Months
    january: 'January',
    february: 'February',
    march: 'March',
    april: 'April',
    may: 'May',
    june: 'June',
    july: 'July',
    august: 'August',
    september: 'September',
    october: 'October',
    november: 'November',
    december: 'December',
    
    // Days
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday'
  },
  id: {
    // Common
    save: 'Simpan',
    cancel: 'Batal',
    back: 'Kembali',
    next: 'Selanjutnya',
    done: 'Selesai',
    loading: 'Memuat...',
    error: 'Kesalahan',
    success: 'Berhasil',
    warning: 'Peringatan',
    confirm: 'Konfirmasi',
    delete: 'Hapus',
    edit: 'Ubah',
    add: 'Tambah',
    search: 'Cari',
    noData: 'Tidak ada data',
    
    // Auth
    login: 'Masuk',
    register: 'Daftar',
    welcome: 'Selamat Datang',
    email: 'Email',
    password: 'Kata Sandi',
    confirmPassword: 'Konfirmasi Kata Sandi',
    forgotPassword: 'Lupa Kata Sandi?',
    verification: 'Verifikasi',
    createNewPassword: 'Buat Kata Sandi Baru',
    dontHaveAccount: 'Belum punya akun? ',
    alreadyHaveAccount: 'Sudah punya akun? ',
    loginSuccess: 'Berhasil masuk!',
    registerSuccess: 'Pendaftaran berhasil!',
    successLogin: 'Berhasil Masuk',
    successRegister: 'Pendaftaran Berhasil',
    successForgotPassword: 'Reset Kata Sandi Berhasil',
    
    // Main Tabs
    home: 'Beranda',
    transactions: 'Transaksi',
    targets: 'Target',
    installments: 'Cicilan',
    diagram: 'Diagram',
    profile: 'Profil',
    
    // Settings
    settings: 'Pengaturan',
    language: 'Bahasa',
    notifications: 'Aktifkan Notifikasi',
    notificationsOn: 'Notifikasi diaktifkan',
    notificationsOff: 'Notifikasi dimatikan',
    notificationsEnabledMessage: 'Notifikasi diaktifkan! Kamu akan menerima pengingat cicilan.',
    notificationsDisabledMessage: 'Notifikasi dimatikan. Kamu tidak akan menerima pengingat cicilan.',
    notificationToggleError: 'Terjadi kesalahan saat mengubah pengaturan notifikasi',
    reminderNotificationTitle: 'Pengingat Cicilan',
    reminderNotificationBody: 'Ini contoh notifikasi pengingat cicilan kamu.',
    notificationPermissionDenied: 'Izin notifikasi ditolak!',
    notificationsDeviceOnly: 'Notifikasi hanya bisa di perangkat fisik',
    logout: 'Keluar',
    confirmLogout: 'Apakah Anda yakin ingin keluar?',
    deleteData: 'Hapus Data',
    changePassword: 'Ubah Kata Sandi',
    theme: 'Tema',
    darkMode: 'Mode Gelap',
    lightMode: 'Mode Terang',
    
    // Transactions
    addTransaction: 'Tambah Transaksi',
    income: 'Pemasukan',
    expense: 'Pengeluaran',
    transfer: 'Transfer',
    amount: 'Jumlah',
    category: 'Kategori',
    date: 'Tanggal',
    description: 'Keterangan',
    totalTransactionFunds: 'Total dana transaksi :',
    transferFunds: 'Pindah Dana',
    transactionCount: 'Jumlah Transaksi',
    noTransactions: 'Belum ada transaksi',
    addFirstTransaction: 'Tambahkan transaksi pertama Anda hari ini',
    seeMore: 'Lihat Lainnya',
    seeLess: 'Tampilkan Lebih Sedikit',
    transactionHistory: 'Riwayat Transaksi',
    moneyOut: 'Uang Keluar',
    moneyIn: 'Uang Masuk',

    // App Screens
    applicationDescription: 'Deskripsi Aplikasi',
    updateTargetProgress: 'Perbarui Progress Target',
    updateInstallmentPayment: 'Perbarui Pembayaran Cicilan',
    yourFinancialGoals: 'Tujuan Keuangan Anda',
    manageAndTrackTargets: 'Atur dan pantau perkembangan target keuangan Anda.',
    manageInstallmentsTitle: 'Kelola Cicilan Anda',
    manageInstallmentsSubtitle: 'Atur dan Pantau semua cicilan dan jatuh temponya',
    financialAnalysisTitle: 'Analisis Keuangan',
    financialAnalysisSubtitle: 'Tinjau Pola Pengeluaran dan Pemasukan secara grafis',
    transactionsTodayTitle: 'Transaksi Anda hari ini :',
    transactionsOnDatePrefix: 'Transaksi Anda pada tanggal',
    
    // Targets
    addTarget: 'Tambah Target',
    targetName: 'Nama Target',
    targetAmount: 'Jumlah Target',
    currentAmount: 'Jumlah Saat Ini',
    deadline: 'Tenggat Waktu',
    collected: 'Terkumpul',
    remaining: 'Sisa',
    completed: 'Selesai',
    notCompleted: 'Belum Selesai',
    finish: 'Selesai',
    target: 'Target',
    targetsLabel: 'Target',
    notYetTargets: 'Belum Target',
    completedTargets: 'Sudah Target',
    totalTargetFundsLabel: 'Total dana target :',
    targetFulfilled: 'Target terpenuhi :',
    remainingTargetFunds: 'Sisa dana target :',
    yourTargets: 'Target Anda :',
    noTargetsYet: 'Belum Ada Target',
    createFirstTarget: 'Buat target keuangan pertama Anda hari ini',
    targetHistory: 'Riwayat Target',
    addNewTarget: 'Tambah Target Baru',
    
    // Installments
    addInstallment: 'Tambah Cicilan',
    installmentName: 'Nama Cicilan',
    totalAmount: 'Cicilan',
    paidAmount: 'Terbayar',
    remainingAmount: 'Sisa',
    dueDate: 'Jatuh Tempo',
    dueDate2: 'Tanggal target',
    paymentDate: 'Tanggal Pembayaran',
    installmentsLabel: 'Cicilan',
    unpaid: 'Belum Lunas',
    paid: 'Lunas',
    totalInstallmentFundsLabel: 'Total cicilan terpenuhi:',
    installmentsFulfilled: 'Cicilan terpenuhi :',
    remainingInstallments: 'Sisa cicilan :',
    yourInstallments: 'Cicilan anda :',
    noInstallmentsYet: 'Belum Ada Cicilan',
    addFirstInstallment: 'Tambahkan cicilan pertama Anda hari ini',
    installmentHistory: 'Riwayat Cicilan',
    addNewInstallment: 'Tambah Cicilan Baru',
    paidOff: 'Lunas',
    notPaidOff: 'Belum Lunas',
    paymentAmount: 'Jumlah Pembayaran',
    addPaymentForInstallment: 'Tambahkan pembayaran untuk:',
    chooseDate: 'Pilih tanggal',

    // Installment Alerts/Messages
    installmentNameAndAmountRequired: 'Nama cicilan dan jumlah cicilan wajib diisi.',
    installmentAmountMustBeValid: 'Jumlah cicilan harus berupa angka yang valid dan lebih dari 0',
    installmentAddedSuccess: 'Cicilan berhasil ditambahkan.',
    invalidInstallmentData: 'Data cicilan tidak valid',
    paymentAmountRequired: 'Jumlah pembayaran harus diisi',
    paymentAmountMustBeValid: 'Jumlah pembayaran harus berupa angka yang valid dan lebih dari 0',
    installmentPaymentAddedSuccess: 'Pembayaran cicilan berhasil ditambahkan',
    installmentUpdatedSuccess: 'Cicilan berhasil diperbarui.',
    installmentNameTotalDueRequired: 'Nama cicilan, total cicilan, dan jatuh tempo wajib diisi.',
    
    // Categories
    food: 'Makanan',
    transportation: 'Transportasi',
    shopping: 'Belanja',
    bills: 'Tagihan',
    entertainment: 'Hiburan',
    health: 'Kesehatan',
    education: 'Pendidikan',
    others: 'Lainnya',
    
    // Time
    today: 'Hari Ini',
    yesterday: 'Kemarin',
    thisWeek: 'Minggu Ini',
    thisMonth: 'Bulan Ini',
    lastMonth: 'Bulan Lalu',
    custom: 'Kustom',
    
    // Messages
    confirmDelete: 'Apakah Anda yakin ingin menghapus data ini?',
    dataDeleted: 'Data berhasil dihapus',
    changesSaved: 'Perubahan berhasil disimpan',
    somethingWentWrong: 'Terjadi kesalahan. Silakan coba lagi.',
    noInternet: 'Tidak ada koneksi internet',
    tryAgain: 'Coba Lagi',

    // Forms & Labels
    sourceOfFunds: 'Sumber Dana',
    destination: 'Tujuan',
    notes: 'Catatan',
    addNoteOptional: 'Tambah catatan (opsional)',
    ok: 'OK',
    fromDate: 'Dari tanggal :',
    toDate: 'Sampai tanggal :',
    transactionPeriod: 'Periode Transaksi :',
    exportPdf: 'Export Pdf',
    expenseSummary: 'Ringkasan Pengeluaran',
    noDataForPeriod: 'Tidak ada data pengeluaran untuk periode ini',
    totalOverallFunds: 'Total dana keseluruhan :',
    totalIncomeLabel: 'Total Pemasukan :',
    totalExpenseLabel: 'Total Pengeluaran :',
    balanceLabel: 'Saldo :',

    // Placeholders
    datePlaceholder: 'DD-MM-YYYY',

    // Target Form Labels
    targetNameLabel: 'Nama Target',
    targetAmountLabel: 'Jumlah Target',
    exampleTargetName: 'Contoh: Liburan ke Bali',
    exampleTargetAmount: 'Contoh: 5.000.000',

    // Target Screens Alerts/Messages
    targetNameAndAmountRequired: 'Nama target dan jumlah target wajib diisi.',
    targetAmountMustBeValid: 'Jumlah target harus berupa angka yang valid dan lebih dari 0.',
    targetAddedSuccess: 'Target berhasil ditambahkan.',
    amountRequired: 'Jumlah dana harus diisi',
    amountMustBeValid: 'Jumlah dana harus berupa angka yang valid dan lebih dari 0',
    progressUpdatedSuccess: 'Progress target berhasil diperbarui',
    addFundsForTarget: 'Tambahkan dana untuk target:',
    endDateMustBeAfterStartDate: 'Tanggal selesai harus sama atau setelah tanggal mulai.',

    // Screen Titles & Subtitles
    transferBalanceTitle: 'Transfer Saldo',
    transferBalanceSubtitle: 'Catat semua perpindahan dana antar rekening atau sumber dana yang kamu miliki.',
    expenseBalanceTitle: 'Pengeluaran Saldo',
    expenseBalanceSubtitle: 'Catat Semua pengeluaran yang kamu lakukan, seperti belanja, transportasi, atau kebutuhan lainnya',
    incomeBalanceTitle: 'Pemasukan Saldo',
    incomeBalanceSubtitle: 'Catat Semua pendapatan yang kamu terima, seperti gaji, bonus, atau sumber lainya',

    // Alerts
    requiredFieldsTransfer: 'Sumber dana, tujuan, dan jumlah wajib diisi.',
    requiredFieldsExpenseIncome: 'Kategori, sumber dana, dan jumlah wajib diisi.',
    invalidAmount: 'Jumlah harus berupa angka yang valid dan lebih dari 0',
    transferSaved: 'Transfer saldo berhasil dicatat.',
    expenseSaved: 'Pengeluaran berhasil dicatat.',
    incomeSaved: 'Pemasukan berhasil dicatat.',
    
    // Validation
    requiredField: 'Kolom ini wajib diisi',
    invalidEmail: 'Masukkan email yang valid',
    passwordNotMatch: 'Kata sandi tidak cocok',
    minLength: 'Minimal {length} karakter',
    
    // Months
    january: 'Januari',
    february: 'Februari',
    march: 'Maret',
    april: 'April',
    may: 'Mei',
    june: 'Juni',
    july: 'Juli',
    august: 'Agustus',
    september: 'September',
    october: 'Oktober',
    november: 'November',
    december: 'Desember',
    
    // Days
    monday: 'Senin',
    tuesday: 'Selasa',
    wednesday: 'Rabu',
    thursday: 'Kamis',
    friday: 'Jumat',
    saturday: 'Sabtu',
    sunday: 'Minggu'
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('id'); // Default to Indonesian

  useEffect(() => {
    loadLanguagePreference();
  }, []);

  const loadLanguagePreference = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('@language');
      if (savedLanguage) {
        setLanguage(savedLanguage);
      }
    } catch (error) {
      console.error('Error loading language preference:', error);
    }
  };

  const changeLanguage = async (newLanguage) => {
    try {
      await AsyncStorage.setItem('@language', newLanguage);
      setLanguage(newLanguage);
    } catch (error) {
      console.error('Error saving language preference:', error);
    }
  };

  const t = (key) => {
    return translations[language]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
