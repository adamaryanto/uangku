import React from 'react';
// --- DIUBAH --- Menambahkan 'ImageBackground' dan menghapus 'Dimensions'
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, ImageBackground } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// --- DIHAPUS --- Semua logika untuk membuat lingkaran dinamis sudah tidak diperlukan.
// const { width, height } = Dimensions.get('window');
// const generateCircles = (numCircles) => { ... };


const ApplicationDescriptionScreen = ({ navigation }) => {
  return (
    // --- DIUBAH --- Komponen terluar sekarang adalah ImageBackground
    <ImageBackground
      // Pastikan Anda punya gambar 'background.png' atau ganti dengan nama file Anda
      source={require('../assets/image.png')} 
      style={styles.container}
    >
      <SafeAreaView style={styles.content}>
        <StatusBar style="light" />

        <Image
          source={require('../assets/orang.png')} // Ganti dengan path ilustrasi Anda
          style={styles.illustration}
        />

        <View style={styles.textContainer}>
          <Text style={styles.title}>
            Selamat Datang {'\n'}Di <Text style={styles.textSpan}>Uangku</Text>
          </Text>

          <View style={styles.taglineContainer}>
            <Text style={styles.tagline}>Satu Aplikasi untuk Semua Urusan Keuanganmu.</Text>
            <View style={styles.underline} />
          </View>

          <Text style={styles.description}>
            Kelola transaksi, cicilan, target tabungan, hingga grafik keuangan — semua dalam satu tempat yang rapi dan mudah.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.buttonText}>Lanjut  →</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // --- DIHAPUS --- backgroundColor sudah tidak diperlukan.
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: 20,
  },
  illustration: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
    marginTop: 40,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  textSpan: {
    color: '#F5A623', // Warna oranye/emas
  },
  taglineContainer: {
    alignItems: 'center',
    marginBottom: 20,
    textAlign:'center',
  },
  tagline: {
    fontSize: 16,
    color: 'white',
    fontStyle: 'italic',
  },
  underline: {
    height: 2,
    width: '100%',
    backgroundColor: '#F5A623',
    marginTop: 2,
  },
  description: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 20,
  },
  button: {
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 40,
    marginBottom: 40,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ApplicationDescriptionScreen;