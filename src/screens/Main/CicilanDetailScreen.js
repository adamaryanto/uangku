import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Alert, ImageBackground, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTransactions } from '../../contexts/TransactionsContext';
import { useLanguage } from '../../contexts/LanguageContext';

// Komponen Input Kustom
const LabeledInput = ({ label, placeholder, value, onChangeText, keyboardType = 'default', onPress }) => (
  <View style={styles.inputRow}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput
      style={[styles.input, onPress && styles.inputWithIcon]}
      placeholder={placeholder}
      placeholderTextColor="#A9A9A9"
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      onFocus={onPress} // Open date picker when input is focused
      editable={!onPress} // Make date input read-only
    />
    {onPress && (
      <TouchableOpacity style={styles.dateIcon} onPress={onPress}>
        <MaterialCommunityIcons name="calendar-month" size={24} color="#005AE0" />
      </TouchableOpacity>
    )}
  </View>
);

const CicilanDetailScreen = ({ route, navigation}) => {
    const { cicilan } = route.params || {};
    const isEditMode = !!cicilan;
    const { t } = useLanguage();
  
    const [namaCicilan, setNamaCicilan] = useState(cicilan?.name || '');
    const [totalCicilan, setTotalCicilan] = useState(cicilan?.totalCicilan?.toString() || '');
    const [jatuhTempo, setJatuhTempo] = useState(cicilan?.dueDate || '');
    const [catatan, setCatatan] = useState(cicilan?.description || '');
    const [showDatePicker, setShowDatePicker] = useState(false);
  
    const { addCicilan, updateCicilan } = useTransactions();
  
  
 

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
          const day = String(selectedDate.getDate()).padStart(2, '0');
          const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
          const year = selectedDate.getFullYear();
          setJatuhTempo(`${day}-${month}-${year}`);
        }
      };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const handleSave = () => {
    if (!namaCicilan || !totalCicilan || !jatuhTempo) {
      Alert.alert(t('error'), t('installmentNameTotalDueRequired'));
      return;
    }

    const totalAmount = parseFloat(totalCicilan.replace(/\./g, ''));
    
    if (isNaN(totalAmount) || totalAmount <= 0) {
      Alert.alert(t('error'), t('installmentAmountMustBeValid'));
      return;
    }

    const cicilanData = {
      id: cicilan?.id || Date.now().toString(),
      name: namaCicilan,
      totalCicilan: totalAmount,
      paidAmount: cicilan?.paidAmount || 0,
      dueDate: jatuhTempo,
      description: catatan,
    };

    if (isEditMode) {
      updateCicilan(cicilanData);
      Alert.alert(t('success'), t('installmentUpdatedSuccess'), [
        { text: t('ok'), onPress: () => navigation.goBack() }
      ]);
    } else {
      addCicilan(cicilanData);
      Alert.alert(t('success'), t('installmentAddedSuccess'), [
        { text: t('ok'), onPress: () => navigation.goBack() }
      ]);
    }
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
              <Text style={styles.backButtonText}>{t('back')}</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('installmentsLabel')}</Text>
            <Text style={styles.headerSubtitle}>{t('manageInstallmentsSubtitle')}</Text>
          </View>

          <View style={styles.contentContainer}>
            <View style={styles.formCard}>
                 <View style={styles.card}>
                           {/* --- DIUBAH --- Judul dan tombol sekarang dibungkus dalam satu View --- */}
                           <View style={styles.cardHeader}>
                               <Text style={styles.cardTitle}>{t('transactionPeriod')}</Text>

                           </View>
                           <View style={styles.dateContainer}>
                               <TouchableOpacity style={styles.datePicker}>
                                   <Text style={styles.dateLabel}>{t('fromDate')}</Text>
                                   <Text style={styles.dateValue}>{t('datePlaceholder')}</Text>
                               </TouchableOpacity>
                               <TouchableOpacity style={styles.datePicker}>
                                   <Text style={styles.dateLabel}>{t('toDate')}</Text>
                                   <Text style={styles.dateValue}>{t('datePlaceholder')}</Text>
                               </TouchableOpacity>
                           </View>
                         </View>
                    

                         <LabeledInput 
       label={t('installmentName')}
       placeholder={t('installmentName')}
       value={namaCicilan}
       onChangeText={setNamaCicilan}
     />
     <LabeledInput 
       label={t('totalAmount')}
       placeholder="0"
       value={formatCurrencyInput(totalCicilan)}
       onChangeText={(text) => setTotalCicilan(text.replace(/\./g, ''))}
       keyboardType="numeric"
     />
     <LabeledInput 
       label={t('dueDate')}
       placeholder={t('chooseDate')}
       value={jatuhTempo}
       onPress={showDatepicker}
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
  inputWithIcon: {
    paddingRight: 40, // Make room for the calendar icon
  },
  dateIcon: {
    position: 'absolute',
    right: 10,
    top: 40,
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

export default CicilanDetailScreen;
