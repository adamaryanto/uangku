import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Switch, ImageBackground } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import CustomAlert from '../CustomAlert'; 
import PushNotification from 'react-native-push-notification';

// Komponen SettingItem (tetap sama)
const SettingItem = ({ icon, label, onPress, hasSwitch, switchValue, onSwitchChange }) => (
  <TouchableOpacity style={styles.settingItem} onPress={onPress} disabled={hasSwitch}>
    <View style={styles.settingItemContent}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons name={icon} size={24} color="#333" />
      </View>
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
  const [isLogoutAlertVisible, setIsLogoutAlertVisible] = useState(false); // <-- 2. Tambah state untuk modal

  const handleLogout = () => {
    // Logika untuk logout diletakkan di sini
    console.log("Pengguna keluar.");
    navigation.navigate('Login');
  };

   const handleToggleReminder = (newValue) => {
    setIsReminderEnabled(newValue);

    if (newValue) {
      // Jika toggle ON, kirim notifikasi lokal
      PushNotification.localNotification({
        channelId: "reminders-channel", // Pastikan sama dengan yang dibuat
        title: "Pengingat Diaktifkan",
        message: "Anda akan menerima notifikasi untuk pengingat penting.",
        playSound: true,
        soundName: "default",
      });
    } else {
      // Jika toggle OFF, Anda bisa membatalkan semua notifikasi terjadwal (opsional)
      PushNotification.cancelAllLocalNotifications();
      console.log("Pengingat dinonaktifkan dan notifikasi dibatalkan.");
    }
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
          {/* ... (SettingItem lain tetap sama) ... */}
          <SettingItem
            icon="translate"
            label="Pengaturan Bahasa"
            onPress={() => Alert.alert('Info', 'Fitur pengaturan bahasa akan segera hadir.')}
          />
          <SettingItem
            icon="bell-ring-outline"
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

          {/* Tombol Logout sekarang hanya memunculkan modal */}
          <TouchableOpacity style={styles.logoutButton} onPress={() => setIsLogoutAlertVisible(true)}>
            <MaterialCommunityIcons name="logout" size={24} color="white" style={styles.icon} />
            <Text style={styles.logoutButtonText}>Keluar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* 3. Panggil CustomAlert di sini */}
      <CustomAlert 
        visible={isLogoutAlertVisible}
        onClose={() => setIsLogoutAlertVisible(false)}
        title="Apakah Anda yakin ingin keluar?"
        onConfirm={handleLogout}
      />
    </SafeAreaView>
  );
};

// Styles (tetap sama)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },
  headerContainer: {
    backgroundColor: '#005AE0',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 180,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
  },
  contentContainer: {
    flex: 1,
    marginTop: -130,
    paddingHorizontal: 20,
  },
  settingItem: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 1,
  },
  iconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
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
    backgroundColor: '#FF4560',
    borderRadius: 5,
    paddingVertical: 15,
    paddingHorizontal: 20,
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