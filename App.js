import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

import React from 'react';
import { TransactionsProvider } from './src/contexts/TransactionsContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <TransactionsProvider>
      <AppNavigator />
    </TransactionsProvider>
  );
}