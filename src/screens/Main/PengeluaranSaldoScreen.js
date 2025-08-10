import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Alert, ImageBackground, Image, Animated, Easing, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTransactions } from '../../contexts/TransactionsContext';


// Komponen Input Kustom
const LabeledInput = ({ label, placeholder, value, onChangeText, keyboardType = 'default' }) => {
  // Text color is black when there's text, grey when empty
  const textColor = value ? '#000000' : '#D0D0D0';
  
  return (
    <View style={styles.inputRow}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={[
          styles.input, 
          { color: textColor }
        ]}
        placeholder={placeholder}
        placeholderTextColor="#A9A9A9"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
      />
    </View>
  );
};

const PengeluaranSaldoScreen = ({ navigation }) => {
  const [kategori, setKategori] = useState('');
  const [sumberDana, setSumberDana] = useState('');
  const [jumlah, setJumlah] = useState('');
  const [catatan, setCatatan] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const { addTransaction } = useTransactions();


 
  const handleDateChange = (event, date) => {
    if (event.type === 'set') {
      const currentDate = date || selectedDate;
      setSelectedDate(currentDate);
    }
    setShowDatePicker(false);
  };

  const handleTimeChange = (event, time) => {
    if (event.type === 'set') {
      const currentTime = time || selectedDate;
      setSelectedDate(currentTime);
    }
    setShowTimePicker(false);
  };

  const handleSave = () => {
    if (!kategori || !sumberDana || !jumlah) {
      Alert.alert('Error', 'Kategori, sumber dana, dan jumlah wajib diisi.');
      return;
    }

    const amount = parseFloat(jumlah.replace(/\./g, '').replace(',', '.'));
    
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Jumlah harus berupa angka yang valid dan lebih dari 0');
      return;
    }

    const newTransaction = {
      type: 'Pengeluaran',
      category: kategori,
      amount: amount,
      description: catatan || `Pengeluaran untuk ${kategori}`,
      icon: 'cash-minus',
      source: sumberDana,
      date: selectedDate.toISOString().split('T')[0],
      displayDate: selectedDate.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    addTransaction(newTransaction);
    
    Alert.alert('Sukses', 'Pengeluaran berhasil dicatat.', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  // Format input jumlah dengan titik sebagai pemisah ribuan
  const formatCurrencyInput = (text) => {
    // Hapus semua karakter selain angka
    const numericValue = text.replace(/[^0-9]/g, '');
    
    // Format dengan titik sebagai pemisah ribuan
    const formattedValue = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    return formattedValue;
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
            <Text style={styles.headerTitle}>Pengeluaran Saldo</Text>
            <Text style={styles.headerSubtitle}>Catat Semua pengeluaran yang kamu lakukan, seperti belanja, transportasi, atau kebutuhan lainnya</Text>
          </View>

          <View style={styles.contentContainer}>
            <View style={styles.formCard}>
              <View style={styles.dateRow}>
                <TouchableOpacity 
                  style={styles.datePicker}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={[styles.dateValue, { color: '#000000' }]}>
                    {selectedDate.toLocaleDateString('id-ID', {
                      weekday: 'long',
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </Text>
                  <MaterialCommunityIcons name="calendar-month-outline" size={24} color="#333" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.timePicker}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Text style={[styles.timeValue, { color: '#000000' }]}>
                    {selectedDate.toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                </TouchableOpacity>

                {showDatePicker && (
                  <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                  />
                )}

                {showTimePicker && (
                  <DateTimePicker
                    value={selectedDate}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleTimeChange}
                  />
                )}
              </View>

              <LabeledInput 
                label="Kategori:"
                placeholder="Makanan, Transportasi, dll"
                value={kategori}
                onChangeText={setKategori}
              />
              <LabeledInput 
                label="Sumber Dana"
                placeholder="Uang Tunai, Bank, dll"
                value={sumberDana}
                onChangeText={setSumberDana}
              />
              <LabeledInput 
                label="Jumlah"
                placeholder="0"
                value={formatCurrencyInput(jumlah)}
                onChangeText={(text) => setJumlah(text.replace(/\./g, ''))}
                keyboardType="numeric"
              />
              <LabeledInput 
                label="Catatan"
                placeholder="Tambah catatan (opsional)"
                value={catatan}
                onChangeText={setCatatan}
              />

             
              <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={isProcessing}>
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
  contentContainer: {
    // Beri padding di bawah
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
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  datePicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 5,
    paddingHorizontal: 15,
    paddingVertical: 12,
    flex: 0.75,
    backgroundColor:'#FFFFFF'
  },
  dateValue: {
    fontSize: 16,
    color: '#D0D0D0',
  },
  timePicker: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 5,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flex: 0.2,
    backgroundColor:'#FFFFFF',
    
  },
  timeValue: {
    fontSize: 16,
    color: '#D0D0D0',
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
    color: '#D0D0D0',
    backgroundColor: '#FFFFFF',
  },
  inputFocused: {
    borderColor: '#005AE0',
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
  ocrContainer: {
    marginTop: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ocrTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  ocrSubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 16,
  },
  ocrButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  ocrButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#005AE0',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  ocrButtonCamera: {
    backgroundColor: '#27AE60',
  },
  ocrButtonDisabled: {
    opacity: 0.6,
  },
  ocrButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
  previewContainer: {
    marginTop: 12,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    backgroundColor: '#F5F5F5',
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    marginBottom: 8,
  },
  spinning: {
    transform: [{ rotate: '0deg' }],
    animationKey: 'spin',
    animationDuration: '1000ms',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'linear',
  },
  processingText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default PengeluaranSaldoScreen;
