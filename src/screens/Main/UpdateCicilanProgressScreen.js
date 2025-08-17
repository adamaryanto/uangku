import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ImageBackground,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTransactions } from '../../contexts/TransactionsContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLanguage } from '../../contexts/LanguageContext';

const UpdateCicilanProgressScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { cicilan } = route.params;
  const { language, t } = useLanguage();
  
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { updateCicilan } = useTransactions();

  // If cicilan data is missing, show an error and go back
  React.useEffect(() => {
    if (!cicilan) {
      Alert.alert(t('error'), t('invalidInstallmentData'));
      navigation.goBack();
    }
  }, [cicilan]);

  if (!cicilan) {
    return null;
  }

  const formatDate = (date) => {
    return date.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '-');
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleSave = () => {
    if (!amount) {
      Alert.alert(t('error'), t('paymentAmountRequired'));
      return;
    }

    const numericAmount = parseInt(amount.replace(/\D/g, ''), 10);
    
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert(t('error'), t('paymentAmountMustBeValid'));
      return;
    }

    const payment = {
      id: Date.now().toString(),
      amount: numericAmount,
      date: formatDate(date),
      notes: notes.trim(),
      timestamp: new Date().toISOString()
    };

    // Update cicilan with new payment
    const updatedCicilan = {
      ...cicilan,
      paidAmount: (cicilan.paidAmount || 0) + numericAmount,
      paymentHistory: [...(cicilan.paymentHistory || []), payment],
      lastUpdated: new Date().toISOString(),
    };

    updateCicilan(updatedCicilan);
    
    Alert.alert(t('success'), t('installmentPaymentAddedSuccess'), [
      { text: t('ok'), onPress: () => navigation.goBack() }
    ]);
  };

  const formatCurrencyInput = (text) => {
    const numericValue = text.replace(/\D/g, '');
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handleAmountChange = (text) => {
    const rawValue = text.replace(/\./g, '');
    setAmount(rawValue);
  };

  // Disable save if amount invalid or exceeds remaining amount
  const numericAmount = parseInt((amount || '').replace(/\D/g, ''), 10);
  const remainingAmount = Math.max(0, (cicilan.totalCicilan || 0) - (cicilan.paidAmount || 0));
  const isDisabled = !amount || isNaN(numericAmount) || numericAmount <= 0 || numericAmount > remainingAmount;

  return (
    <ImageBackground
      source={require('../../assets/image.png')}
      style={styles.container}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={styles.safeArea}>
          <StatusBar style="light" />
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.headerContainer}>
              <TouchableOpacity 
                style={styles.backButton} 
                onPress={() => navigation.goBack()}
              >
                <MaterialCommunityIcons name="chevron-left" size={32} color="white" />
                <Text style={styles.backButtonText}>{t('back')}</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>{t('updateInstallmentPayment')}</Text>
              <Text style={styles.headerSubtitle}>
                {t('addPaymentForInstallment')} {cicilan.name}
              </Text>
            </View>

            <View style={styles.contentContainer}>
              <View style={styles.formCard}>
                <View style={styles.cicilanInfo}>
                  <Text style={styles.cicilanName}>{cicilan.name}</Text>
                  <Text style={styles.cicilanAmount}>
                    {t('paidAmount')}: Rp{parseInt(cicilan.paidAmount || 0).toLocaleString('id-ID')} / Rp{parseInt(cicilan.totalCicilan).toLocaleString('id-ID')}
                  </Text>
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBarBackground}>
                      <View 
                        style={[
                          styles.progressBarFill, 
                          { 
                            width: `${Math.min(100, ((cicilan.paidAmount || 0) / cicilan.totalCicilan) * 100)}%` 
                          }
                        ]} 
                      />
                    </View>
                    <Text style={styles.progressText}>
                      {Math.floor(((cicilan.paidAmount || 0) / cicilan.totalCicilan) * 100)}%
                    </Text>
                  </View>
                  <Text style={styles.remainingAmount}>
                    {t('remaining')}: Rp{Math.max(0, cicilan.totalCicilan - (cicilan.paidAmount || 0)).toLocaleString('id-ID')}
                  </Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>{t('paymentAmount')}</Text>
                  <View style={styles.amountInputContainer}>
                    <Text style={styles.currencyPrefix}>Rp</Text>
                    <TextInput
                      style={styles.amountInput}
                      placeholder="0"
                      placeholderTextColor="#A9A9A9"
                      value={formatCurrencyInput(amount)}
                      onChangeText={handleAmountChange}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>{t('date')}</Text>
                  <TouchableOpacity 
                    style={styles.dateInput}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text style={styles.dateText}>
                      {formatDate(date)}
                    </Text>
                  </TouchableOpacity>
                  {showDatePicker && (
                    <DateTimePicker
                      value={date}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={handleDateChange}
                    />
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>{t('notes')} (Opsional)</Text>
                  <TextInput
                    style={[styles.input, styles.notesInput]}
                    placeholder={t('addNoteOptional')}
                    placeholderTextColor="#A9A9A9"
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    numberOfLines={3}
                  />
                </View>

                <TouchableOpacity 
                  style={[styles.saveButton, { backgroundColor: isDisabled ? '#9AA5B1' : '#005AE0' }]}
                  onPress={isDisabled ? null : handleSave}
                  disabled={isDisabled}
                >
                  <MaterialCommunityIcons 
                    name="check-circle-outline" 
                    size={22} 
                    color="white" 
                    style={{ marginRight: 10 }} 
                  />
                  <Text style={styles.saveButtonText}>{t('save')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
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
    paddingBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  backButtonText: {
    color: 'white',
    fontSize: 18,
    marginLeft: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 10,
  },
  formCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cicilanInfo: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  cicilanName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  cicilanAmount: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginRight: 10,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FF9800',
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    minWidth: 30,
    textAlign: 'right',
  },
  remainingAmount: {
    fontSize: 14,
    color: '#E63950',
    fontWeight: '500',
    marginTop: 5,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: 'white',
    paddingHorizontal: 15,
    height: 50,
  },
  currencyPrefix: {
    fontSize: 16,
    color: '#333',
    marginRight: 5,
  },
  amountInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    height: '100%',
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: 'white',
    padding: 15,
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: 'white',
    padding: 15,
    fontSize: 16,
    color: '#333',
  },
  notesInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#005AE0',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default UpdateCicilanProgressScreen;