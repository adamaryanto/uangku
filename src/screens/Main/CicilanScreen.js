import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Modal,
  Pressable 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTransactions } from '../../contexts/TransactionsContext';
import { useLanguage } from '../../contexts/LanguageContext';

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
  const { language, t } = useLanguage();
  const [showAll, setShowAll] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const { getCicilanTransactions } = useTransactions();
  
  // Get cicilan transactions and ensure it's always an array
  const cicilanTransactions = getCicilanTransactions() || [];
  
  // Sort by due date (nearest first)
  const sortedCicilan = [...cicilanTransactions].sort((a, b) => {
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

  // Helper: format value to DD-MM-YYYY if possible
  const toDDMMYYYY = (value) => {
    if (!value) return null;
    if (typeof value === 'string') {
      // already DD-MM-YYYY
      if (/^\d{2}-\d{2}-\d{4}$/.test(value)) return value;
      const parts = value.split(/[-\/]/);
      if (parts.length === 3) {
        // YYYY-MM-DD
        if (parts[0].length === 4) {
          const [y, m, d] = parts;
          return `${String(d).padStart(2, '0')}-${String(m).padStart(2, '0')}-${y}`;
        }
        // DD-MM-YYYY (normalize zero padding)
        if (parts[2].length === 4) {
          const [d, m, y] = parts;
          return `${String(d).padStart(2, '0')}-${String(m).padStart(2, '0')}-${y}`;
        }
      }
    }
    try {
      const dt = new Date(value);
      if (!isNaN(dt)) {
        const d = String(dt.getDate()).padStart(2, '0');
        const m = String(dt.getMonth() + 1).padStart(2, '0');
        const y = dt.getFullYear();
        return `${d}-${m}-${y}`;
      }
    } catch (e) {}
    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <ImageBackground
          source={require('../../assets/image.png')}
          style={styles.headerContainer}
          imageStyle={{ borderBottomLeftRadius: 25, borderBottomRightRadius: 25 }}
        >
          <Text style={styles.headerTitle}>{t('manageInstallmentsTitle')}</Text>
          <Text style={styles.headerSubtitle}>
            {t('manageInstallmentsSubtitle')}
          </Text>
        </ImageBackground>

        {/* Konten */}
        <View style={styles.contentContainer}>
          {/* Filter */}
          <View style={styles.filterContainer}>
            <TouchableOpacity style={[styles.filterButton, { backgroundColor: '#FEB01A' }]}>
              <View style={styles.filterButtonTextWrap}>
                <Text
                  style={styles.filterButtonLabel}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.8}
                >
                  {t('installmentsLabel')}
                </Text>
                <Text style={styles.filterButtonCount}>{sortedCicilan.length}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.filterButton, { backgroundColor: '#FF4560' }]}>
              <View style={styles.filterButtonTextWrap}>
                <Text
                  style={styles.filterButtonLabel}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.8}
                >
                  {t('unpaid')}
                </Text>
                <Text style={styles.filterButtonCount}>{pendingCicilan}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.filterButton, { backgroundColor: '#00C7AF' }]}>
              <View style={styles.filterButtonTextWrap}>
                <Text
                  style={styles.filterButtonLabel}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.8}
                >
                  {t('paid')}
                </Text>
                <Text style={styles.filterButtonCount}>{completedCicilan}</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Total dana cicilan */}
          <View style={styles.totalAmountCard}>
            <Text style={styles.totalAmountLabel}>{t('totalInstallmentFundsLabel')}</Text>
            <Text style={styles.totalAmountValue}>{formatCurrency(totalCicilanAktif)}</Text>
          </View>

          {/* Summary */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>{t('installmentsFulfilled')}</Text>
              <Text style={[styles.summaryAmount, { color: '#FEB01A' }]}> 
                +{formatCurrency(totalPaid)}
              </Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>{t('remainingInstallments')}</Text>
              <Text style={[styles.summaryAmount, { color: '#E63950' }]}> 
                -{formatCurrency(totalRemaining)}
              </Text>
            </View>
          </View>

          {/* List Cicilan */}
          <View style={styles.itemsCard}>
            {/* Cek apakah ada data cicilan setelah difilter */}
            {sortedCicilan.length > 0 ? (
              <>
                <Text style={styles.itemsTitle}>{t('yourInstallments')}</Text>
                
                {cicilanToShow.map((item) => {
                  const total = parseFloat(item.totalCicilan || 0);
                  const paid = parseFloat(item.paidAmount || 0);
                  const remaining = Math.max(0, total - paid);
                  const progress = total > 0 ? Math.min(100, (paid / total) * 100) : 0;
                  const isPaidOff = paid >= total;
                  const endDateLabel = toDDMMYYYY(item?.dueDate) || toDDMMYYYY(item?.date);
                  
                  return (
                    <View key={item.id} style={styles.itemRow}>
                      <View style={styles.itemHeader}>
                        <View style={styles.iconContainer}>
                          <MaterialCommunityIcons name="credit-card-multiple-outline" size={24} color="#005AE0" />
                        </View>
                        <View style={styles.itemDetails}>
                          <Text style={styles.itemName}>{item.name || '-'}</Text>
                          <Text style={styles.itemCollected}>{t('collected')}: {formatCurrency(paid)}</Text>
                          <Text style={styles.itemRemaining}>{t('remaining')}: {formatCurrency(remaining)}</Text>
                        </View>
                        <View style={styles.itemAmountContainer}>
                          <Text style={styles.itemTarget}>{t('target')}: {formatCurrency(total)}</Text>
                          <Text style={styles.itemDate}>{t('dueDate2')}: {endDateLabel || '-'}</Text>
                        </View>
                      </View>
                      <View style={styles.itemAmountContainer}>
                        <View style={styles.rightAlignedRow}>
                          <Text style={[styles.itemDate, { color: isPaidOff ? '#27AE60' : '#E74C3C' }]}>
                            {isPaidOff ? t('paidOff') : t('notPaidOff')}
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
                        <Text style={styles.progressText}>{Math.floor(progress)}%</Text>
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
                    <Text style={styles.seeMoreText}>{t('seeMore')}</Text>
                  </TouchableOpacity>
                )}
                {showAll && sortedCicilan.length > 3 && (
                  <TouchableOpacity
                    style={styles.seeMoreButton}
                    onPress={() => setShowAll(false)}
                  >
                    <Text style={styles.seeMoreText}>{t('seeLess')}</Text>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <View style={styles.noItems}>
                <MaterialCommunityIcons name="credit-card-off-outline" size={48} color="#A9A9A9" />
                <Text style={styles.noItemsText}>{t('noInstallmentsYet')}</Text>
                <Text style={styles.noItemsSubtext}>{t('addFirstInstallment')}</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Floating Button */}
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
            {/* Tombol Aksi */}
            <View style={styles.actionRow}>
              <Text style={[styles.actionLabel, { backgroundColor: '#727272' }]}>{t('installmentHistory')}</Text>
              <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#727272' }]}>
                <MaterialCommunityIcons name="history" size={24} color="white" />
              </TouchableOpacity>
            </View>
        
            <View style={styles.actionRow}>
              <Text style={[styles.actionLabel, { backgroundColor: '#00C7AF' }]}>{t('addNewInstallment')}</Text>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: '#00C7AF' }]} 
                onPress={() => handleNavigate('TambahCicilan')}
              >
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
    marginTop: -130,
    paddingHorizontal: 20,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    borderRadius: 6,
  },
  filterButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderRadius: 5,
    width: '31%',
  },
  filterButtonTextWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonLabel: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  filterButtonCount: {
    fontSize: 17,
    fontWeight: 'bold',
    color: 'white'
  },
  totalAmountCard: {
    backgroundColor: 'white',
    borderRadius: 6,
    padding: 15,
    marginTop: 5,
    alignItems: 'flex-start',
  },
  totalAmountLabel: {
    fontSize: 16,
    color: 'black',
    fontWeight: 'bold',
  },
  totalAmountValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#005AE0',
    marginTop: 5,
  },
  summaryContainer: {
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
  itemsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 10,
  },
  itemsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    marginTop: 16,
    elevation: 3,
  },
  noItems: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  noItemsText: {
    fontSize: 18,
    color: '#333',
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
  },
  noItemsSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  itemRow: {
    marginBottom: 16,
    paddingBottom: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    justifyContent: 'space-between',
  },
  iconContainer: {
    backgroundColor: '#EAF2FF',
    padding: 8,
    borderRadius: 8,
    marginRight: 10,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  itemCollected: {
    fontSize: 13,
    color: 'orange',
  },
  itemRemaining: {
    fontSize: 13,
    color: '#E63950',
    fontWeight: '500',
    marginTop: 2,
  },
  itemAmountContainer: {
    alignItems: 'flex-end',
  },
  itemTarget: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#E63950',
  },
  itemDate: {
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
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    padding: 20,
  },
  menuContainer: {
    alignItems: 'flex-end',
    marginBottom: 70,
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
    marginTop: 1,
  },
});

export default CicilanScreen;