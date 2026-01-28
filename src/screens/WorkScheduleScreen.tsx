import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useUserProfile } from '../context/UserProfileContext';

type Props = {
  navigation: any;
};

const WORK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const COMMUTE_METHODS = [
  { id: 'driving', label: 'Driving', icon: '🚗' },
  { id: 'transit', label: 'Public Transit', icon: '🚌' },
  { id: 'biking', label: 'Biking', icon: '🚴' },
  { id: 'walking', label: 'Walking', icon: '🚶' },
  { id: 'varies', label: 'Varies', icon: '🔄' },
  { id: 'none', label: 'No Commute', icon: '🏠' },
];

export default function WorkScheduleScreen({ navigation }: Props) {
  const { updateWork } = useUserProfile();
  const [workLocation, setWorkLocation] = useState('');
  const [workFromHome, setWorkFromHome] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  
  // Time states as Date objects
  const [startTime, setStartTime] = useState(new Date(2024, 0, 1, 9, 0));
  const [endTime, setEndTime] = useState(new Date(2024, 0, 1, 17, 0));
  
  const [commuteMethod, setCommuteMethod] = useState<string>('driving');

  // Modal states for iOS
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const formatTime = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleContinue = () => {
    if (!workFromHome && !workLocation.trim()) {
      Alert.alert('Missing Info', 'Please enter your work location or select "Work from home"');
      return;
    }

    if (selectedDays.length === 0) {
      Alert.alert('Missing Info', 'Please select at least one work day');
      return;
    }

    const workData = {
      location: workFromHome ? 'Work from home' : workLocation,
      workDays: selectedDays,
      workHours: {
        start: formatTime(startTime),
        end: formatTime(endTime),
      },
      commuteMethod: workFromHome ? 'none' : commuteMethod,
    };

    console.log('Work data:', workData);
    updateWork(workData);
    navigation.navigate('SleepSchedule');
  };

  const calculateWorkHours = (start: Date, end: Date): string => {
    let startMinutes = start.getHours() * 60 + start.getMinutes();
    let endMinutes = end.getHours() * 60 + end.getMinutes();
    
    if (endMinutes <= startMinutes) {
      endMinutes += 24 * 60;
    }
    
    const totalMinutes = endMinutes - startMinutes;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return `${hours}h ${minutes}m`;
  };

  const renderTimePicker = (
    label: string,
    value: Date,
    onChange: (date: Date) => void,
    showPicker: boolean,
    setShowPicker: (show: boolean) => void,
    icon: string
  ) => {
    return (
      <View style={styles.timePickerContainer}>
        <Text style={styles.timeLabel}>{icon} {label}</Text>
        <TouchableOpacity
          style={styles.timeButton}
          onPress={() => setShowPicker(true)}
        >
          <Text style={styles.timeButtonText}>{formatTime(value)}</Text>
        </TouchableOpacity>

        {Platform.OS === 'ios' ? (
          <Modal
            visible={showPicker}
            transparent={true}
            animationType="fade"
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => setShowPicker(false)}>
                    <Text style={styles.modalCancel}>Cancel</Text>
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>{label}</Text>
                  <TouchableOpacity onPress={() => setShowPicker(false)}>
                    <Text style={styles.modalDone}>Done</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={value}
                  mode="time"
                  display="spinner"
                  onChange={(event, selectedDate) => {
                    if (selectedDate) {
                      onChange(selectedDate);
                    }
                  }}
                  style={styles.timePicker}
                  textColor="#000"
                />
              </View>
            </View>
          </Modal>
        ) : (
          showPicker && (
            <DateTimePicker
              value={value}
              mode="time"
              display="default"
              onChange={(event, selectedDate) => {
                setShowPicker(false);
                if (selectedDate) {
                  onChange(selectedDate);
                }
              }}
            />
          )
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Work Schedule</Text>
        <Text style={styles.headerSubtitle}>Step 2 of 4</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Work Location Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Where do you work?</Text>

          <TouchableOpacity
            style={styles.wfhToggle}
            onPress={() => setWorkFromHome(!workFromHome)}
          >
            <View style={styles.wfhToggleLeft}>
              <Text style={styles.wfhToggleIcon}>🏠</Text>
              <View>
                <Text style={styles.wfhToggleTitle}>Work from home</Text>
                <Text style={styles.wfhToggleSubtitle}>
                  {workFromHome ? 'No commute needed' : 'Tap if you work remotely'}
                </Text>
              </View>
            </View>
            <View style={[styles.switch, workFromHome && styles.switchActive]}>
              <View style={[styles.switchThumb, workFromHome && styles.switchThumbActive]} />
            </View>
          </TouchableOpacity>

          {!workFromHome && (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Work Address</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your work address..."
                placeholderTextColor="#999"
                value={workLocation}
                onChangeText={setWorkLocation}
              />
            </View>
          )}
        </View>

        {/* Work Days Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Which days do you work?</Text>
          <View style={styles.daysGrid}>
            {WORK_DAYS.map((day) => (
              <TouchableOpacity
                key={day}
                style={[
                  styles.dayButton,
                  selectedDays.includes(day) && styles.dayButtonActive,
                ]}
                onPress={() => toggleDay(day)}
              >
                <Text
                  style={[
                    styles.dayButtonText,
                    selectedDays.includes(day) && styles.dayButtonTextActive,
                  ]}
                >
                  {day}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Work Hours Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What are your work hours?</Text>
          
          <View style={styles.timesRow}>
            {renderTimePicker(
              'Start Time',
              startTime,
              setStartTime,
              showStartTimePicker,
              setShowStartTimePicker,
              '🕐'
            )}

            {renderTimePicker(
              'End Time',
              endTime,
              setEndTime,
              showEndTimePicker,
              setShowEndTimePicker,
              '🕔'
            )}
          </View>

          <View style={styles.workSummary}>
            <Text style={styles.workSummaryText}>
              ⏱️ You work {calculateWorkHours(startTime, endTime)} per day
            </Text>
          </View>
        </View>

        {/* Commute Method Section */}
        {!workFromHome && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How do you commute?</Text>
            <View style={styles.commuteGrid}>
              {COMMUTE_METHODS.filter(m => m.id !== 'none').map((method) => (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.commuteButton,
                    commuteMethod === method.id && styles.commuteButtonActive,
                  ]}
                  onPress={() => setCommuteMethod(method.id)}
                >
                  <Text style={styles.commuteIcon}>{method.icon}</Text>
                  <Text
                    style={[
                      styles.commuteLabel,
                      commuteMethod === method.id && styles.commuteLabelActive,
                    ]}
                  >
                    {method.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Continue Button */}
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue →</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: '#FF6B6B',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    fontSize: 16,
    color: 'white',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  wfhToggle: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  wfhToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  wfhToggleIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  wfhToggleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  wfhToggleSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  switch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ccc',
    padding: 2,
    justifyContent: 'center',
  },
  switchActive: {
    backgroundColor: '#4CAF50',
  },
  switchThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  switchThumbActive: {
    transform: [{ translateX: 22 }],
  },
  inputContainer: {
    marginTop: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    color: '#333',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  dayButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  dayButtonActive: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  dayButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  dayButtonTextActive: {
    color: 'white',
  },
  timesRow: {
    flexDirection: 'row',
    gap: 16,
  },
  timePickerContainer: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  timeButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  timeButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  workSummary: {
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  workSummaryText: {
    fontSize: 14,
    color: '#E65100',
    fontWeight: '600',
  },
  commuteGrid: {
    gap: 12,
  },
  commuteButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  commuteButtonActive: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FFF5F5',
  },
  commuteIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  commuteLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  commuteLabelActive: {
    color: '#FF6B6B',
    fontWeight: '600',
  },
  continueButton: {
    backgroundColor: '#FF6B6B',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // iOS Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalCancel: {
    fontSize: 16,
    color: '#999',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  modalDone: {
    fontSize: 16,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  timePicker: {
    height: 200,
  },
});
