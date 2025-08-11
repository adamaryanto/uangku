import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Switch, Alert,ImageBackground } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Komponen reusable untuk setiap baris pengaturan
const SettingItem = ({ icon, label, onPress, hasSwitch, switchValue, onSwitchChange }) => (
  <TouchableOpacity style={styles.settingItem} onPress={onPress} disabled={hasSwitch}>
    <View style={styles.settingItemContent}>
      <MaterialCommunityIcons name={icon} size={24} color="#333" style={styles.icon} />
      <Text style={styles.settingLabel}>{label}</Text>
    </View>
    {hasSwitch && (
      <Switch
        trackColor={{ false: "#767577", true: "#005AE0" }}
        thumbColor={switchValue ? "#f4f3f4" : "#f4f3f4"}
        onValueChange={onSwitchChange}
        value={switchValue}
      />
    )}
  </TouchableOpacity>
);

const PengaturanScreen = ({ navigation }) => {
  const [isReminderEnabled, setIsReminderEnabled] = useState(false);

  const handleLogout = () => {
    // Tampilkan konfirmasi sebelum keluar
    Alert.alert(
      "Keluar",
      "Apakah Anda yakin ingin keluar dari akun Anda?",
      [
        {
          text: "Batal",
          style: "cancel"
        },
        { 
          text: "Keluar", 
          onPress: () => {
            // Di aplikasi nyata, di sini Anda akan membersihkan data sesi
            // dan mengarahkan pengguna kembali ke alur login.
            console.log("Pengguna keluar.");
            navigation.navigate('Login'); // Arahkan ke Login
          },
          style: 'destructive'
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ScrollView>
      {/* Header */}
              <ImageBackground
                source={require('../../assets/image.png')}
                style={styles.headerContainer}
                imageStyle={{ borderBottomLeftRadius: 25, borderBottomRightRadius: 25 }}
              >
                <Text style={styles.headerTitle}>Pusat Akun Anda</Text>
                <Text style={styles.headerSubtitle}>
                Akses lengkap pengaturan akun dan preferensi Anda.
                </Text>
              </ImageBackground>

      <View style={styles.contentContainer}>
          <SettingItem
            icon="web"
            label="Pengaturan Bahasa"
            onPress={() => Alert.alert('Info', 'Fitur pengaturan bahasa akan segera hadir.')}
          />
          <SettingItem
            icon="bell-outline"
            label="Aktifkan Pengingat"
            hasSwitch={true}
            switchValue={isReminderEnabled}
            onSwitchChange={() => setIsReminderEnabled(previousState => !previousState)}
          />
          <SettingItem
            icon="trash-can-outline"
            label="Hapus data"
            onPress={() => Alert.alert('Peringatan', 'Fitur hapus data akan segera hadir.')}
          />
          <SettingItem
            icon="lock-reset"
            label="Ubah Sandi"
            onPress={() => Alert.alert('Info', 'Fitur ubah sandi akan segera hadir.')}
          />

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <MaterialCommunityIcons name="logout" size={24} color="white" style={styles.icon} />
            <Text style={styles.logoutButtonText}>Keluar</Text>
          </TouchableOpacity>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },
  headerContainer: {
    backgroundColor: '#005AE0',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 90,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginTop:15,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
  },
  // --- STYLE YANG DIRAPIKAN ---
  contentContainer: {
    flex: 1,
    marginTop: 20,
    paddingHorizontal: 20,
    
    // Properti yang tidak perlu dihapus
  },
  settingItem: {
    backgroundColor: 'white',
    borderRadius: 5,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  settingItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 15,
  },
  settingLabel: {
    fontSize: 15,
    color: '#333',
  },
  logoutButton: {
    backgroundColor: '#FF4560', // Merah
    borderRadius: 5,
    paddingVertical: 15,
    paddingHorizontal: 20,
     // Beri jarak dari item terakhir
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'start',
    elevation: 2,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PengaturanScreen;
