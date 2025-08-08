import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, Alert, ImageBackground, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const VerificationScreen = ({ route, navigation }) => {
  // Mengambil email yang dikirim dari layar sebelumnya
  const { email } = route.params; 

  // State untuk menyimpan 6 digit OTP
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  // Refs untuk mengontrol fokus setiap input
  const inputRefs = useRef([]);

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

  const handleVerifyCode = () => {
    const code = otp.join('');
    if (code.length !== 6) {
      Alert.alert('Error', 'Mohon masukkan 6 digit kode verifikasi.');
      return;
    }
    // Di aplikasi nyata, di sini Anda akan memanggil API
    // untuk memverifikasi kode OTP.
    console.log('Memverifikasi kode:', code);
    navigation.navigate('CreateNewPassword');
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
                  style={styles.button}
                  onPress={handleVerifyCode}
              >
                <Text style={styles.buttonText}>Verifikasi kode</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
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
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default VerificationScreen;