import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Alert, ImageBackground } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTransactions } from '../../contexts/TransactionsContext';

// Komponen Input Kustom
const LabeledInput = ({ label, placeholder, value, onChangeText, keyboardType = 'default' }) => (
  <View style={styles.inputRow}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      placeholderTextColor="#A9A9A9"
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
    />
  </View>
);

const TambahTargetScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  
  const { addTarget } = useTransactions();

  const handleSave = () => {
    if (!name || !targetAmount) {
      Alert.alert('Error', 'Nama target dan jumlah target wajib diisi.');
      return;
    }

    // Hapus semua karakter non-digit dan konversi ke number
    const amount = parseInt(targetAmount.replace(/\D/g, ''), 10);
    
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Jumlah target harus berupa angka yang valid dan lebih dari 0');
      return;
    }

    const newTarget = {
      id: Date.now().toString(),
      name: name.trim(),
      targetAmount: amount,
      savedAmount: 0,
      date: targetDate || new Date().toLocaleDateString('id-ID')
    };

    addTarget(newTarget);
    
    
    Alert.alert('Sukses', 'Target berhasil ditambahkan.', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  // Format input jumlah dengan titik sebagai pemisah ribuan
  const formatCurrencyInput = (text) => {
    // Hapus semua karakter selain angka
    const numericValue = text.replace(/\D/g, '');
    
    // Format dengan titik sebagai pemisah ribuan
    const formattedValue = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    return formattedValue;
  };

  // Handle perubahan input jumlah
  const handleAmountChange = (text) => {
    // Simpan nilai tanpa format untuk perhitungan
    const rawValue = text.replace(/\./g, '');
    setTargetAmount(rawValue);
  };

  return (
    <ImageBackground
      source={require('../../assets/image.png')}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.headerContainer}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <MaterialCommunityIcons name="chevron-left" size={32} color="white" />
              <Text style={styles.backButtonText}>Kembali</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Target</Text>
            <Text style={styles.headerSubtitle}>Catat Semua tujuan keuangan yang kamu punya, seperti traveling, atau lainya</Text>
          </View>

          <View style={styles.contentContainer}>
            <View style={styles.formCard}>
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Periode Transaksi :</Text>
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

              <LabeledInput 
                label="Nama Target"
                placeholder="Contoh: Liburan ke Bali"
                value={name}
                onChangeText={setName}
              />
              <LabeledInput 
                label="Jumlah Target"
                placeholder="Contoh: 5.000.000"
                value={formatCurrencyInput(targetAmount)}
                onChangeText={handleAmountChange}
                keyboardType="numeric"
              />
              <LabeledInput 
                label="Tanggal Target (opsional)"
                placeholder="DD-MM-YYYY"
                value={targetDate}
                onChangeText={setTargetDate}
              />

              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <MaterialCommunityIcons name="content-save-outline" size={22} color="white" style={{marginRight: 10}} />
                <Text style={styles.saveButtonText}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 40,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: -10,
  },
  backButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 5,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 6,
    padding: 15,
    marginTop:-40,
    marginBottom: 11,
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
    marginBottom: 5,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom:10,
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
  formCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 15,
    padding: 20,
    width:'100%',
    height:'120%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    color: '#898989',
    width: 100,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 5,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color:'#D0D0D0',
    backgroundColor:'#FFFFFF'
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: '#005AE0',
    paddingVertical: 16,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TambahTargetScreen;
