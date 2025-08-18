import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, ImageBackground, ScrollView, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { API_BASE } from '../../config/api';
import { Portal, Snackbar, useTheme } from 'react-native-paper';

const VerificationScreen = ({ route, navigation }) => {
  // Mengambil email yang dikirim dari layar sebelumnya
  const { email } = route.params; 
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('error');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const theme = useTheme();

  // State untuk menyimpan 6 digit OTP
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  // Refs untuk mengontrol fokus setiap input
  const inputRefs = useRef([]);

  // Countdown timer for resend OTP
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const showAlert = (message, type = 'error') => {
    setAlertMessage(message);
    setAlertType(type);
    setVisible(true);
  };

  const hideAlert = () => setVisible(false);

  const handleResendOTP = async () => {
    if (!canResend) return;
    
    setResendLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Gagal mengirim ulang kode OTP');
      }

      // Reset countdown
      setCountdown(60);
      setCanResend(false);
      showAlert('Kode OTP baru telah dikirim ke email Anda', 'success');
      
    } catch (error) {
      console.error('Error resending OTP:', error);
      showAlert(error.message || 'Terjadi kesalahan. Silakan coba lagi nanti.', 'error');
    } finally {
      setResendLoading(false);
    }
  };

  const handleOtpChange = (text, index) => {
    // Hanya izinkan satu digit angka
    if (!/^\d*$/.test(text)) return;

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Pindahkan fokus ke input selanjutnya jika digit dimasukkan
    if (text && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e, index) => {
    // Pindahkan fokus ke input sebelumnya jika backspace ditekan pada input kosong
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerifyCode = async () => {
    const code = otp.join('');
    if (code.length !== 6) {
      showAlert('Mohon masukkan 6 digit kode verifikasi', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          otp: code 
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Gagal memverifikasi kode OTP');
      }

      // Navigate to create new password screen with reset token
      navigation.navigate('CreateNewPassword', { 
        email,
        resetToken: data.resetToken 
      });
      
    } catch (error) {
      console.error('Error verifying OTP:', error);
      showAlert(error.message || 'Kode OTP tidak valid atau sudah kedaluwarsa', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/image.png')} 
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="chevron-left" size={32} color="white" />
            <Text style={styles.backButtonText}>Kembali</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <StatusBar style="light" />
          <View style={styles.mainContent}>
            <View style={styles.formCard}>
              <Text style={styles.title}>Masukkan Kode Verifikasi</Text>
              <Text style={styles.description}>
                Kami telah mengirimkan kode 6 digit ke email <Text style={styles.emailText}>{email}</Text>. Silakan masukkan kode tersebut untuk melanjutkan.
              </Text>
              
              <TouchableOpacity 
                onPress={handleResendOTP} 
                disabled={!canResend || resendLoading}
                style={styles.resendContainer}
              >
                {resendLoading ? (
                  <ActivityIndicator size="small" color="#005AE0" />
                ) : (
                  <Text style={[styles.resendText, canResend && styles.resendTextActive]}>
                    Kirim ulang kode {!canResend && `(${countdown} detik)`}
                  </Text>
                )}
              </TouchableOpacity>

              {/* Kontainer untuk 6 kotak input OTP */}
              <View style={styles.otpContainer}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={ref => inputRefs.current[index] = ref}
                    style={styles.otpInput}
                    keyboardType="number-pad"
                    maxLength={1}
                    value={digit}
                    onChangeText={(text) => handleOtpChange(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                  />
                ))}
              </View>

              <TouchableOpacity 
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleVerifyCode}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.buttonText}>Verifikasi Kode</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
      <Portal>
        <Snackbar
          visible={visible}
          onDismiss={hideAlert}
          duration={4000}
          style={{
            backgroundColor: alertType === 'error' ? '#FF4444' : '#4CAF50',
            marginBottom: 20,
            marginHorizontal: 10,
            borderRadius: 8,
          }}
          action={{
            label: 'Tutup',
            onPress: hideAlert,
            labelStyle: { color: 'white', fontWeight: 'bold' }
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons 
              name={alertType === 'error' ? 'alert-circle' : 'check-circle'}
              size={20} 
              color="white"
              style={{ marginRight: 8 }}
            />
            <Text style={{ color: 'white', flex: 1 }}>{alertMessage}</Text>
          </View>
        </Snackbar>
      </Portal>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 10,
    paddingTop: 90,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 5,
    
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    width: '100%',
  },
  mainContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  formCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    width: '113%',
    height: '100%',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#005AE0',
    marginBottom: 15,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
    marginBottom: 30,
    textAlign: 'center',
  },
  emailText: {
    fontWeight: 'bold',
    color: '#333',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 30,
  },
  otpInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    width: 45,
    height: 55,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#005AE0',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  resendContainer: {
    marginTop: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  resendText: {
    color: '#999',
    fontSize: 14,
  },
  resendTextActive: {
    color: '#005AE0',
    fontWeight: '600',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default VerificationScreen;