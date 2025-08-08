import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, Alert, ImageBackground, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const CreateNewPasswordScreen = ({ navigation }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  const handleSavePassword = () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Semua kolom harus diisi.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Kata sandi dan konfirmasi kata sandi tidak cocok.');
      return;
    }
    // Di aplikasi nyata, di sini Anda akan memanggil API
    // untuk menyimpan password baru ke database.
    console.log('Menyimpan password baru:', newPassword);
    navigation.navigate('SuccesForgotPassword') 
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
              <Text style={styles.title}>Buat Kata Sandi Baru</Text>
              <Text style={styles.description}>
                Masukkan kata sandi baru yang kuat dan mudah diingat. Jangan bagikan ke siapa pun.
              </Text>

              {/* Input Password Baru */}
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.inputPassword}
                  placeholder="Kata Sandi Baru..."
                  placeholderTextColor="#A9A9A9"
                  secureTextEntry={!isNewPasswordVisible}
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
                <TouchableOpacity onPress={() => setIsNewPasswordVisible(!isNewPasswordVisible)}>
                  <MaterialCommunityIcons 
                    name={isNewPasswordVisible ? "eye-off" : "eye"} 
                    size={24} 
                    color="#A9A9A9" 
                  />
                </TouchableOpacity>
              </View>

              {/* Input Konfirmasi Password */}
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.inputPassword}
                  placeholder="Konfirmasi Kata Sandi..."
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

              <TouchableOpacity 
                  style={styles.button}
                  onPress={handleSavePassword}
              >
                {/* Teks tombol disesuaikan agar lebih relevan */}
                <Text style={styles.buttonText}>Simpan Kata Sandi</Text>
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
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CreateNewPasswordScreen;