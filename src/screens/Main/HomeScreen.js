import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, FlatList, TouchableOpacity, ImageBackground, Modal, Pressable } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTransactions } from '../../contexts/TransactionsContext';

const HomeScreen = ({ navigation, isVisible, onClose }) => {
  const { transactions, getTotalBalance, getTotalIncome, getTotalExpense } = useTransactions();
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  
  // Helper untuk format mata uang
  const formatCurrency = (number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
  };
  
  const formatNumber = (number) => {
    return number.toLocaleString('id-ID') + ',00';
  };

  const handleNavigate = (screenName) => {
    setIsMenuVisible(false);
    navigation.navigate(screenName);
  };

  const [isMenuVisible, setIsMenuVisible] = useState(false);

  // Komponen untuk setiap item transaksi
  const renderTransactionItem = ({ item, index }) => {
    const isIncome = item.type === 'Pemasukan';
    const isExpense = item.type === 'Pengeluaran';
    const amountColor = isIncome ? '#27AE60' : (isExpense ? '#E74C3C' : '#3498DB');
    const amountSign = isIncome ? '+' : (isExpense ? '-' : '');

    // Menentukan warna teks tipe transaksi
    let typeColor = '#3498DB'; // Default untuk Transfer
    if (isIncome) typeColor = '#27AE60';
    if (isExpense) typeColor = '#E74C3C';

    // Menghilangkan garis pemisah untuk item terakhir
    const itemStyle = index === transactions.length - 1 ? styles.transactionItem : [styles.transactionItem, styles.transactionItemBorder];

    return (
      <TouchableOpacity style={itemStyle} key={item.id}>
        <View style={styles.transactionIconContainer}>
          <MaterialCommunityIcons 
            name={item.icon || (isIncome ? 'cash-plus' : isExpense ? 'cash-minus' : 'swap-horizontal')} 
            size={24} 
            color={typeColor} 
          />
        </View>
        <View style={styles.transactionDetails}>
          <Text style={[styles.transactionType, { color: typeColor }]}>{item.type}</Text>
          <Text style={styles.transactionCategory}>{item.category}</Text>
          {item.description && <Text style={styles.transactionDescription}>{item.description}</Text>}
        </View>
        <View style={styles.transactionAmountContainer}>
          <Text style={[styles.transactionAmount, { color: amountColor }]}>
            {`${amountSign}${formatCurrency(item.amount)}`}
          </Text>
          <Text style={styles.transactionDate}>Tanggal: {item.date}</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={22} color="#A9A9A9" />
      </TouchableOpacity>
    );
  };

  const transactionsToShow = showAllTransactions ? transactions : transactions.slice(0, 3);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ScrollView>
      <ImageBackground
        source={require('../../assets/image.png')}
        style={styles.headerContainer}
        imageStyle={styles.headerBackgroundImage}
      >
        <Text style={styles.headerTitle}>Catat Pemasukan {'\n'}& Pengeluaran Anda</Text>
        <Text style={styles.headerSubtitle}>Semua transaksi kamu, di sini tempatnya.</Text>
      </ImageBackground>

      <View showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>
          {/* Date Picker */}
          <View style={styles.datePickerContainer}>
            <Text style={styles.datePickerLabel}>Tanggal:</Text>
            <TouchableOpacity style={styles.datePickerButton}>
              <Text style={styles.datePickerText}>
                {new Date().toLocaleDateString('id-ID', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}
              </Text>
              <MaterialCommunityIcons name="calendar-month-outline" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {/* Kartu Total Dana */}
          <View style={styles.totalBalanceCard}>
            <Text style={styles.totalBalanceLabel}>Total dana transaksi :</Text>
            <Text style={styles.totalBalanceAmount}>{formatCurrency(getTotalBalance())}</Text>
          </View>

          {/* Kartu Ringkasan (Pemasukan & Pengeluaran) */}
          <View style={styles.summaryCardContainer}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>
                Pemasukan : <MaterialCommunityIcons name="arrow-top-right-thin-circle-outline" size={24} color="#27AE60" />
              </Text>
              <View>
                <Text style={[styles.summaryAmount, { color: '#27AE60' }]}>Rp.{formatNumber(getTotalIncome())}</Text>
              </View>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>
                Pengeluaran : <MaterialCommunityIcons name="arrow-bottom-left-thin-circle-outline" size={24} color="#E74C3C" />
              </Text>
              <View>
                <Text style={[styles.summaryAmount, { color: '#E74C3C' }]}>-Rp.{formatNumber(getTotalExpense())}</Text>
              </View>
            </View>
          </View>

          {/* Kartu Ringkasan (Pindah Dana & Jumlah Transaksi) */}
          <View style={styles.summaryCardContainer}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>
                Pindah dana <MaterialCommunityIcons name="swap-horizontal" size={24} color="#3498DB" />
              </Text>
              <Text style={[styles.summaryAmount, { color: '#3498DB' }]}>Rp. 0</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Jumlah Transaksi</Text>
              <Text style={[styles.summaryAmount, { color: '#F39C12', fontSize: 24, fontWeight: 'bold' }]}>{transactions.length}X</Text>
            </View>
          </View>

          {/* Daftar Transaksi */}
          <View style={styles.transactionListCard}>
            <Text style={styles.transactionListTitle}>Transaksi anda hari ini</Text>
            
            {transactions.length > 0 ? (
              <FlatList
                data={transactionsToShow}
                renderItem={renderTransactionItem}
                keyExtractor={item => item.id}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.noTransactions}>
                <MaterialCommunityIcons name="clipboard-text-outline" size={48} color="#A9A9A9" />
                <Text style={styles.noTransactionsText}>Belum ada transaksi</Text>
                <Text style={styles.noTransactionsSubtext}>Tambahkan transaksi pertama Anda</Text>
              </View>
            )}

            {/* Tombol Lihat Lainnya */}
            {transactions.length > 3 && !showAllTransactions && (
              <TouchableOpacity 
                style={styles.seeMoreButton} 
                onPress={() => setShowAllTransactions(true)}
              >
                <Text style={styles.seeMoreText}>Lihat Lainnya</Text>
              </TouchableOpacity>
            )}

            {showAllTransactions && (
              <TouchableOpacity 
                style={styles.seeMoreButton} 
                onPress={() => setShowAllTransactions(false)}
              >
                <Text style={styles.seeMoreText}>Tampilkan Lebih Sedikit</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
      </ScrollView>

      {/* Tombol Tambah (Floating Action Button) */}
      <TouchableOpacity style={styles.fab} onPress={() => setIsMenuVisible(true)}>
        <MaterialCommunityIcons name="plus" size={32} color="#FEB019" />
      </TouchableOpacity>

      {/* Modal Menu */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isMenuVisible}
        onRequestClose={() => setIsMenuVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsMenuVisible(false)}>
          <View style={styles.menuContainer}>
            <View style={styles.actionRow}>
              <Text style={styles.actionLabel}>Riwayat Transaksi</Text>
              <TouchableOpacity style={[styles.actionButton, {backgroundColor: '#6c757d'}]} onPress={() => handleNavigate('History')}>
                <MaterialCommunityIcons name="history" size={24} color="white" />
              </TouchableOpacity>
            </View>
            <View style={styles.actionRow}>
              <Text style={styles.actionLabel}>Pindah Dana</Text>
              <TouchableOpacity style={[styles.actionButton, {backgroundColor: '#007bff'}]} onPress={() => handleNavigate('TransferSaldo')}>
                <MaterialCommunityIcons name="swap-horizontal" size={24} color="white" />
              </TouchableOpacity>
            </View>
            <View style={styles.actionRow}>
              <Text style={styles.actionLabel}>Uang Keluar</Text>
              <TouchableOpacity style={[styles.actionButton, {backgroundColor: '#dc3545'}]} onPress={() => handleNavigate('PengeluaranSaldo')}>
                <MaterialCommunityIcons name="arrow-down-bold-box" size={24} color="white" />
              </TouchableOpacity>
            </View>
            <View style={styles.actionRow}>
              <Text style={styles.actionLabel}>Uang Masuk</Text>
              <TouchableOpacity style={[styles.actionButton, {backgroundColor: '#28a745'}]} onPress={() => handleNavigate('PemasukanSaldo')}>
                <MaterialCommunityIcons name="arrow-up-bold-box" size={24} color="white" />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity style={styles.closeButton} onPress={() => setIsMenuVisible(false)}>
              <MaterialCommunityIcons name="close" size={32} color="#005AE0" />
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8', // Warna background utama
  },
  headerContainer: {
    backgroundColor: '#005AE0',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 150,
    
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
  },
  contentContainer: {
    flex: 1,
    marginTop: -130, // Tarik ke atas agar menimpa header
    paddingHorizontal: 20,
    
  },
  datePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  datePickerLabel: {
    fontSize: 16,
    color: '#666',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  datePickerText: {
    fontSize: 16,
    
    color: '#333',
    marginRight: 10,
  },
  totalBalanceCard: {
    backgroundColor: 'white',
    borderRadius: 6,
    padding: 15,
    marginTop: 20,
    alignItems: 'start',
    
  },
  totalBalanceLabel: {
    fontSize: 16,
    color: 'black',
    fontWeight: 'bold',
  },
  totalBalanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'black',
    marginTop: 5,
  },
  summaryCardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 6,
    padding: 10,
    
    width: '48%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  summaryLabel: {
    fontSize: 14,
    color: 'black',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  summaryAmount: {
    fontSize: 15,
    fontWeight: 'bold',
    
  },
 
  transactionListCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginTop: 20,
    marginBottom: 100, // Beri ruang di bawah
  },
  transactionListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 15,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8, // Padding vertikal dikecilkan
  },
  transactionIconContainer: {
    backgroundColor: '#E8F0FE',
    borderRadius: 10,
    width: 40, // Lebar dikecilkan
    height: 40, // Tinggi dikecilkan
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12, // Jarak dikecilkan
  },
  transactionDetails: {
    flex: 1,
  },
  transactionType: {
    fontSize: 13,
    marginBottom: 2,
  },
  transactionCategory: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  transactionDescription: {
    fontSize: 11, // Ukuran font dikecilkan
    color: '#666',
  },
  transactionAmountContainer: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 15, // Ukuran font dikecilkan
    fontWeight: 'bold',
  },
  transactionDate: {
    fontSize: 11, // Ukuran font dikecilkan
    color: '#999',
  },
  seeMoreButton: {
  marginTop: 10,
  paddingVertical: 10,
  alignItems: 'center',
},

seeMoreText: {
  color: '#005AE0',
  fontWeight: 'bold',
  fontSize: 14,
},

  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'white',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Background semi-transparan
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    padding: 20,
  },
  menuContainer: {
    alignItems: 'flex-end',
    marginBottom: 70, // Posisikan di atas FAB
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  actionLabel: {
    
    color: 'white',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginRight: 15,
    fontSize: 14,
  },
  actionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  closeButton: {
    backgroundColor: 'white',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1, // Jarak dari tombol aksi terakhir
  },
  noTransactions: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noTransactionsText: {
    fontSize: 18,
    color: '#333',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  noTransactionsSubtext: {
    fontSize: 14,
    color: '#666',
  },
});

export default HomeScreen;
