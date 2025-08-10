import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert, ImageBackground, Dimensions, FlatList } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { PieChart } from 'react-native-chart-kit';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTransactions } from '../../contexts/TransactionsContext';

const screenWidth = Dimensions.get('window').width;

// Warna untuk setiap tipe transaksi
const typeColors = {
  'Pemasukan': '#27AE60',    // Hijau
  'Pengeluaran': '#E74C3C',  // Merah
  'Target': '#3498DB',       // Biru
  'Cicilan': '#9B59B6'      // Ungu
};

// Warna untuk setiap kategori (jika diperlukan)
const categoryColors = {
  'Makan & Minum': '#3498DB',
  'Transportasi': '#27AE60',
  'Belanja': '#F39C12',
  'Tagihan': '#E74C3C',
  'Pendapatan': '#9B59B6',
  'Lainnya': '#7F8C8D',
  'Transfer Keluar': '#E74C3C',
  'Transfer Masuk': '#2ECC71'
};

const chartStyles = StyleSheet.create({
  chartContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 0,
  },
});

// Format mata uang
const formatCurrency = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(number);
};

// Format tanggal untuk perbandingan
const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

// Format tanggal untuk display
const formatDisplayDate = (date) => {
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const DiagramScreen = ({ navigation }) => {
  const { transactions, getTotalBalance, getTotalIncome, getTotalExpense } = useTransactions();
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [chartData, setChartData] = useState([]);

  // Filter transactions by date range
  useEffect(() => {
    const startDateStr = formatDate(startDate);
    const endDateStr = formatDate(endDate);

    const filteredTransactions = transactions.filter(transaction => {
      const transactionDate = transaction.date;
      return transactionDate >= startDateStr && transactionDate <= endDateStr;
    });

    // Calculate totals by transaction type
    const typeTotals = {
      'Pemasukan': 0,
      'Pengeluaran': 0,
      'Target': 0,
      'Cicilan': 0
    };

    filteredTransactions.forEach(transaction => {
      if (typeTotals.hasOwnProperty(transaction.type)) {
        typeTotals[transaction.type] += Math.abs(transaction.amount);
      }
    });

    // Calculate total for percentage
    const total = Object.values(typeTotals).reduce((sum, amount) => sum + amount, 0);

    // Convert to array format for PieChart and add percentage
    const pieData = Object.entries(typeTotals)
      .filter(([_, amount]) => amount > 0) // Only include types with amount > 0
      .map(([type, amount]) => {
        const percentage = total > 0 ? Math.round((amount / total) * 100) : 0;
        return {
          name: `${type} (${percentage}%)`,
          population: amount,
          color: typeColors[type] || '#7F8C8D',
          legendFontColor: '#7F7F7F',
          legendFontSize: 12
        };
      });

    setChartData(pieData);
  }, [transactions, startDate, endDate]);

  const chartConfig = {
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16
    }
  };

  const handleStartDateChange = (event, date) => {
    setShowStartDatePicker(false);
    if (date) {
      setStartDate(date);
    }
  };

  const handleEndDateChange = (event, date) => {
    setShowEndDatePicker(false);
    if (date) {
      setEndDate(date);
    }
  };

  const handleDownloadPdf = () => {
    Alert.alert('Download PDF', 'Fitur untuk mengunduh laporan PDF akan segera hadir!');
  };

  const Legend = () => (
    <View style={styles.legendContainer}>
      {chartData.map((item, index) => (
        <View key={index} style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: item.color }]} />
          <Text style={styles.legendText}>
            {item.name}: {formatCurrency(item.population)}
          </Text>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ScrollView>
        <ImageBackground
          source={require('../../assets/image.png')}
          style={styles.headerContainer}
          imageStyle={{ borderBottomLeftRadius: 25, borderBottomRightRadius: 25 }}
        >
          <Text style={styles.headerTitle}>Analisis Keuangan</Text>
          <Text style={styles.headerSubtitle}>
            Tinjau Pola Pengeluaran dan Pemasukan secara grafis
          </Text>
        </ImageBackground>

        <View style={styles.contentContainer}>
          {/* Card untuk Periode Transaksi */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Periode Transaksi :</Text>
              <TouchableOpacity style={styles.downloadButton} onPress={handleDownloadPdf}>
                <Text style={styles.downloadButtonText}>Export Pdf</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.dateContainer}>
              <TouchableOpacity
                style={styles.datePicker}
                onPress={() => setShowStartDatePicker(true)}
              >
                <Text style={styles.dateLabel}>Dari tanggal :</Text>
                <Text style={styles.dateValue}>{formatDisplayDate(startDate)}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.datePickerEnd}
                onPress={() => setShowEndDatePicker(true)}
              >
                <Text style={[styles.dateLabel, { textAlign: 'right' }]}>Sampai tanggal :</Text>
                <Text style={[styles.dateValue, { textAlign: 'right' }]}>{formatDisplayDate(endDate)}</Text>
              </TouchableOpacity>
            </View>

            {showStartDatePicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display="default"
                onChange={handleStartDateChange}
                maximumDate={new Date()}
              />
            )}

            {showEndDatePicker && (
              <DateTimePicker
                value={endDate}
                mode="date"
                display="default"
                onChange={handleEndDateChange}
                maximumDate={new Date()}
                minimumDate={startDate}
              />
            )}
          </View>

          {/* Card untuk Chart */}
          <View style={[styles.card, styles.chartCard]}>
  <Text style={styles.sectionTitle}>Ringkasan Pengeluaran</Text>
  {chartData.length > 0 ? (
    <View style={chartStyles.chartContainer}>
      <PieChart
        data={chartData}
        width={200} // ukuran lingkaran
        height={200}
        chartConfig={chartConfig}
        accessor="population"
        backgroundColor="transparent"
        absolute
        hasLegend={false}
      />
      <Legend />
    </View>
  ) : (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons name="chart-pie" size={50} color="#DDD" />
      <Text style={styles.emptyStateText}>
        Tidak ada data pengeluaran untuk periode ini
      </Text>
    </View>
  )}
</View>

          {/* Card untuk Total Dana Keseluruhan */}
          <View style={styles.card}>
            <Text style={styles.totalLabel}>Total dana keseluruhan :</Text>
            <Text style={styles.totalAmount}>{formatCurrency(getTotalBalance())}</Text>
          </View>

          {/* Card untuk Detail */}
          <View style={styles.card}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Total Pemasukan :</Text>
              <Text style={[styles.detailAmount, { color: '#27AE60' }]}>{formatCurrency(getTotalIncome())}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Total Pengeluaran :</Text>
              <Text style={[styles.detailAmount, { color: '#E74C3C' }]}>{formatCurrency(getTotalExpense())}</Text>
            </View>
            <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.detailLabel}>Saldo :</Text>
              <Text style={styles.detailAmount}>{formatCurrency(getTotalBalance())}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },
  headerContainer: {
    backgroundColor: '#005AE0',
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 170,
  },
  headerTitle: {
    fontSize: 26,
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
    marginTop: -160,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 6,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  datePicker: {
    width: '48%',
    alignItems: 'flex-start',
  },
  datePickerEnd: {
    width: '48%',
    alignItems: 'flex-end',
  },
  dateLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
  dateValue: {
    fontSize: 16,
    color: '#333',
    marginTop: 5,
  },
  chartCard: {
    alignItems: 'center',
    padding: 15,
    paddingBottom: 25,
  },
  chartContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyStateText: {
    color: '#999',
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  legendContainer: {
    marginLeft: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  legendText: {
    fontSize: 14,
    color: '#666',
  },
  totalLabel: {
    fontSize: 16,
    color: 'black',
    fontWeight: 'bold'
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#005AE0',
    marginTop: 5,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  detailAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#005AE0',
  },
  downloadButton: {
    backgroundColor: '#DC3545',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    elevation: 2,
  },
  downloadButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  }
});

export default DiagramScreen;