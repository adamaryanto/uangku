import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ImageBackground, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const WelcomeScreen = ({ navigation,route }) => {
  // Di dalam GreetingScreen.js
    
  const email = route.params?.email || ''; 
  const namePart = email ? email.split('@')[0] : 'Pengguna';
  const displayName = namePart.charAt(0).toUpperCase() + namePart.slice(1);

  return (
    <ImageBackground
      source={require('../assets/image.png')} 
      style={styles.container}
    >
      <SafeAreaView style={styles.contentContainer}>
        <StatusBar style="light" />
        
        <View style={styles.mainContent}>
            <Text style={styles.title}>Hallo {displayName}</Text>
            <Text style={styles.subtitle}>
            Ayo atur keuanganmu dengan lebih bijak hari ini.
            </Text>
        </View>

        {/* Tombol Lanjut diposisikan di bawah */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.replace('MainTabs')} 
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
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between', 
    alignItems: 'center',
    padding: 20,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center', 
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 15,
    lineHeight: 26,
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

export default WelcomeScreen;