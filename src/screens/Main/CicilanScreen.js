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
// Data target
const targets = [
  { id: '1', name: 'Iphone 12 pro max', targetAmount: 14000000, savedAmount: 6000000, date: '01-01-2025' },
  { id: '2', name: 'Macbook Pro M3', targetAmount: 30000000, savedAmount: 6000000, date: '01-06-2025' },
  { id: '3', name: 'Macbook Pro M3', targetAmount: 30000000, savedAmount: 6000000, date: '01-06-2025' },
  { id: '4', name: 'Macbook Pro M3', targetAmount: 30000000, savedAmount: 6000000, date: '01-06-2025' },
];

// Format angka jadi Rupiah
const formatCurrency = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(number);
};

// Komponen progress bar
const ProgressBar = ({ progress }) => (
  <View style={styles.progressBarBackground}>
    <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
  </View>
);

const CicilanScreen = ({ navigation }) => {
  
  const [showAll, setShowAll] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  // --- DIUBAH --- Ambil data 'cicilan' dari context
  const { cicilan = [] } = useTransactions(); 

  const cicilanToShow = showAll ? cicilan : cicilan.slice(0, 2);
    const totalCicilanAktif = cicilan
    .filter(item => item.paidAmount < item.totalAmount)
    .reduce((sum, item) => sum + item.totalAmount, 0);
  const handleNavigate = (screenName) => {
    setIsMenuVisible(false);
    navigation.navigate(screenName);
  };
 const renderCicilanItem = ({ item }) => {
    const isPaidOff = item.paidAmount >= item.totalAmount;
    const progress = isPaidOff ? 100 : (item.paidAmount / item.totalAmount) * 100;

    return (
      <TouchableOpacity style={styles.cicilanItemCard}>
        <View style={styles.cicilanItemHeader}>
            <View style={styles.cicilanIconContainer}>
                <MaterialCommunityIcons name="credit-card-multiple-outline" size={24} color="#005AE0" />
            </View>
            <View style={styles.cicilanItemDetails}>
                <Text style={styles.cicilanItemName}>{item.name}</Text>
                <Text style={styles.cicilanItemPaid}>
                  {formatCurrency(item.paidAmount)} / {formatCurrency(item.totalAmount)}
                </Text>
            </View>
            <View style={styles.cicilanItemDueDateContainer}>
                <Text style={styles.cicilanItemDueDateLabel}>Jatuh Tempo:</Text>
                <Text style={[styles.cicilanItemDueDate, {color: isPaidOff ? '#27AE60' : '#E74C3C'}]}>{item.dueDate}</Text>
            </View>
        </View>
        <ProgressBar progress={progress} />
      </TouchableOpacity>
    );
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
            Pantau Dan Atur Semua Cicilan Aktif Serta Jatuh Temponya
          </Text>
        </ImageBackground>

        {/* Konten */}
        <View style={styles.contentContainer} showsVerticalScrollIndicator={false}>
          {/* Filter */}
          <View style={styles.filterContainer}>
            <TouchableOpacity style={[styles.filterButton, { backgroundColor: '#FEB01A' }]}>
              <Text style={styles.filterButtonText}>
                Cicilan{'\n'}
                <Text style={styles.filterButtonCount}>3</Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.filterButton, { backgroundColor: '#FF4560' }]}>
              <Text style={styles.filterButtonText}>
                Belum Lunas{'\n'}
                <Text style={styles.filterButtonCount}>3</Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.filterButton, { backgroundColor: '#00C7AF' }]}>
              <Text style={styles.filterButtonText}>
                Lunas{'\n'}
                <Text style={styles.filterButtonCount}>3</Text>
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
                +Rp. 26.000.000,00
              </Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Sisa dana Cicilan :</Text>
              <Text style={[styles.summaryAmount, { color: '#E63950' }]}>
                -Rp. 14.000.000,00
              </Text>
            </View>
          </View>

          {/* List Target */}
          <View style={styles.allTargetsCard}>
            <Text style={styles.targetListTitle}>Cicilan anda :</Text>
            {cicilanToShow.map((item) => {
              const progress = (item.savedAmount / item.targetAmount) * 100;
              return (
                <View key={item.id} style={styles.targetItemRow}>
                  <View style={styles.targetItemHeader}>
                    <View style={styles.targetIconContainer}>
                      <MaterialCommunityIcons name="briefcase-outline" size={24} color="#005AE0" />
                    </View>
                    <View style={styles.targetItemDetails}>
                      <Text style={styles.targetItemName}>{item.name}</Text>
                      <Text style={styles.targetItemSaved}>{formatCurrency(item.savedAmount)}</Text>
                    </View>
                    <View style={styles.targetItemAmountContainer}>
                      <Text style={styles.targetItemTarget}>{formatCurrency(item.targetAmount)}</Text>
                      <Text style={styles.targetItemDate}>Tanggal: {item.date}</Text>
                    </View>
                  </View>

                  <View style={styles.progressContainer}>
                    <Text style={styles.progressText}>{Math.floor(progress)}%</Text>
                    <ProgressBar progress={progress} />
                    <Text style={styles.progressText}>100%</Text>
                  </View>
                </View>
              );
            })}

            {/* Tombol Lihat Lainnya */}
            {targets.length > 3 && !showAll && (
              <TouchableOpacity
                style={styles.seeMoreButton}
                onPress={() => setShowAll(true)}
              >
                <Text style={styles.seeMoreText}>Lihat Lainnya</Text>
              </TouchableOpacity>
            )}

            {showAll && (
              <TouchableOpacity
                style={styles.seeMoreButton}
                onPress={() => setShowAll(false)}
              >
                <Text style={styles.seeMoreText}>Tampilkan Lebih Sedikit</Text>
              </TouchableOpacity>
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
    paddingBottom: 170,
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
    fontSize: 14,
    color: '#F39C12',
    fontWeight: 'bold',
  },
  targetItemAmountContainer: {
    alignItems: 'flex-end',
  },
  targetItemTarget: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E74C3C',
  },
  targetItemDate: {
    fontSize: 12,
    color: '#999',
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
