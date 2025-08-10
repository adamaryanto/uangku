import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

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
import CicilanDetailScreen from '../screens/Main/CicilanDetailScreen';
const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      {/* Terapkan screenOptions ke semua layar di dalam navigator ini */}
      <Stack.Navigator 
        initialRouteName="MainTabs" 
        screenOptions={{ headerShown: false }}
      >
        {/* GRUP 1: Alur Otentikasi Pengguna */}
        <Stack.Group>
          <Stack.Screen name="SplashScreen" component={SplashScreen} />
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="Verification" component={VerificationScreen} />
          <Stack.Screen name="CreateNewPassword" component={CreateNewPasswordScreen} />
        </Stack.Group>

        {/* GRUP 2: Layar Feedback/Transisi */}
        <Stack.Group>
          <Stack.Screen name="SuccessLoginScreen" component={SuccessLoginScreen} />
          <Stack.Screen name="SuccessRegisScreen" component={SuccessRegisScreen} />
          <Stack.Screen name="SuccesForgotPassword" component={SuccesForgotPassword} />
          {/* Anda bisa menambahkan layar sukses lainnya di sini jika perlu */}
        </Stack.Group>

          <Stack.Screen name="ApplicationDescription" component={ApplicationDescriptionScreen} />
        {/* GRUP 3: Alur Aplikasi Utama (Setelah Login) */}
        <Stack.Group>
          <Stack.Screen name="MainTabs" component={TabNavigator} />
          <Stack.Screen name="TransferSaldo" component={TransferSaldoScreen} />
          <Stack.Screen name="PengeluaranSaldo" component={PengeluaranSaldoScreen} />
          <Stack.Screen name="PemasukanSaldo" component={PemasukanSaldoScreen} />
          <Stack.Screen name="TambahCicilan" component={TambahCicilanScreen} />
          <Stack.Screen name="TambahTarget" component={TambahTargetScreen} />
          <Stack.Screen name="CicilanDetail" component={CicilanDetailScreen} />
          {/* Layar-layar utama lainnya seperti Profile, Settings, dll. akan masuk di sini */}
        </Stack.Group>

        
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
