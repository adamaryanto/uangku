import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, ImageBackground, ScrollView, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { API_BASE } from '../../config/api';
import { Portal, Snackbar, useTheme } from 'react-native-paper';

const CreateNewPasswordScreen = ({ route, navigation }) => {
  const confirmPasswordInput = useRef(null);
  const { email, resetToken } = route.params;
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
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

  const validatePassword = (pwd) => {
    return pwd.length >= 6;
  };

  const handleSavePassword = async () => {
    // Validate inputs
    if (!password || !confirmPassword) {
      showAlert('Semua kolom harus diisi', 'error');
      return;
    }
    
    if (password !== confirmPassword) {
      showAlert('Kata sandi dan konfirmasi kata sandi tidak cocok', 'error');
      return;
    }
    
    if (!validatePassword(password)) {
      showAlert('Kata sandi harus minimal 6 karakter','error');
      return;
    }

    setLoading(true);
    
    try {
      console.log('Sending password reset request...');
      console.log('Email:', email);
      console.log('Token:', resetToken);
      
      const response = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.toLowerCase(),
          token: resetToken,
          newPassword: password,
        }),
      });

      const data = await response.json();
      console.log('Reset password response:', data);
      
      if (!response.ok) {
        throw new Error(data.message || 'Gagal mengatur ulang kata sandi');
      }

      // Show success message and navigate to login
      showAlert('Kata sandi berhasil diubah! Mengarahkan ke halaman login...', 'success');
      
      // Navigate to login after a short delay
      setTimeout(() => {
        navigation.navigate('Login');
      }, 3000);
      
    } catch (error) {
      console.error('Error resetting password:', error);
      showAlert(error.message || 'Terjadi kesalahan. Silakan coba lagi nanti.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Check if email and resetToken are available
  useEffect(() => {
    if (!email || !resetToken) {
      showAlert('Sesi tidak valid. Silakan ulangi proses reset password.', 'error');
      setTimeout(() => {
        navigation.navigate('ForgotPassword');
      }, 2000);
    }
  }, []);

  return (
    <ImageBackground
      source={require('../../assets/image.png')} 
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerContainer}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <MaterialCommunityIcons name="chevron-left" size={32} color="white" />
            <Text style={styles.backButtonText}>Kembali</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <StatusBar style="light" />
          <View style={styles.mainContent}>
            <View style={styles.formCard}>
              <Text style={styles.title}>Buat Kata Sandi Baru</Text>
              <Text style={styles.description}>
                Masukkan kata sandi baru yang kuat untuk akun {email}
              </Text>

              {/* Input Password Baru */}
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.inputPassword}
                  placeholder="Kata Sandi Baru..."
                  placeholderTextColor="#A9A9A9"
                  secureTextEntry={!isPasswordVisible}
                  value={password}
                  onChangeText={setPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="default"
                  returnKeyType="next"
                  onSubmitEditing={() => {
                    confirmPasswordInput.current?.focus();
                  }}
                  blurOnSubmit={false}
                  editable={!loading}
                />
                <TouchableOpacity 
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                  disabled={loading}
                >
                  <MaterialCommunityIcons 
                    name={isPasswordVisible ? "eye-off" : "eye"} 
                    size={24} 
                    color={loading ? "#CCCCCC" : "#A9A9A9"} 
                  />
                </TouchableOpacity>
              </View>

              {/* Input Konfirmasi Password */}
              <View style={styles.passwordContainer}>
                <TextInput
                  ref={confirmPasswordInput}
                  style={styles.inputPassword}
                  placeholder="Konfirmasi Kata Sandi..."
                  placeholderTextColor="#A9A9A9"
                  secureTextEntry={!isConfirmPasswordVisible}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="default"
                  returnKeyType="done"
                  onSubmitEditing={handleSavePassword}
                  editable={!loading}
                />
                <TouchableOpacity 
                  onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                  disabled={loading}
                >
                  <MaterialCommunityIcons 
                    name={isConfirmPasswordVisible ? "eye-off" : "eye"} 
                    size={24} 
                    color={loading ? "#CCCCCC" : "#A9A9A9"} 
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleSavePassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.buttonText}>Simpan Kata Sandi</Text>
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    marginBottom: 20,
    paddingHorizontal: 15,
    width: '100%',
  },
  inputPassword: {
    flex: 1,
    color:'#000000',
    paddingVertical: 14,
    fontSize: 16,
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
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CreateNewPasswordScreen;