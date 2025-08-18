import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, Image, ImageBackground, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { API_BASE } from '../../config/api';
import { Portal, Snackbar, useTheme } from 'react-native-paper';

const RegistrasiScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');  
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
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

  const handleRegister = async () => {
    if(!fullName || !email || !password || !confirmPassword) {
      showAlert('Mohon isi semua kolom yang tersedia', 'error');
      return;
    }

    if (fullName.length < 3) {
      showAlert('Nama lengkap minimal 3 karakter', 'error');
      return;
    }

    if (!validateEmail(email)) {
      showAlert('Format email tidak valid. Gunakan format: user@example.com', 'error');
      return;
    }

    if (password.length < 6) {
      showAlert('Password minimal harus 6 karakter', 'error');
      return;
    }

    if(password !== confirmPassword) {
      showAlert('Konfirmasi password tidak cocok', 'error');
      return;
    }

    if (!/\d/.test(password) || !/[a-zA-Z]/.test(password)) {
      showAlert('Password harus mengandung huruf dan angka', 'error');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        const msg = data?.message || 'Pendaftaran gagal. Email mungkin sudah terdaftar.';
        showAlert(msg, 'error');
        return;
      }
      showAlert('Pendaftaran berhasil! Mengarahkan ke halaman login...', 'success');
      setTimeout(() => {
        navigation.navigate('SuccessRegisScreen');
      }, 2000);
    } catch (e) {
      console.error('Register error', e);
      showAlert('Gagal terhubung ke server. Pastikan koneksi internet Anda stabil.', 'error');
    }
  }

  return (
    <ImageBackground
      source={require('../../assets/image.png')} 
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* ScrollView agar form tidak tertutup keyboard saat di HP kecil */}
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <StatusBar style="light" />

            <View style={styles.mainContent}>
              <View style={styles.logoContainer}>
                <Image 
                  source={require('../../assets/uangkuPutih.png')}
                  style={styles.logo}
                />
              </View>
            
              <View style={styles.formCard}>
                <Text style={styles.formTitle}>Daftar Akun</Text>
                
                {/* Input Nama Lengkap */}
                <TextInput
                  style={styles.input}
                  placeholder="Masukan nama lengkap..."
                  placeholderTextColor="#A9A9A9"
                  value={fullName}
                  onChangeText={setFullName}
                />

                {/* Input Email */}
                <TextInput
                  style={styles.input}
                  placeholder="Masukan email..."
                  placeholderTextColor="#A9A9A9"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />

                {/* Input Password */}
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.inputPassword}
                    placeholder="Masukan password..."
                    placeholderTextColor="#A9A9A9"
                    secureTextEntry={!isPasswordVisible}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                    <MaterialCommunityIcons 
                      name={isPasswordVisible ? "eye-off" : "eye"} 
                      size={24} 
                      color="#A9A9A9" 
                    />
                  </TouchableOpacity>
                </View>

                {/* Input Konfirmasi Password */}
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.inputPassword}
                    placeholder="Konfirmasi password..."
                    placeholderTextColor="#A9A9A9"
                    secureTextEntry={!isConfirmPasswordVisible}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
                  <TouchableOpacity onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}>
                    <MaterialCommunityIcons 
                      name={isConfirmPasswordVisible ? "eye-off" : "eye"} 
                      size={24} 
                      color="#A9A9A9" 
                    />
                  </TouchableOpacity>
                </View>

                {/* Tombol Daftar */}
                <TouchableOpacity 
                    style={styles.loginButton}
                    onPress={() => {
                      handleRegister()
                    }}
                >
                  <Text style={styles.loginButtonText}>Daftar</Text>
                </TouchableOpacity>

                {/* Link untuk Masuk */}
                <TouchableOpacity style={styles.registerContainer} onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.registerText}>
                    Sudah punya akun? <Text style={styles.registerLink}>Masuk di sini</Text>
                  </Text>
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

// Stylesheet ini sebagian besar sama dengan LoginScreen untuk konsistensi
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  // Style baru untuk ScrollView
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  mainContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 150,
    height: 50,
    resizeMode:'contain',
  },
  formCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    width: '100%',
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#005AE0',
    textAlign: 'center',
    marginBottom: 25,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    marginBottom: 15, // Disesuaikan jaraknya
    paddingHorizontal: 15,
  },
  inputPassword: {
    flex: 1,
    color:'#000000',
    paddingVertical: 12,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#005AE0',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 15, // Disesuaikan jaraknya
    marginBottom: 20,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerContainer: {
    alignItems: 'center',
  },
  registerText: {
    color: '#A9A9A9',
  },
  registerLink: {
    color: '#005AE0',
    fontWeight: 'bold',
  },
});

export default RegistrasiScreen;