import React, { useState } from 'react';

import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, Image, ImageBackground } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';



const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleLogin = ()=> {
    if(!email || !password){
      alert('error', 'Mohon isi semua')
      return
    }

    console.log('login dengan email:', email,'dan password:', password)
    navigation.navigate('SuccessLoginScreen', { userEmail: email });
  }
  return (
    
    <ImageBackground
      source={require('../../assets/image.png')} 
      style={styles.container}
    >
      {/* Bungkus semua konten dengan SafeAreaView agar tidak kena notch/statusbar */}
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />

        <View style={styles.mainContent}>

          <View style={styles.logoContainer}>
            <Image 
              source={require('../../assets/logo uangku-PUTIH-02.png')}
              style={styles.logo}
            />
          </View>
        
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Masuk</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Masukan email..."
              placeholderTextColor="#A9A9A9"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

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

            <TouchableOpacity onPress={()=> navigation.navigate('ForgotPassword')}>
              <Text style={styles.forgotPasswordText}>Lupa password?</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.loginButton}
                onPress={() => handleLogin()}
            >
              <Text style={styles.loginButtonText}>Masuk</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.registerContainer}
            onPress={() => navigation.navigate('Register')}
            >
              <Text style={styles.registerText}>
                Belum punya akun? <Text style={styles.registerLink}>Daftar sekarang</Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.googleButton}>
              <Image 
                source={require('../../assets/search.png')}
                style={styles.googleIcon}
              />
              <Text style={styles.googleButtonText}>Masuk dengan Google</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // --- DIHAPUS --- backgroundColor sudah tidak diperlukan, karena diatur oleh gambar.
  },
  safeArea: {
    flex: 1,
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
    marginBottom: 10,
    paddingHorizontal: 15,
  },
  inputPassword: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  forgotPasswordText: {
    textAlign: 'right',
    color: '#005AE0',
    marginBottom: 25,
  },
  loginButton: {
    backgroundColor: '#005AE0',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  registerText: {
    color: '#A9A9A9',
  },
  registerLink: {
    color: '#005AE0',
    fontWeight: 'bold',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingVertical: 15,
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  googleButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default LoginScreen;