import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Switch, ImageBackground, Modal, Animated, Easing, Alert, Platform } from 'react-native';
import { useLanguage } from '../../contexts/LanguageContext';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import CustomAlert from '../CustomAlert';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

// Konfigurasi supaya notif tampil di foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Komponen SettingItem
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
        thumbColor="#f4f3f4"
        onValueChange={onSwitchChange}
        value={switchValue}
      />
    )}
  </TouchableOpacity>
);

// Komponen Notification Alert
const NotificationAlert = ({ visible, message, type, onClose }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(-100));

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        onClose();
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(-100);
    }
  }, [visible]);

  if (!visible) return null;

  const backgroundColor = type === 'success' ? '#4CAF50' : '#F44336';

  return (
    <Animated.View 
      style={[
        styles.alertContainer,
        { 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          backgroundColor,
        }
      ]}
    >
      <MaterialCommunityIcons
        name={type === 'success' ? 'check-decagram' : 'alert-circle'}
        size={20}
        color="#fff"
      />
      <Text style={styles.alertText}>{message}</Text>
    </Animated.View>
  );
};

const PengaturanScreen = ({ navigation }) => {
  const { t, language, changeLanguage } = useLanguage();
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [isReminderEnabled, setIsReminderEnabled] = useState(false);
  const [isLogoutAlertVisible, setIsLogoutAlertVisible] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success'); // 'success' or 'error'

  const handleLogout = () => {
    console.log("Pengguna keluar.");
    navigation.navigate('Login');
  };

  const handleToggleReminder = async (newValue) => {
    try {
      setIsReminderEnabled(newValue);

      if (newValue) {
        // Aktifkan notif → minta izin dan kirim notif test
        const token = await registerForPushNotificationsAsync(t);
        if (token) {
          console.log('Expo Push Token:', token);

          // Kirim notif test lokal
          await Notifications.scheduleNotificationAsync({
            content: {
              title: t('reminderNotificationTitle'),
              body: t('reminderNotificationBody'),
              sound: "default",
            },
            trigger: null, // null = kirim langsung
          });
          
          setAlertMessage(t('notificationsEnabledMessage'));
          setAlertType('success');
        }
      } else {
        setAlertMessage(t('notificationsDisabledMessage'));
        setAlertType('error');
      }
      setShowAlert(true);
    } catch (error) {
      console.error('Error toggling notification:', error);
      setAlertMessage(t('notificationToggleError'));
      setAlertType('error');
      setShowAlert(true);
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
          <Text style={styles.headerTitle}>{t('settings')}</Text>
          <Text style={styles.headerSubtitle}>
            {language === 'id' 
              ? 'Akses lengkap pengaturan akun dan preferensi Anda.'
              : 'Full access to your account settings and preferences.'}
          </Text>
        </ImageBackground>

        <View style={styles.contentContainer}>
          <SettingItem
            icon="translate"
            label={t('language')}
            onPress={() => setShowLanguageModal(true)}
          />
          <SettingItem
            icon="bell-ring-outline"
            label={t('notifications')}
            hasSwitch={true}
            switchValue={isReminderEnabled}
            onSwitchChange={() => handleToggleReminder(!isReminderEnabled)}
          />
          <SettingItem
            icon="trash-can-outline"
            label={t('deleteData')}
            onPress={() => Alert.alert('Peringatan', 'Fitur hapus data akan segera hadir.')}
          />
          <SettingItem
            icon="lock-reset"
            label={t('changePassword')}
            onPress={() => Alert.alert('Info', 'Fitur ubah sandi akan segera hadir.')}
          />

          {/* Tombol Logout */}
          <TouchableOpacity style={styles.logoutButton} onPress={() => setIsLogoutAlertVisible(true)}>
            <MaterialCommunityIcons name="logout" size={24} color="white" style={styles.icon} />
            <Text style={styles.logoutButtonText}>Keluar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Alert Logout */}
      <CustomAlert
        visible={isLogoutAlertVisible}
        onClose={() => setIsLogoutAlertVisible(false)}
        title={t('confirmLogout')}
        onConfirm={handleLogout}
      />

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('language')}</Text>
            
            <TouchableOpacity 
              style={[styles.languageOption, language === 'id' && styles.selectedLanguage]}
              onPress={() => {
                changeLanguage('id');
                setShowLanguageModal(false);
              }}
            >
              <Text style={styles.languageText}>Bahasa Indonesia</Text>
              {language === 'id' && <MaterialCommunityIcons name="check" size={24} color="#005AE0" />}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.languageOption, language === 'en' && styles.selectedLanguage]}
              onPress={() => {
                changeLanguage('en');
                setShowLanguageModal(false);
              }}
            >
              <Text style={styles.languageText}>English</Text>
              {language === 'en' && <MaterialCommunityIcons name="check" size={24} color="#005AE0" />}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setShowLanguageModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      <NotificationAlert 
        visible={showAlert}
        message={alertMessage}
        type={alertType}
        onClose={() => setShowAlert(false)}
      />
    </SafeAreaView>
  );
};

async function registerForPushNotificationsAsync(t) {
  let token;

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      Alert.alert(t('warning'), t('notificationPermissionDenied'));
      return null;
    }

    token = (await Notifications.getExpoPushTokenAsync()).data;
  } else {
    Alert.alert(t('warning'), t('notificationsDeviceOnly'));
    return null;
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  return token;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F8' },
  headerContainer: {
    backgroundColor: '#005AE0',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 180,
  },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: 'white' },
  headerSubtitle: { fontSize: 15, color: 'rgba(255, 255, 255, 0.8)', marginTop: 5 },
  alertContainer: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    elevation: 5,
    zIndex: 1000,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  alertText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 10,
    flex: 1,
  },
  contentContainer: { flex: 1, marginTop: -130, paddingHorizontal: 20 },
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
  iconContainer: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  settingItemContent: { flexDirection: 'row', alignItems: 'center' },
  icon: { marginRight: 15 },
  settingLabel: { fontSize: 15, color: '#333' },
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
  logoutButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  
  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '100%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  languageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedLanguage: {
    backgroundColor: '#f5f9ff',
  },
  languageText: {
    fontSize: 16,
  },
  cancelButton: {
    marginTop: 20,
    padding: 15,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#005AE0',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PengaturanScreen;
