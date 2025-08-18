import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, ImageBackground, ScrollView, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { API_BASE } from '../../config/api';
import { Portal, Snackbar, useTheme } from 'react-native-paper';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('error');
  const theme = useTheme();

  const showAlert = (message, type = 'error') => {
    setAlertMessage(message);
    setAlertType(type);
    setVisible(true);
  };

  const hideAlert = () => setVisible(false);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSendCode = async () => {
    if (!email) {
      showAlert('Mohon masukkan alamat email Anda', 'error');
      return;
    }

    if (!validateEmail(email)) {
      showAlert('Format email tidak valid. Gunakan format: user@example.com', 'error');
      return;
    }

    setLoading(true);
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
        throw new Error(data.message || 'Gagal mengirim kode OTP');
      }

      showAlert('Kode OTP telah dikirim ke email Anda', 'success');
      // Navigate to verification screen after a short delay
      setTimeout(() => {
        navigation.navigate('Verification', { email });
      }, 1500);
      
    } catch (error) {
      console.error('Error sending OTP:', error);
      showAlert(error.message || 'Terjadi kesalahan. Silakan coba lagi nanti.', 'error');
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
        {/* --- BARU --- Header Kustom untuk Tombol Kembali --- */}
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
              <Text style={styles.title}>Reset password</Text>
              <Text style={styles.description}>
                Masukkan email yang terdaftar untuk menerima kode verifikasi. Kami akan mengirimkan OTP ke email kamu.
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Masukan email..."
                placeholderTextColor="#A9A9A9"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />

              <TouchableOpacity 
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleSendCode}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.buttonText}>Kirim Kode</Text>
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
  // --- BARU --- Style untuk Header Kustom ---
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
  // --- AKHIR STYLE BARU ---
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  mainContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  formCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    width: '112%',
    height:'100%',
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
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 25,
    width: '100%',
  },
  button: {
    backgroundColor: '#005AE0',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ForgotPasswordScreen;