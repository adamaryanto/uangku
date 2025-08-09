import React, { createContext, useState, useContext } from 'react';

const TransactionsContext = createContext();

export const TransactionsProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([
    { id: '1', type: 'Pemasukan', category: 'Gaji', amount: 4000000, date: '01-01-2025', icon: 'briefcase-outline' },
    { id: '2', type: 'Pengeluaran', category: 'Makan', amount: 600000, date: '01-01-2025', icon: 'arrow-down-circle-outline' },
  ]);

  const addTransaction = (newTransaction) => {
    setTransactions(prevTransactions => [
      ...prevTransactions,
      {
        ...newTransaction,
        id: Date.now().toString(),
        date: new Date().toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        })
      }
    ]);
  };

  const getTotalBalance = () => {
    return transactions.reduce((total, transaction) => {
      if (transaction.type === 'Pemasukan') {
        return total + transaction.amount;
      } else if (transaction.type === 'Pengeluaran') {
        return total - transaction.amount;
      }
      return total;
    }, 0);
  };

  const getTotalIncome = () => {
    return transactions
      .filter(transaction => transaction.type === 'Pemasukan')
      .reduce((total, transaction) => total + transaction.amount, 0);
  };

  const getTotalExpense = () => {
    return transactions
      .filter(transaction => transaction.type === 'Pengeluaran')
      .reduce((total, transaction) => total + transaction.amount, 0);
  };

  return (
    <TransactionsContext.Provider
      value={{
        transactions,
        addTransaction,
        getTotalBalance,
        getTotalIncome,
        getTotalExpense,
      }}
    >
      {children}
    </TransactionsContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionsContext);
  if (!context) {
    throw new Error('useTransactions must be used within a TransactionsProvider');
  }
  return context;
};

export default TransactionsContext;
