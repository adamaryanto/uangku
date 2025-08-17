import React from 'react';
import { TransactionsProvider } from './src/contexts/TransactionsContext';
import { LanguageProvider } from './src/contexts/LanguageContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <LanguageProvider>
      <TransactionsProvider>
        <AppNavigator />
      </TransactionsProvider>
    </LanguageProvider>
  );
}