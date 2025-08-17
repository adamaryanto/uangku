import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE } from '../config/api';

const TransactionsContext = createContext({
  transactions: [],
  addTransaction: () => {},
  onLogin: () => {},
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
  logout: () => {},
  currentUser: null,
  loadTargets: () => [],
  addTarget: () => {},
  updateTarget: () => {},
  deleteTarget: () => {},
  addContribution: () => {},
  getTargetDetails: () => {},
});

// Key for AsyncStorage
const TRANSACTIONS_STORAGE_KEY = '@UangKu:transactions';

export const TransactionsProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Call this right after a successful login to sync state immediately
  const onLogin = (user) => {
    if (user?.id) {
      setCurrentUser(user);
    }
  };

  // Load logged-in user from storage
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('auth');
        if (raw) {
          const auth = JSON.parse(raw);
          if (auth?.user) setCurrentUser(auth.user);
        }
      } catch (e) {
        console.warn('Failed to load user/transactions', e);
      }
    })();
  }, []);

  // Load transactions from AsyncStorage
  const loadTransactions = useCallback(async () => {
    if (!currentUser?.id) {
      setTransactions([]);
      return;
    }
  
    const userTransactionsKey = `@transactions_${currentUser.id}`;
  
    try {
      // --- load dari local ---
      let localTransactions = [];
      const localData = await AsyncStorage.getItem(userTransactionsKey);
      if (localData) {
        localTransactions = JSON.parse(localData);
        setTransactions(localTransactions); // tampilkan dulu data lokal
      }
  
      // --- fetch dari server ---
      const response = await fetch(`${API_BASE}/api/transactions?userId=${currentUser.id}`);
      const data = await response.json();
  
      if (data.success) {
        const serverTransactions = data.transactions || [];
  
        // --- merge local + server ---
        const merged = [
          ...serverTransactions,
          ...localTransactions.filter(
            lt => !serverTransactions.some(st => st.id === lt.id)
          )
        ];
  
        setTransactions(merged);
        await AsyncStorage.setItem(userTransactionsKey, JSON.stringify(merged));
      } else {
        console.error('Failed to load transactions:', data.message);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  }, [currentUser?.id]);
  

  // Save transactions to AsyncStorage whenever they change
  const saveTransactions = useCallback(async (newTransactions) => {
    try {
      const jsonValue = JSON.stringify(newTransactions);
      await AsyncStorage.setItem(TRANSACTIONS_STORAGE_KEY, jsonValue);
    } catch (e) {
      console.error('Failed to save transactions', e);
    }
  }, []);

  // Load targets for the current user
  const loadTargets = useCallback(async () => {
    if (!currentUser?.id) return [];
    
    try {
      const response = await fetch(`${API_BASE}/api/targets?userId=${currentUser.id}`);
      const data = await response.json();
      
      if (data.success) {
        return data.data || [];
      } else {
        console.error('Failed to load targets:', data.message);
        return [];
      }
    } catch (error) {
      console.error('Error loading targets:', error);
      return [];
    }
  }, [currentUser?.id]);

  // Load transactions on mount
  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const formatTransactionDate = (date) => {
    const d = new Date(date);
    return d.toISOString().split('T')[0]; // Returns YYYY-MM-DD format for consistent comparison
  };
  
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('auth');
    } catch (e) {
      console.warn('Failed to clear data on logout', e);
    }
    setTransactions([]);
    setCurrentUser(null);
  };
  

  const addTransaction = async (newTransaction) => {
    // Existing logic for formatting date and creating local transaction object
    const now = new Date();
    const transactionDate = newTransaction.date ? new Date(newTransaction.date) : now;
    const formattedDate = transactionDate.toISOString().split('T')[0];
    const txLocal = {
      ...newTransaction,
      id: Date.now().toString(),
      date: formattedDate,
    };
  
    // Optimistically update local state
    const updatedTransactions = [...transactions, txLocal];
    setTransactions(updatedTransactions);
  
    const userTransactionsKey = `@transactions_${currentUser.id}`;
  
    try {
      // Save to local storage
      if (currentUser?.id) {
        await AsyncStorage.setItem(userTransactionsKey, JSON.stringify(updatedTransactions));
      }
  
      // Persist to backend
      if (currentUser?.id) {
        await fetch(`${API_BASE}/api/transactions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser.id,
            type: newTransaction.type,
            category: newTransaction.category,
            amount: newTransaction.amount,
            description: newTransaction.description,
            icon: newTransaction.icon,
            source: newTransaction.source,
            date: formattedDate,
            displayDate: newTransaction.displayDate,
          }),
        });
      }
    } catch (e) {
      console.warn('Failed to persist transaction', e);
    }
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

  // Add a new target
  const addTarget = async (targetData) => {
    if (!currentUser?.id) {
      throw new Error('User not logged in');
    }

    try {
      const response = await fetch(`${API_BASE}/api/targets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.id,
          ...targetData
        }),
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to add target');
      }

      return data;
    } catch (error) {
      console.error('Error adding target:', error);
      throw error;
    }
  };

  // Update a target
  const updateTarget = async (targetId, updates) => {
    try {
      const response = await fetch(`${API_BASE}/api/targets/${targetId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to update target');
      }

      return data;
    } catch (error) {
      console.error('Error updating target:', error);
      throw error;
    }
  };

  // Delete a target
  const deleteTarget = async (targetId) => {
    try {
      const response = await fetch(`${API_BASE}/api/targets/${targetId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to delete target');
      }

      return data;
    } catch (error) {
      console.error('Error deleting target:', error);
      throw error;
    }
  };

  // Add contribution to a target
  const addContribution = async (targetId, amount, notes = '') => {
    try {
      const response = await fetch(`${API_BASE}/api/targets/${targetId}/contribute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount, notes }),
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to add contribution');
      }

      return data;
    } catch (error) {
      console.error('Error adding contribution:', error);
      throw error;
    }
  };

  // Get target details with transactions
  const getTargetDetails = async (targetId) => {
    try {
      const response = await fetch(`${API_BASE}/api/targets/${targetId}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch target details');
      }

      return data.data;
    } catch (error) {
      console.error('Error fetching target details:', error);
      throw error;
    }
  };

  const contextValue = {
    // Transaction related
    transactions,
    isLoading,
    addTransaction,
    getTotalBalance,
    getTotalIncome,
    getTotalExpense,
    getTotalTransferred,
    
    // Target related
    loadTargets,
    addTarget,
    updateTarget,
    deleteTarget,
    addContribution,
    getTargetDetails,
    getTargetTransactions,
    getTotalTargetAmount,
    getTotalSavedAmount,
    updateTargetProgress,
    
    // Cicilan related
    addCicilan,
    updateCicilan,
    getCicilanTransactions,
    getTotalCicilan,
    updateCicilanPayment,
    
    // Auth related
    onLogin,
    logout,
    currentUser,
  };

  return (
    <TransactionsContext.Provider value={contextValue}>
      {children}
    </TransactionsContext.Provider>
  );
};

export const useTransactions = () => {
    return useContext(TransactionsContext); // selalu ada default, jadi aman
};

export default TransactionsContext;