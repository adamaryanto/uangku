import React, { createContext, useState, useContext } from 'react';

const TransactionsContext = createContext({
  transactions: [],
  addTransaction: () => {},
  addTarget: () => {},
  addCicilan: () => {},
  updateCicilan: () => {},
  getTotalBalance: () => 0,
  getTotalIncome: () => 0,
  getTotalExpense: () => 0,
  getCicilanTransactions: () => [],
  getTotalCicilan: () => 0,
  getTargetTransactions: () => [],
  getTotalTargetAmount: () => 0,
  getTotalSavedAmount: () => 0,
  getTotalTransferred: () => 0,
  updateTargetProgress: () => {},
  updateCicilanPayment: () => {},
});


export const TransactionsProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);

  const formatTransactionDate = (date) => {
    const d = new Date(date);
    return d.toISOString().split('T')[0]; // Returns YYYY-MM-DD format for consistent comparison
  };

  const addTransaction = (newTransaction) => {
    const now = new Date();
    const transactionDate = newTransaction.date 
      ? new Date(newTransaction.date) 
      : now;
  
    const formattedDate = transactionDate.toISOString().split('T')[0]; // <-- YYYY-MM-DD
  
    setTransactions(prev => [
      ...prev,
      {
        ...newTransaction,
        id: Date.now().toString(),
        date: formattedDate,
      }
    ]);
  };
  
  

  const addTarget = (newTarget) => {
    const now = new Date();
    const formattedDate = formatTransactionDate(now);
    
    const targetTransaction = {
      ...newTarget,
      id: Date.now().toString(),
      type: 'Target',
      date: formattedDate,
      savedAmount: newTarget.savedAmount || 0,
      displayDate: now.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    setTransactions(prevTransactions => [...prevTransactions, targetTransaction]);
    return targetTransaction;
  };

  const addCicilan = (newCicilan) => {
    const now = new Date();
    const formattedDate = formatTransactionDate(now);
    
    const cicilanTransaction = {
      ...newCicilan,
      id: Date.now().toString(),
      type: 'Cicilan',
      date: formattedDate,
      displayDate: now.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    setTransactions(prevTransactions => [...prevTransactions, cicilanTransaction]);
    return cicilanTransaction;
  };

  const updateCicilan = (updatedCicilan) => {
    setTransactions(prevTransactions => 
      prevTransactions.map(transaction => 
        transaction.id === updatedCicilan.id ? { ...transaction, ...updatedCicilan } : transaction
      )
    );
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

  const getCicilanTransactions = () => {
    return transactions.filter(transaction => transaction.type === 'Cicilan');
  };

  const getTotalCicilan = () => {
    return transactions
      .filter(transaction => transaction.type === 'Cicilan')
      .reduce((total, transaction) => total + transaction.amount, 0);
  };

  const getTargetTransactions = () => {
    return transactions.filter(transaction => transaction.type === 'Target');
  };

  const getTotalTargetAmount = () => {
    return transactions
      .filter(transaction => transaction.type === 'Target')
      .reduce((total, transaction) => total + (transaction.targetAmount || 0), 0);
  };

  const getTotalSavedAmount = () => {
    return transactions
      .filter(transaction => transaction.type === 'Target')
      .reduce((total, transaction) => total + (transaction.savedAmount || 0), 0);
  };

  const getTotalTransferred = () => {
    return transactions
      .filter(transaction => transaction.type === 'Transfer')
      .reduce((total, transaction) => total + transaction.amount, 0);
  };

  const updateTargetProgress = (targetId, progressUpdate) => {
    setTransactions(prevTransactions => 
      prevTransactions.map(transaction => {
        if (transaction.id === targetId) {
          // Create or update the progress history
          const progressHistory = Array.isArray(transaction.progressHistory) 
            ? [...transaction.progressHistory, progressUpdate]
            : [progressUpdate];
            
          // Calculate new saved amount
          const newSavedAmount = (transaction.savedAmount || 0) + progressUpdate.amount;
          
          return {
            ...transaction,
            savedAmount: newSavedAmount,
            progressHistory,
            lastUpdated: new Date().toISOString()
          };
        }
        return transaction;
      })
    );
  };

  const updateCicilanPayment = (cicilanId, payment) => {
    setTransactions(prevTransactions => 
      prevTransactions.map(transaction => {
        if (transaction.id === cicilanId) {
          // Create or update the payment history
          const paymentHistory = Array.isArray(transaction.paymentHistory) 
            ? [...transaction.paymentHistory, payment]
            : [payment];
            
          // Calculate new paid amount
          const newPaidAmount = (transaction.paidAmount || 0) + payment.amount;
          
          return {
            ...transaction,
            paidAmount: newPaidAmount,
            paymentHistory,
            lastUpdated: new Date().toISOString()
          };
        }
        return transaction;
      })
    );
  };

  return (
    <TransactionsContext.Provider
      value={{
        transactions,
        addTransaction,
        addTarget,
        addCicilan,
        updateCicilan,
        getTotalBalance,
        getTotalIncome,
        getTotalExpense,
        getCicilanTransactions,
        getTotalCicilan,
        getTargetTransactions,
        getTotalTargetAmount,
        getTotalSavedAmount,
        getTotalTransferred,
        updateTargetProgress,
        updateCicilanPayment,
      }}
    >
      {children}
    </TransactionsContext.Provider>
  );
};

export const useTransactions = () => {
    return useContext(TransactionsContext); // selalu ada default, jadi aman
};

export default TransactionsContext;