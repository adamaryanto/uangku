import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert,ImageBackground } from 'react-native';
import { StatusBar } from 'expo-status-bar';
// --- DIHAPUS --- MaterialCommunityIcons tidak digunakan di layar ini
import { PieChart } from 'react-native-svg-charts';
import { Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
const screenWidth = Dimensions.get('window').width;
// --- DATA STATIS (Nantinya akan dari API) ---
const chartData = [
    {
        key: 1,
        amount: 50,
        svg: { fill: '#3498DB' }, // Biru
        label: 'Makan & Minum'
    },
    {
        key: 2,
        amount: 50,
        svg: { fill: '#27AE60' }, // Hijau
        label: 'Transportasi'
    },
    {
        key: 3,
        amount: 40,
        svg: { fill: '#F39C12' }, // Oranye
        label: 'Belanja'
    },
    {
        key: 4,
        amount: 95,
        svg: { fill: '#E74C3C' }, // Merah
        label: 'Tagihan'
    }
]

// Helper untuk format mata uang
const formatCurrency = (number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
};

const DiagramScreen = ({ navigation }) => {

  const handleDownloadPdf = () => {
        // Logika sementara
        Alert.alert('Download PDF', 'Fitur untuk mengunduh laporan PDF akan segera hadir!');
    };

    const Legend = () => (
        <View style={styles.legendContainer}>
            {chartData.map(item => (
                <View key={item.key} style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: item.svg.fill }]} />
                    <Text style={styles.legendText}>{item.label}</Text>
                </View>
            ))}
        </View>
    )

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
     <ScrollView>
        
      <ImageBackground
                source={require('../../assets/image.png')}
                style={styles.headerContainer}
                imageStyle={{ borderBottomLeftRadius: 25, borderBottomRightRadius: 25 }}
              >
                <Text style={styles.headerTitle}>Tujuan Keuangan Anda</Text>
                <Text style={styles.headerSubtitle}>
                  Tinjau Pola Pengeluaran dan Pemasukan secara grafis
                </Text>
              </ImageBackground>

      <View style={styles.contentContainer} showsVerticalScrollIndicator={false}>
           <View style={styles.card}>
            {/* --- DIUBAH --- Judul dan tombol sekarang dibungkus dalam satu View --- */}
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Periode Transaksi :</Text>
                <TouchableOpacity style={styles.downloadButton} onPress={handleDownloadPdf}>
                    <Text style={styles.downloadButtonText}>Export Pdf</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.dateContainer}>
                <TouchableOpacity style={styles.datePicker}>
                    <Text style={styles.dateLabel}>Dari tanggal :</Text>
                    <Text style={styles.dateValue}>31-07-2025</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.datePicker}>
                    <Text style={styles.dateLabel}>Sampai tanggal :</Text>
                    <Text style={styles.dateValue}>31-07-2025</Text>
                </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.card, styles.chartCard]}>
          <PieChart
            style={{ height: 200, width: 150 }}
            data={chartData.map((item, index) => ({
                key: item.key || `pie-${index}`, // key unik
                value: item.amount,
                svg: item.svg,
                arc: { outerRadius: '95%', innerRadius: '60%' }
            }))}
            />
            <Legend />
          </View>

          <View style={styles.card}>
            <Text style={styles.totalLabel}>Total dana keseluruhan :</Text>
            <Text style={styles.totalAmount}>{formatCurrency(116000000)}</Text>
          </View>
          
          <View style={styles.card}>
            <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Total dana transaksi :</Text>
                <Text style={styles.detailAmount}>{formatCurrency(50000000)}</Text>
            </View>
            <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Total dana transaksi :</Text>
                <Text style={styles.detailAmount}>{formatCurrency(50000000)}</Text>
            </View>
            <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Total dana transaksi :</Text>
                <Text style={styles.detailAmount}>{formatCurrency(50000000)}</Text>
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
  },cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    // marginBottom dihapus dari sini
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  datePicker: {
    width: '48%',
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
    flexDirection: 'row',
    alignItems: 'center',
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
   downloadButtonText: {
  backgroundColor: 'red',
  paddingVertical: 7,
  paddingHorizontal: 10,
  borderRadius: 5,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  elevation: 3,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  color:'white',
}



});

export default DiagramScreen;
