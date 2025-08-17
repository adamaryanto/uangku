import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useLanguage } from '../contexts/LanguageContext';

import TabNavigator from './TabNavigator';

// --- Onboarding & Welcome Screens ---
// Layar yang dilihat pengguna saat pertama kali membuka aplikasi
import WelcomeScreen from '../screens/WelcomeScreen'; // Sesuai struktur folder kita

// --- Authentication Flow Screens ---
// Semua layar yang berhubungan dengan proses masuk dan daftar
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegistrasiScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import VerificationScreen from '../screens/auth/VerificationScreen';
import CreateNewPasswordScreen from '../screens/auth/CreateNewPasswordScreen';

// --- Success Feedback Screens ---
// Layar transisi setelah aksi berhasil
import SuccesForgotPassword from '../screens/auth/SuccesForgotPassword';
import SuccessLoginScreen from '../screens/auth/SuccessLoginScreen';
import SuccessRegisScreen from '../screens/auth/SuccesRegisScreen';

// --- Main Application Screens ---
// Layar utama setelah pengguna berhasil login
import ApplicationDescriptionScreen from '../screens/ApplicationDescriptionScreen';
import SplashScreen from '../screens/SplashScreen';

import TransferSaldoScreen from '../screens/Main/TransferSaldoScreen';
import PengeluaranSaldoScreen from '../screens/Main/PengeluaranSaldoScreen';
import TambahCicilanScreen from '../screens/Main/TambahCicilanScreen'
import PemasukanSaldoScreen from '../screens/Main/PemasukanSaldoScreen';
import TambahTargetScreen from '../screens/Main/TambahTargetScreen';
import UpdateTargetProgressScreen from '../screens/Main/UpdateTargetProgressScreen';
import UpdateCicilanProgressScreen from '../screens/Main/UpdateCicilanProgressScreen';
import CicilanDetailScreen from '../screens/Main/CicilanDetailScreen';
const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { t } = useLanguage();
  return (
    <NavigationContainer>
      {/* Terapkan screenOptions ke semua layar di dalam navigator ini */}
      <Stack.Navigator 
        initialRouteName="SplashScreen" 
        screenOptions={{ headerShown: false }}
      >
        {/* GRUP 1: Alur Otentikasi Pengguna */}
        <Stack.Group>
          <Stack.Screen name="SplashScreen" component={SplashScreen} options={{ title: ' ' }} />
          <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ title: t('welcome') }} />
          <Stack.Screen name="Login" component={LoginScreen} options={{ title: t('login') }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ title: t('register') }} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: t('forgotPassword') }} />
          <Stack.Screen name="Verification" component={VerificationScreen} options={{ title: t('verification') }} />
          <Stack.Screen name="CreateNewPassword" component={CreateNewPasswordScreen} options={{ title: t('createNewPassword') }} />
        </Stack.Group>

        {/* GRUP 2: Layar Feedback/Transisi */}
        <Stack.Group>
          <Stack.Screen name="SuccessLoginScreen" component={SuccessLoginScreen} options={{ title: t('successLogin') }} />
          <Stack.Screen name="SuccessRegisScreen" component={SuccessRegisScreen} options={{ title: t('successRegister') }} />
          <Stack.Screen name="SuccesForgotPassword" component={SuccesForgotPassword} options={{ title: t('successForgotPassword') }} />
          {/* Anda bisa menambahkan layar sukses lainnya di sini jika perlu */}
        </Stack.Group>

          <Stack.Screen name="ApplicationDescription" component={ApplicationDescriptionScreen} />
        {/* GRUP 3: Alur Aplikasi Utama (Setelah Login) */}
        <Stack.Group>
          <Stack.Screen name="MainTabs" component={TabNavigator} />
          <Stack.Screen name="TransferSaldo" component={TransferSaldoScreen} options={{ title: t('transfer') }} />
          <Stack.Screen name="PengeluaranSaldo" component={PengeluaranSaldoScreen} options={{ title: t('expense') }} />
          <Stack.Screen name="PemasukanSaldo" component={PemasukanSaldoScreen} options={{ title: t('income') }} />
          <Stack.Screen name="TambahCicilan" component={TambahCicilanScreen} options={{ title: t('addInstallment') }} />
          <Stack.Screen name="TambahTarget" component={TambahTargetScreen} options={{ title: t('addTarget') }} />
          <Stack.Screen 
            name="UpdateTargetProgress" 
            component={UpdateTargetProgressScreen} 
            options={{ 
              title: t('updateTargetProgress'),
              headerShown: false
            }} 
          />
          <Stack.Screen 
            name="UpdateCicilanProgress" 
            component={UpdateCicilanProgressScreen} 
            options={{ 
              title: t('updateInstallmentPayment'),
              headerShown: false
            }} 
          />
          <Stack.Screen name="CicilanDetail" component={CicilanDetailScreen} options={{ title: t('installments') }} />
          {/* Layar-layar utama lainnya seperti Profile, Settings, dll. akan masuk di sini */}
        </Stack.Group>

        
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
