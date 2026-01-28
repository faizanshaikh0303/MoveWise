import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
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
  const { profileData } = useUserProfile();
  console.log('✅ SS Context working! Data:', profileData);
  const { updateSleep } = useUserProfile();
  const [bedtime, setBedtime] = useState('23:00');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [noiseSensitivity, setNoiseSensitivity] = useState(5);
  const [weekendDifferent, setWeekendDifferent] = useState(false);
  const [weekendBedtime, setWeekendBedtime] = useState('00:00');
  const [weekendWakeTime, setWeekendWakeTime] = useState('09:00');

  const handleContinue = () => {
    const sleepData = {
      bedtime,
      wakeTime,
      noiseSensitivity,
      weekendDifferent,
      weekendSleep: weekendDifferent ? {
        bedtime: weekendBedtime,
        wakeTime: weekendWakeTime,
      } : undefined,
    };

    console.log('Sleep data:', sleepData);
    
    // Save to context
    updateSleep(sleepData);
    
    navigation.navigate('Hobbies');
  };

  const calculateSleepHours = (bedtime: string, wakeTime: string) => {
    const [bedHour, bedMin] = bedtime.split(':').map(Number);
    const [wakeHour, wakeMin] = wakeTime.split(':').map(Number);
    
    let bedMinutes = bedHour * 60 + bedMin;
    let wakeMinutes = wakeHour * 60 + wakeMin;
    
    if (wakeMinutes <= bedMinutes) {
      wakeMinutes += 24 * 60;
    }
    
    const totalMinutes = wakeMinutes - bedMinutes;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return `${hours}h ${minutes}m`;
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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.label}>😴 When do you usually sleep (weekdays)?</Text>
          
          <View style={styles.timeContainer}>
            <View style={styles.timeInputWrapper}>
              <Text style={styles.timeLabel}>Bedtime</Text>
              <TextInput
                style={styles.timeInput}
                placeholder="23:00"
                value={bedtime}
                onChangeText={setBedtime}
                keyboardType="numbers-and-punctuation"
              />
            </View>
            
            <Text style={styles.timeSeparator}>→</Text>
            
            <View style={styles.timeInputWrapper}>
              <Text style={styles.timeLabel}>Wake Up</Text>
              <TextInput
                style={styles.timeInput}
                placeholder="07:00"
                value={wakeTime}
                onChangeText={setWakeTime}
                keyboardType="numbers-and-punctuation"
              />
            </View>
          </View>

          <View style={styles.sleepDurationCard}>
            <Text style={styles.sleepDurationText}>
              💤 {calculateSleepHours(bedtime, wakeTime)} of sleep
            </Text>
          </View>

          <Text style={styles.helperText}>
            Use 24-hour format (e.g., 23:00 for 11 PM)
          </Text>
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.checkbox, weekendDifferent && styles.checkboxActive]}
            onPress={() => setWeekendDifferent(!weekendDifferent)}
          >
            <Text style={styles.checkboxText}>
              {weekendDifferent ? '✓ ' : ''}My weekend sleep schedule is different
            </Text>
          </TouchableOpacity>

          {weekendDifferent && (
            <>
              <Text style={styles.label}>🌙 Weekend sleep schedule</Text>
              <View style={styles.timeContainer}>
                <View style={styles.timeInputWrapper}>
                  <Text style={styles.timeLabel}>Bedtime</Text>
                  <TextInput
                    style={styles.timeInput}
                    placeholder="00:00"
                    value={weekendBedtime}
                    onChangeText={setWeekendBedtime}
                    keyboardType="numbers-and-punctuation"
                  />
                </View>
                
                <Text style={styles.timeSeparator}>→</Text>
                
                <View style={styles.timeInputWrapper}>
                  <Text style={styles.timeLabel}>Wake Up</Text>
                  <TextInput
                    style={styles.timeInput}
                    placeholder="09:00"
                    value={weekendWakeTime}
                    onChangeText={setWeekendWakeTime}
                    keyboardType="numbers-and-punctuation"
                  />
                </View>
              </View>

              <View style={styles.sleepDurationCard}>
                <Text style={styles.sleepDurationText}>
                  💤 {calculateSleepHours(weekendBedtime, weekendWakeTime)} of sleep
                </Text>
              </View>
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>🔊 How sensitive are you to noise when sleeping?</Text>
          
          <View style={styles.sensitivityContainer}>
            {NOISE_SENSITIVITY.map((item) => (
              <TouchableOpacity
                key={item.level}
                style={[
                  styles.sensitivityCard,
                  noiseSensitivity === item.level && styles.sensitivityCardActive
                ]}
                onPress={() => setNoiseSensitivity(item.level)}
              >
                <Text style={styles.sensitivityIcon}>{item.icon}</Text>
                <Text
                  style={[
                    styles.sensitivityLabel,
                    noiseSensitivity === item.level && styles.sensitivityLabelActive
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>🛏️ Why this matters:</Text>
          <Text style={styles.infoItem}>• Construction noise during your sleep hours</Text>
          <Text style={styles.infoItem}>• Traffic patterns when you're resting</Text>
          <Text style={styles.infoItem}>• Neighborhood activity during your bedtime</Text>
          <Text style={styles.infoItem}>• Airport/train noise exposure</Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Continue to Hobbies & Lifestyle</Text>
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
  sleepDurationCard: {
    backgroundColor: '#E8F4FD',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  sleepDurationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A90E2',
  },
  checkbox: {
    backgroundColor: 'white',
    padding: 14,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    marginBottom: 16,
  },
  checkboxActive: {
    borderColor: '#4A90E2',
    backgroundColor: '#E3F2FD',
  },
  checkboxText: {
    fontSize: 16,
    color: '#333',
  },
  sensitivityContainer: {
    gap: 10,
  },
  sensitivityCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
  },
  sensitivityCardActive: {
    borderColor: '#4A90E2',
    backgroundColor: '#E3F2FD',
  },
  sensitivityIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  sensitivityLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  sensitivityLabelActive: {
    color: '#4A90E2',
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 20,
    marginTop: 10,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  infoItem: {
    fontSize: 15,
    color: '#555',
    marginBottom: 8,
    lineHeight: 22,
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
