import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Modal,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useUserProfile } from '../context/UserProfileContext';

type Props = {
  navigation: any;
};

const NOISE_SENSITIVITY = [
  { level: 1, label: 'Not at all', icon: '😴' },
  { level: 3, label: 'Somewhat', icon: '😐' },
  { level: 5, label: 'Moderately', icon: '😟' },
  { level: 7, label: 'Very', icon: '😣' },
  { level: 10, label: 'Extremely', icon: '😫' },
];

export default function SleepScheduleScreen({ navigation }: Props) {
  const { updateSleep } = useUserProfile();
  
  // Time states as Date objects for DateTimePicker
  const [bedtime, setBedtime] = useState(new Date(2024, 0, 1, 23, 0));
  const [wakeTime, setWakeTime] = useState(new Date(2024, 0, 1, 7, 0));
  const [noiseSensitivity, setNoiseSensitivity] = useState(5);
  const [weekendDifferent, setWeekendDifferent] = useState(false);
  const [weekendBedtime, setWeekendBedtime] = useState(new Date(2024, 0, 1, 0, 0));
  const [weekendWakeTime, setWeekendWakeTime] = useState(new Date(2024, 0, 1, 9, 0));

  // Modal states for iOS
  const [showBedtimePicker, setShowBedtimePicker] = useState(false);
  const [showWakeTimePicker, setShowWakeTimePicker] = useState(false);
  const [showWeekendBedtimePicker, setShowWeekendBedtimePicker] = useState(false);
  const [showWeekendWakeTimePicker, setShowWeekendWakeTimePicker] = useState(false);

  const formatTime = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleContinue = () => {
    const sleepData = {
      bedtime: formatTime(bedtime),
      wakeTime: formatTime(wakeTime),
      noiseSensitivity,
      weekendDifferent,
      weekendSleep: weekendDifferent ? {
        bedtime: formatTime(weekendBedtime),
        wakeTime: formatTime(weekendWakeTime),
      } : undefined,
    };

    console.log('Sleep data:', sleepData);
    updateSleep(sleepData);
    navigation.navigate('Hobbies');
  };

  const calculateSleepHours = (bed: Date, wake: Date): string => {
    let bedMinutes = bed.getHours() * 60 + bed.getMinutes();
    let wakeMinutes = wake.getHours() * 60 + wake.getMinutes();
    
    if (wakeMinutes <= bedMinutes) {
      wakeMinutes += 24 * 60;
    }
    
    const totalMinutes = wakeMinutes - bedMinutes;
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
        <Text style={styles.headerTitle}>Sleep & Rest</Text>
        <Text style={styles.headerSubtitle}>Step 3 of 4</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Sleep Schedule Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>When do you sleep?</Text>
          <Text style={styles.sectionDescription}>
            Your typical weekday sleep schedule
          </Text>

          <View style={styles.timesRow}>
            {renderTimePicker(
              'Bedtime',
              bedtime,
              setBedtime,
              showBedtimePicker,
              setShowBedtimePicker,
              '🌙'
            )}

            {renderTimePicker(
              'Wake Up',
              wakeTime,
              setWakeTime,
              showWakeTimePicker,
              setShowWakeTimePicker,
              '☀️'
            )}
          </View>

          <View style={styles.sleepSummary}>
            <Text style={styles.sleepSummaryText}>
              💤 You'll get {calculateSleepHours(bedtime, wakeTime)} of sleep
            </Text>
          </View>
        </View>

        {/* Weekend Sleep Toggle */}
        <TouchableOpacity
          style={styles.weekendToggle}
          onPress={() => setWeekendDifferent(!weekendDifferent)}
        >
          <View style={styles.weekendToggleLeft}>
            <Text style={styles.weekendToggleIcon}>🎉</Text>
            <View>
              <Text style={styles.weekendToggleTitle}>Different on weekends?</Text>
              <Text style={styles.weekendToggleSubtitle}>
                {weekendDifferent ? 'Enabled' : 'Tap to set weekend hours'}
              </Text>
            </View>
          </View>
          <View style={[styles.switch, weekendDifferent && styles.switchActive]}>
            <View style={[styles.switchThumb, weekendDifferent && styles.switchThumbActive]} />
          </View>
        </TouchableOpacity>

        {/* Weekend Sleep Section */}
        {weekendDifferent && (
          <View style={[styles.section, styles.weekendSection]}>
            <Text style={styles.sectionTitle}>Weekend Schedule</Text>
            <View style={styles.timesRow}>
              {renderTimePicker(
                'Bedtime',
                weekendBedtime,
                setWeekendBedtime,
                showWeekendBedtimePicker,
                setShowWeekendBedtimePicker,
                '🌙'
              )}

              {renderTimePicker(
                'Wake Up',
                weekendWakeTime,
                setWeekendWakeTime,
                showWeekendWakeTimePicker,
                setShowWeekendWakeTimePicker,
                '☀️'
              )}
            </View>

            <View style={styles.sleepSummary}>
              <Text style={styles.sleepSummaryText}>
                💤 Weekend sleep: {calculateSleepHours(weekendBedtime, weekendWakeTime)}
              </Text>
            </View>
          </View>
        )}

        {/* Noise Sensitivity Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How sensitive are you to noise?</Text>
          <Text style={styles.sectionDescription}>
            This helps us understand how noise will affect your sleep
          </Text>

          <View style={styles.sensitivityOptions}>
            {NOISE_SENSITIVITY.map((option) => (
              <TouchableOpacity
                key={option.level}
                style={[
                  styles.sensitivityButton,
                  noiseSensitivity === option.level && styles.sensitivityButtonActive,
                ]}
                onPress={() => setNoiseSensitivity(option.level)}
              >
                <Text style={styles.sensitivityIcon}>{option.icon}</Text>
                <Text
                  style={[
                    styles.sensitivityLabel,
                    noiseSensitivity === option.level && styles.sensitivityLabelActive,
                  ]}
                >
                  {option.label}
                </Text>
                <Text
                  style={[
                    styles.sensitivityLevel,
                    noiseSensitivity === option.level && styles.sensitivityLevelActive,
                  ]}
                >
                  {option.level}/10
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

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
    backgroundColor: '#6A5ACD',
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
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
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
  sleepSummary: {
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  sleepSummaryText: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '600',
  },
  weekendToggle: {
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
  weekendToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  weekendToggleIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  weekendToggleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  weekendToggleSubtitle: {
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
  weekendSection: {
    backgroundColor: '#FFF3E0',
    padding: 16,
    borderRadius: 12,
  },
  sensitivityOptions: {
    gap: 12,
  },
  sensitivityButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  sensitivityButtonActive: {
    borderColor: '#6A5ACD',
    backgroundColor: '#F3F0FF',
  },
  sensitivityIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  sensitivityLabel: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  sensitivityLabelActive: {
    color: '#6A5ACD',
    fontWeight: '600',
  },
  sensitivityLevel: {
    fontSize: 14,
    color: '#999',
    fontWeight: '600',
  },
  sensitivityLevelActive: {
    color: '#6A5ACD',
  },
  continueButton: {
    backgroundColor: '#6A5ACD',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#6A5ACD',
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
    color: '#6A5ACD',
    fontWeight: '600',
  },
  timePicker: {
    height: 200,
  },
});
