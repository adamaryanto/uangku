import React, { useEffect } from 'react';
import { View, StyleSheet, Image, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const SplashScreen = ({ navigation }) => {

  useEffect(() => {
    // Atur timer untuk pindah ke halaman selanjutnya setelah 3 detik
    const timer = setTimeout(() => {
      // Gunakan 'replace' agar pengguna tidak bisa kembali ke splash screen
      navigation.replace('ApplicationDescription'); 
    }, 3000); // 3000 milidetik = 3 detik

    // Bersihkan timer jika komponen di-unmount sebelum waktunya
    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <Image
        // Pastikan Anda memiliki file logo ini di assets
        source={require('../assets/uangkuPutih.png')}
        style={styles.logo}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#005AE0', // Warna biru solid
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 200, // Sesuaikan ukuran logo Anda
    height: 100,
    resizeMode: 'contain',
  },
});

export default SplashScreen;
