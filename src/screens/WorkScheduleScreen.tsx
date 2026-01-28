import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
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
];

export default function WorkScheduleScreen({ navigation }: Props) {
  const { profileData } = useUserProfile();
  console.log('✅ WS Context working! Data:', profileData);
  const { updateWork } = useUserProfile();
  const [workLocation, setWorkLocation] = useState('');
  const [workFromHome, setWorkFromHome] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [commuteMethod, setCommuteMethod] = useState<string>('driving');

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
      workHours: { start: startTime, end: endTime },
      commuteMethod: workFromHome ? 'none' : commuteMethod,
    };

    console.log('Work data:', workData);
    
    // Save to context
    updateWork(workData);
    
    // Navigate to Sleep Schedule screen
    navigation.navigate('SleepSchedule');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Work & Commute</Text>
        <Text style={styles.headerSubtitle}>Step 2 of 4</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Work Location */}
        <View style={styles.section}>
          <Text style={styles.label}>💼 Where do you work?</Text>
          
          <TouchableOpacity
            style={[styles.checkbox, workFromHome && styles.checkboxActive]}
            onPress={() => setWorkFromHome(!workFromHome)}
          >
            <Text style={styles.checkboxText}>
              {workFromHome ? '✓ ' : ''}Work from home
            </Text>
          </TouchableOpacity>

          {!workFromHome && (
            <TextInput
              style={styles.input}
              placeholder="e.g., Downtown LA, 123 Main St"
              value={workLocation}
              onChangeText={setWorkLocation}
            />
          )}
        </View>

        {/* Work Days */}
        <View style={styles.section}>
          <Text style={styles.label}>📅 Which days do you work?</Text>
          <View style={styles.daysContainer}>
            {WORK_DAYS.map(day => (
              <TouchableOpacity
                key={day}
                style={[
                  styles.dayPill,
                  selectedDays.includes(day) && styles.dayPillActive
                ]}
                onPress={() => toggleDay(day)}
              >
                <Text
                  style={[
                    styles.dayText,
                    selectedDays.includes(day) && styles.dayTextActive
                  ]}
                >
                  {day}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.presetButtons}>
            <TouchableOpacity
              style={styles.presetButton}
              onPress={() => setSelectedDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri'])}
            >
              <Text style={styles.presetButtonText}>Weekdays</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.presetButton}
              onPress={() => setSelectedDays(['Sat', 'Sun'])}
            >
              <Text style={styles.presetButtonText}>Weekends</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Work Hours */}
        <View style={styles.section}>
          <Text style={styles.label}>⏰ What are your typical work hours?</Text>
          <View style={styles.timeContainer}>
            <View style={styles.timeInputWrapper}>
              <Text style={styles.timeLabel}>Start</Text>
              <TextInput
                style={styles.timeInput}
                placeholder="09:00"
                value={startTime}
                onChangeText={setStartTime}
                keyboardType="numbers-and-punctuation"
              />
            </View>
            <Text style={styles.timeSeparator}>→</Text>
            <View style={styles.timeInputWrapper}>
              <Text style={styles.timeLabel}>End</Text>
              <TextInput
                style={styles.timeInput}
                placeholder="17:00"
                value={endTime}
                onChangeText={setEndTime}
                keyboardType="numbers-and-punctuation"
              />
            </View>
          </View>
          <Text style={styles.helperText}>Use 24-hour format (e.g., 09:00, 17:00)</Text>
        </View>

        {/* Commute Method */}
        {!workFromHome && (
          <View style={styles.section}>
            <Text style={styles.label}>🚗 How do you commute?</Text>
            <View style={styles.commuteContainer}>
              {COMMUTE_METHODS.map(method => (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.commuteCard,
                    commuteMethod === method.id && styles.commuteCardActive
                  ]}
                  onPress={() => setCommuteMethod(method.id)}
                >
                  <Text style={styles.commuteIcon}>{method.icon}</Text>
                  <Text
                    style={[
                      styles.commuteLabel,
                      commuteMethod === method.id && styles.commuteLabelActive
                    ]}
                  >
                    {method.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Continue to Sleep Schedule</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4A90E2',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
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
    opacity: 0.8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  helperText: {
    fontSize: 13,
    color: '#666',
    marginTop: 6,
  },
  checkbox: {
    backgroundColor: 'white',
    padding: 14,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    marginBottom: 12,
  },
  checkboxActive: {
    borderColor: '#4A90E2',
    backgroundColor: '#E3F2FD',
  },
  checkboxText: {
    fontSize: 16,
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayPill: {
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  dayPillActive: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  dayText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  dayTextActive: {
    color: 'white',
  },
  presetButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  presetButton: {
    flex: 1,
    backgroundColor: '#E0E0E0',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  presetButtonText: {
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeInputWrapper: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  timeInput: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 10,
    fontSize: 18,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    fontWeight: '500',
  },
  timeSeparator: {
    fontSize: 24,
    color: '#4A90E2',
    marginHorizontal: 16,
  },
  commuteContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  commuteCard: {
    width: '48%',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
  },
  commuteCardActive: {
    borderColor: '#4A90E2',
    backgroundColor: '#E3F2FD',
  },
  commuteIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  commuteLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  commuteLabelActive: {
    color: '#4A90E2',
    fontWeight: '600',
  },
  bottomContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  continueButton: {
    backgroundColor: '#4A90E2',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
