import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Modal, Pressable 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTransactions } from '../../contexts/TransactionsContext';
import { useNavigation } from '@react-navigation/native';

// Format angka jadi Rupiah
const formatCurrency = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(number);
};

// Komponen progress bar
const ProgressBar = ({ progress }) => {
  const isComplete = progress >= 100;
  return (
    <View style={styles.progressBarBackground}>
      <View 
        style={[
          styles.progressBarFill, 
          { 
            width: `${progress}%`,
            backgroundColor: isComplete ? '#00C7AF' : '#FEB01A'
          }
        ]} 
      />
    </View>
  );
};

const CicilanScreen = ({ navigation }) => {
  const [showAll, setShowAll] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const { getCicilanTransactions } = useTransactions();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  // Get cicilan transactions and ensure it's always an array
  const cicilanTransactions = getCicilanTransactions() || [];
  
  const filteredCicilan = cicilanTransactions.filter(cicil => 
    cicil && cicil.name && cicil.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort by due date (nearest first)
  const sortedCicilan = [...filteredCicilan].sort((a, b) => {
    // Handle cases where dueDate might be undefined
    const getDateValue = (item) => {
      if (!item.dueDate) return new Date(0); // Default to epoch if no date
      try {
        // Handle both DD-MM-YYYY and YYYY-MM-DD formats
        const parts = item.dueDate.split(/[-/]/);
        if (parts.length === 3) {
          // If format is DD-MM-YYYY
          if (parts[0].length === 2) {
            return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
          }
          // If format is YYYY-MM-DD
          return new Date(item.dueDate);
        }
        return new Date(0);
      } catch (e) {
        console.error('Error parsing date:', item.dueDate, e);
        return new Date(0);
      }
    };
    
    const dateA = getDateValue(a);
    const dateB = getDateValue(b);
    
    return dateA - dateB;
  });

  const cicilanToShow = showAll ? sortedCicilan : sortedCicilan.slice(0, 3);
  
  // Calculate totals with null checks
  const totalCicilan = sortedCicilan.reduce((sum, item) => 
    sum + (parseFloat(item?.totalCicilan) || 0), 0);
    
  const totalPaid = sortedCicilan.reduce((sum, item) => 
    sum + (parseFloat(item?.paidAmount) || 0), 0);
    
  const totalRemaining = Math.max(0, totalCicilan - totalPaid);
  
  // Calculate total active cicilan with null checks
  const totalCicilanAktif = sortedCicilan
    .filter(item => item && (item.paidAmount || 0) < (item.totalCicilan || 0))
    .reduce((sum, item) => sum + ((item?.totalCicilan || 0) - (item?.paidAmount || 0)), 0);

  // Count completed and pending cicilan
  const completedCicilan = sortedCicilan.filter(item => 
    (item.paidAmount || 0) >= (item.totalCicilan || 0)
  ).length;
  const pendingCicilan = sortedCicilan.length - completedCicilan;

  const handleNavigate = (screenName) => {
    setIsMenuVisible(false);
    navigation.navigate(screenName);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <ScrollView>
        {/* Header */}
        <ImageBackground
          source={require('../../assets/image.png')}
          style={styles.headerContainer}
          imageStyle={{ borderBottomLeftRadius: 25, borderBottomRightRadius: 25 }}
        >
          <Text style={styles.headerTitle}>Kelola Cicilan Anda</Text>
          <Text style={styles.headerSubtitle}>
            Atur dan Pantau semua cicilan aktif serta jatuh temponya
          </Text>
        </ImageBackground>

        {/* Konten */}
        <View style={styles.contentContainer} showsVerticalScrollIndicator={false}>
          {/* Filter */}
          <View style={styles.filterContainer}>
            <TouchableOpacity style={[styles.filterButton, { backgroundColor: '#FEB01A' }]}>
              <Text style={styles.filterButtonText}>
                Cicilan{'\n'}
                <Text style={styles.filterButtonCount}>{sortedCicilan.length}</Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.filterButton, { backgroundColor: '#FF4560' }]}>
              <Text style={styles.filterButtonText}>
                Belum Lunas{'\n'}
                <Text style={styles.filterButtonCount}>{pendingCicilan}</Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.filterButton, { backgroundColor: '#00C7AF' }]}>
              <Text style={styles.filterButtonText}>
                Lunas{'\n'}
                <Text style={styles.filterButtonCount}>{completedCicilan}</Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* Total dana target */}
          <View style={styles.totalTargetCard}>
            <Text style={styles.totalTargetLabel}>Total dana Cicilan :</Text>
            <Text style={styles.totalTargetAmount}>{formatCurrency(totalCicilanAktif)}</Text>
          </View>

          {/* Summary */}
          <View style={styles.summaryCardContainer}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Cicilan terpenuhi :</Text>
              <Text style={[styles.summaryAmount, { color: '#FEB01A' }]}>
                +{formatCurrency(totalPaid)}
              </Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Sisa cicilan :</Text>
              <Text style={[styles.summaryAmount, { color: '#E63950' }]}>
                -{formatCurrency(totalRemaining)}
              </Text>
            </View>
          </View>

       {/* List Cicilan */}
       <View style={styles.allTargetsCard}>
          {/* Cek apakah ada data cicilan setelah difilter */}
          {sortedCicilan.length > 0 ? (
            // Jika ADA, tampilkan judul dan daftarnya
            <>
              <Text style={styles.targetListTitle}>Cicilan anda :</Text>
              
              {cicilanToShow.map((item) => {
                const total = parseFloat(item.totalCicilan || 0);
                const paid = parseFloat(item.paidAmount || 0);
                const remaining = Math.max(0, total - paid);
                const progress = total > 0 ? (paid / total) * 100 : 0;
                const isPaidOff = paid >= total;
                
                return (
                  <View key={item.id} style={styles.targetItemRow}>
                    {/* ... (kode render item Anda tidak berubah) ... */}
                    <View style={styles.targetItemHeader}>
                      <View style={styles.targetIconContainer}>
                        <MaterialCommunityIcons name="credit-card-multiple-outline" size={24} color="#005AE0" />
                      </View>
                      <View style={styles.targetItemDetails}>
                        <Text style={styles.targetItemName}>{item.name || 'Tanpa Nama'}</Text>
                        <Text style={styles.targetItemSaved}>Dibayar: {formatCurrency(paid)}</Text>
                        <Text style={styles.targetItemRemaining}>Sisa: {formatCurrency(remaining)}</Text>
                      </View>
                      <View style={styles.targetItemAmountContainer}>
                        <Text style={styles.targetItemTarget}>Total: {formatCurrency(total)}</Text>
                        <Text style={styles.targetItemDate}>Jatuh Tempo: {item.dueDate}</Text>
                      </View>
                    </View>
                    <View style={styles.targetItemAmountContainer}>
                      <View style={styles.rightAlignedRow}>
                        <Text style={[styles.targetItemDate, { color: isPaidOff ? '#27AE60' : '#E74C3C' }]}>
                          {isPaidOff ? 'Lunas' : 'Belum Lunas'}
                        </Text>
                        <TouchableOpacity 
                          onPress={() => navigation.navigate('UpdateCicilanProgress', { cicilan: item })}
                          style={styles.chevronButton}
                        >
                          <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View style={styles.progressContainer}>
                      <Text style={styles.progressText}>{Math.min(100, Math.floor(progress))}%</Text>
                      <ProgressBar progress={progress} />
                      <Text style={styles.progressText}>100%</Text>
                    </View>
                  </View>
                );
              })}

              {/* Tombol Lihat Lainnya */}
              {sortedCicilan.length > 3 && !showAll && (
                <TouchableOpacity
                  style={styles.seeMoreButton}
                  onPress={() => setShowAll(true)}
                >
                  <Text style={styles.seeMoreText}>Lihat Lainnya</Text>
                </TouchableOpacity>
              )}
              {showAll && sortedCicilan.length > 3 && (
                <TouchableOpacity
                  style={styles.seeMoreButton}
                  onPress={() => setShowAll(false)}
                >
                  <Text style={styles.seeMoreText}>Tampilkan Lebih Sedikit</Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            // Jika TIDAK ADA, tampilkan pesan kosong
            <View style={styles.noCicilan}>
              <MaterialCommunityIcons name="credit-card-off-outline" size={48} color="#A9A9A9" />
              <Text style={styles.noCicilanText}>Belum Ada Cicilan</Text>
              <Text style={styles.noCicilanSubtext}>Tambahkan cicilan pertama Anda melalui tombol +</Text>
            </View>
          )}
        </View>
        </View>
      </ScrollView>

      {/* Floating Button */}
       <TouchableOpacity style={styles.fab} onPress={() => setIsMenuVisible(true)}>
                    <MaterialCommunityIcons name="plus" size={32} color="#FEB019" />
                  </TouchableOpacity>
                  <Modal
                    animationType="fade"
                    transparent={true}
                    visible={isMenuVisible}
                    onRequestClose={() => setIsMenuVisible(false)}
                  >
                    <Pressable style={styles.modalOverlay} onPress={() => setIsMenuVisible(false)}>
                      <View style={styles.menuContainer}>
                        {/* Tombol Aksi */}
                        <View style={styles.actionRow}>
                          <Text style={[styles.actionLabel,{backgroundColor: '#727272'}]}>Riwayat Cicilan</Text>
                          <TouchableOpacity style={[styles.actionButton, {backgroundColor: '#727272'}]}>
                            <MaterialCommunityIcons name="history" size={24} color="white" />
                          </TouchableOpacity>
                        </View>
                    
                        <View style={styles.actionRow}>
                          <Text style={[styles.actionLabel,{backgroundColor: '#00C7AF'}]}>Tambah Cicilan Baru</Text>
                          <TouchableOpacity style={[styles.actionButton, {backgroundColor: '#00C7AF'}]} onPress={() => handleNavigate('TambahCicilan')}>
                            {/* Ikon diubah menjadi pensil */}
                            <MaterialCommunityIcons name="pencil-plus-outline" size={24} color="white" />
                          </TouchableOpacity>
                        </View>
                        
                        {/* Tombol Tutup */}
                        <TouchableOpacity style={styles.closeButton} onPress={() => setIsMenuVisible(false)}>
                          <MaterialCommunityIcons name="close" size={32} color="#005AE0" />
                        </TouchableOpacity>
                      </View>
                    </Pressable>
                  </Modal>
    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },
  headerContainer: {
    backgroundColor: '#005AE0',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 180,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 5,
  },
  contentContainer: {
    flex: 1,
    marginTop: -130,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    
    borderRadius: 6,
  },
    filterButton: {
    flexDirection: 'row', // <-- 1. Buat konten jadi horizontal
    justifyContent: 'center', // <-- 2. Pusatkan konten di dalam tombol
    alignItems: 'center',
    paddingVertical:8, // <-- 3. Kurangi padding vertikal agar lebih pendek
    paddingHorizontal: 0, // Kurangi juga padding horizontal
    borderRadius: 5,
    width: '32%',
    padding: 10,
    gap:10,
  },
  filterButtonText: {
    color: 'white',
    fontSize: 13, // <-- 4. Kecilkan sedikit font
    fontWeight: 'bold',
    marginBottom:5,
    
    textAlign: 'center',
  },
  filterButtonCount: {
   fontSize: 17,
    fontWeight: 'bold',
    color: 'white'
  },
  totalTargetCard: {
    backgroundColor: 'white',
    borderRadius: 6,
    padding: 15,
    marginTop:5,
    alignItems: 'start',
  },
  totalTargetLabel: {
    fontSize: 16,
    color: 'black',
    fontWeight:'bold',
  },
  totalTargetAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#005AE0',
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
  targetListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 25,
    marginBottom: 15,
  },
  targetItemCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
  },
  targetItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  targetIconContainer: {
    backgroundColor: '#E8F0FE',
    borderRadius: 10,
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  targetItemDetails: {
    flex: 1,
  },
  targetItemName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  targetItemSaved: {
    fontSize: 13,
    color: '#005AE0',
    fontWeight: '500',
    marginTop: 2,
  },
  targetItemRemaining: {
    fontSize: 13,
    color: '#E63950',
    fontWeight: '500',
    marginTop: 2,
  },
  targetItemAmountContainer: {
    alignItems: 'flex-end',
  },
  targetItemTarget: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#E63950',
  },
  targetItemDate: {
    fontSize: 11,
    color: '#888',
  },
  rightAlignedRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chevronButton: {
    marginLeft: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    width: 40,
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginHorizontal: 5,
  },
  progressBarFill: {
    height: 8,
    backgroundColor: '#27AE60',
    borderRadius: 4,
  },
  allTargetsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom:20,
    marginTop: 16,
    
    elevation: 3, // untuk Android
  },
  
  noCicilan: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  noCicilanText: {
    fontSize: 18,
    color: '#333',
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
  },
  noCicilanSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },

  targetListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 10,
    
  },
  
  targetItemRow: {
    marginBottom: 16,
    
    paddingBottom: 12,
  },
  
  targetItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop:14,
    justifyContent: 'space-between',
  },
  
  targetIconContainer: {
    backgroundColor: '#EAF2FF',
    padding: 8,
    borderRadius: 8,
    marginRight: 10,
  },
  
  targetItemDetails: {
    flex: 1,
  },
  
  targetItemName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  
  targetItemSaved: {
    fontSize: 13,
    color: 'orange',
  },
  
  targetItemAmountContainer: {
    alignItems: 'flex-end',
  },
  
  targetItemTarget: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#E63950',
  },
  
  targetItemDate: {
    fontSize: 11,
    color: '#888',
  },
  
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  
  progressText: {
    fontSize: 12,
    color: '#555',
    marginHorizontal: 4,
  },
  
  chevronButton: {
    padding: 8,
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E5E5',
    borderRadius: 4,
    overflow: 'hidden',
  },
  
  progressBarFill: {
    height: 8,
    backgroundColor: '#FEB01A',
    borderRadius: 4,
  },
  
  seeMoreButton: {
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 1,
    
    borderRadius: 8,
  },
  seeMoreText: {
    color: '#007BFF',
    fontSize: 14,
    fontWeight: '600',
  },
  
  
  fab: {
    position: 'absolute',
    bottom: 30,
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
    backgroundColor: 'rgba(0, 0, 0, 0.8)', // Background semi-transparan
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
    width: '100%',
  },
  actionLabel: {
    
    color: 'white',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 5,
    fontWeight: '600',
    fontSize: 14,
    marginRight: 15,
    textAlign: 'center',
    minWidth: 140,
  },
  actionButton: {
    width: 53,
    height: 53,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  closeButton: {
    backgroundColor: 'white',
    width: 53,
    height: 53,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1, // Jarak dari tombol aksi terakhir
  },
});

export default CicilanScreen;