import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ImageBackground } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const SuccesForgotPassword = ({ navigation }) => {
  const animationRef = useRef(null);

  useEffect(() => {
    // Putar animasi
    animationRef.current?.play();

    // Atur timer untuk pindah ke halaman utama setelah 2.5 detik
    const timer = setTimeout(() => {
      navigation.replace('Login'); 
    }, 2500); 

    // Bersihkan timer jika komponen di-unmount sebelum waktunya
    return () => clearTimeout(timer);
  }, []);

  return (
    <ImageBackground 
    source={require('../../assets/image.png')} // Pastikan path ini benar
    style={styles.container}
    >
        
    <SafeAreaView style={styles.contentContainer}>
      <StatusBar style="light" />
      
      <MaterialCommunityIcons
          name="check-decagram" // Nama ikon yang mirip dengan gambar
          size={120} // Ukuran ikon diperbesar
          color="white"
          style={styles.icon}
        />

      <Text style={styles.successText}>Kata Sandi Berhasil Di Ubah</Text>
    </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    marginBottom: 10, // Memberi sedikit jarak ke teks di bawahnya
  },
  successText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 20,
  },
});

export default SuccesForgotPassword;