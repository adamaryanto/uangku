import React from 'react';
import { View, Text, StyleSheet } from 'react-native'; // Impor View, Text, StyleSheet
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLanguage } from '../contexts/LanguageContext';

// Impor HANYA layar yang sudah kita buat
import HomeScreen from '../screens/Main/HomeScreen';
import TargetScreen from '../screens/Main/TargetScreen';
import CicilanScreen from '../screens/Main/CicilanScreen';
import DiagramScreen from '../screens/Main/DiagramScreen';
import PengaturanScreen from '../screens/Main/PengaturanScreen';
// --- LANGKAH 1: Buat Komponen Placeholder di sini ---
const PlaceholderScreen = ({ route }) => {
  return (
    <View style={styles.placeholderContainer}>
      <Text style={styles.placeholderText}>Halaman {route.name}</Text>
      <Text>Konten untuk halaman ini akan segera dibuat.</Text>
    </View>
  );
};

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const { t } = useLanguage();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#005AE0',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          height: 60,
          paddingBottom: 5,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'HomeTab') {
            iconName = 'home-variant';
          } else if (route.name === 'Target') {
            iconName = 'bullseye-arrow';
          } else if (route.name === 'Diagram') {
            iconName = 'chart-pie';
          } else if (route.name === 'Cicilan') {
            iconName = 'credit-card-multiple';
          } else if (route.name === 'Pengaturan') {
            iconName = 'cog';
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
      })}
    >

      <Tab.Screen 
        name="HomeTab" 
        component={HomeScreen} 
        options={{ tabBarLabel: t('home') }} 
      />

      <Tab.Screen 
        name="Target" 
        component={TargetScreen} 
        options={{ tabBarLabel: t('targets') }} 
      />
      <Tab.Screen 
        name="Diagram" 
        component={DiagramScreen} 
        options={{ tabBarLabel: t('diagram') }} 
      />
      <Tab.Screen 
        name="Cicilan" 
        component={CicilanScreen} 
        options={{ tabBarLabel: t('installments') }} 
      />
      <Tab.Screen 
        name="Pengaturan" 
        component={PengaturanScreen} 
        options={{ tabBarLabel: t('settings') }} 
      />
    </Tab.Navigator>
  );
};

// --- LANGKAH 3: Tambahkan style untuk placeholder ---
const styles = StyleSheet.create({
    placeholderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    }
});

export default TabNavigator;
