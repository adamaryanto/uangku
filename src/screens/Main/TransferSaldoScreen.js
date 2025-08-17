import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Alert, ImageBackground, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTransactions } from '../../contexts/TransactionsContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLanguage } from '../../contexts/LanguageContext';

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

const TransferSaldoScreen = ({ navigation }) => {
  const { addTransaction } = useTransactions();
  const { language, t } = useLanguage();
  const [sumberDana, setSumberDana] = useState('');
  const [tujuan, setTujuan] = useState('');
  const [jumlah, setJumlah] = useState('');
  const [catatan, setCatatan] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

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

  const locale = language === 'id' ? 'id-ID' : 'en-US';

  const formatDate = (date) => {
    return date.toLocaleDateString(locale, {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSave = () => {
    if (!sumberDana || !tujuan || !jumlah) {
      Alert.alert(t('error'), t('requiredFieldsTransfer'));
      return;
    }

    const amount = parseFloat(jumlah.replace(/\./g, '').replace(',', '.'));
    if (isNaN(amount) || amount <= 0) {
      Alert.alert(t('error'), t('invalidAmount'));
      return;
    }

    // Add transfer transaction
    addTransaction({
      type: 'Transfer',
      from: sumberDana,
      to: tujuan,
      amount: amount,
      description: catatan || `Transfer ${sumberDana} -> ${tujuan}`,
      category: 'Transfer',
      date: selectedDate.toISOString().split('T')[0],
      displayDate: selectedDate.toLocaleDateString(locale, {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    });

    // Show success message and navigate back
    Alert.alert(t('success'), t('transferSaved'), [
      { text: t('ok'), onPress: () => navigation.goBack() }
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
                {/* Header sekarang adalah View transparan di dalam ScrollView */}
                <View style={styles.headerContainer}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                      <MaterialCommunityIcons name="chevron-left" size={32} color="white" />
                      <Text style={styles.backButtonText}>{t('back')}</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{t('transferBalanceTitle')}</Text>
                    <Text style={styles.headerSubtitle}>{t('transferBalanceSubtitle')}</Text>
                  </View>

                {/* Konten form */}
                <View style={styles.contentContainer}>
                    <View style={styles.formCard}>
                        <View style={styles.dateRow}>
                            <TouchableOpacity 
                              style={styles.datePicker}
                              onPress={() => setShowDatePicker(true)}
                            >
                                <Text style={[styles.dateValue, { color: '#000000' }]}>
                                  {selectedDate.toLocaleDateString(locale, {
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
                                <Text style={[styles.timeValue, { color: '#000000' }]}>{formatTime(selectedDate)}</Text>
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
                            label={`${t('sourceOfFunds')}`}
                            placeholder="Uang Tunai, Bank"
                            value={sumberDana}
                            onChangeText={setSumberDana}
                        />
                        <LabeledInput 
                            label={t('destination')}
                            placeholder="Uang Tunai, Bank"
                            value={tujuan}
                            onChangeText={setTujuan}
                        />
                        <LabeledInput 
                            label={t('amount')}
                            placeholder="0"
                            value={formatCurrencyInput(jumlah)}
                            onChangeText={(text) => setJumlah(text.replace(/\./g, ''))}
                            keyboardType="numeric"
                        />
                        <LabeledInput 
                            label={t('notes')}
                            placeholder={t('addNoteOptional')}
                            value={catatan}
                            onChangeText={setCatatan}
                        />

                        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                            <MaterialCommunityIcons name="content-save-outline" size={22} color="white" style={{marginRight: 10}} />
                            <Text style={styles.saveButtonText}>{t('save')}</Text>
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
    marginLeft: 12,
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

export default TransferSaldoScreen;