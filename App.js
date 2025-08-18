import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { TransactionsProvider } from './src/contexts/TransactionsContext';
import { LanguageProvider } from './src/contexts/LanguageContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <PaperProvider>
      <LanguageProvider>
        <TransactionsProvider>
          <AppNavigator />
        </TransactionsProvider>
      </LanguageProvider>
    </PaperProvider>
  );
}