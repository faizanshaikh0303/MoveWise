import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useUserProfile } from '../context/UserProfileContext';

type Props = {
  navigation: any;
};

const HOBBIES = [
  { id: 'gym', label: 'Gym/Fitness', icon: '🏋️' },
  { id: 'hiking', label: 'Hiking/Outdoors', icon: '🥾' },
  { id: 'dining', label: 'Dining Out', icon: '🍽️' },
  { id: 'coffee', label: 'Coffee Shops', icon: '☕' },
  { id: 'bars', label: 'Bars/Nightlife', icon: '🍺' },
  { id: 'shopping', label: 'Shopping', icon: '🛍️' },
  { id: 'parks', label: 'Parks/Recreation', icon: '🌳' },
  { id: 'library', label: 'Library/Reading', icon: '📚' },
  { id: 'cinema', label: 'Movies/Cinema', icon: '🎬' },
  { id: 'sports', label: 'Sports/Games', icon: '⚽' },
  { id: 'arts', label: 'Arts/Culture', icon: '🎨' },
  { id: 'music', label: 'Live Music', icon: '🎵' },
];

const ACTIVITY_TIMES = [
  { id: 'early-morning', label: 'Early Morning (5am-8am)', icon: '🌅' },
  { id: 'morning', label: 'Morning (8am-12pm)', icon: '☀️' },
  { id: 'afternoon', label: 'Afternoon (12pm-5pm)', icon: '🌤️' },
  { id: 'evening', label: 'Evening (5pm-9pm)', icon: '🌆' },
  { id: 'night', label: 'Night (9pm-12am)', icon: '🌙' },
  { id: 'late-night', label: 'Late Night (12am+)', icon: '🌃' },
];

export default function HobbiesScreen({ navigation }: Props) {
  const { profileData } = useUserProfile();
  console.log('✅ HS Context working! Data:', profileData);
  const { updateLifestyle } = useUserProfile();
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>([]);
  const [activityTimes, setActivityTimes] = useState<string[]>([]);

  const toggleHobby = (hobbyId: string) => {
    if (selectedHobbies.includes(hobbyId)) {
      setSelectedHobbies(selectedHobbies.filter(h => h !== hobbyId));
    } else {
      setSelectedHobbies([...selectedHobbies, hobbyId]);
    }
  };

  const toggleActivityTime = (timeId: string) => {
    if (activityTimes.includes(timeId)) {
      setActivityTimes(activityTimes.filter(t => t !== timeId));
    } else {
      setActivityTimes([...activityTimes, timeId]);
    }
  };

  const handleContinue = () => {
    if (selectedHobbies.length === 0) {
      Alert.alert('Select Activities', 'Please select at least one hobby or activity');
      return;
    }

    if (activityTimes.length === 0) {
      Alert.alert('Select Times', 'Please select when you are typically active outside');
      return;
    }

    const lifestyleData = {
      hobbies: selectedHobbies,
      activityTimes,
    };

    console.log('Lifestyle data:', lifestyleData);
    
    // Save to context
    updateLifestyle(lifestyleData);
    
    navigation.navigate('AnalysisLoading');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hobbies & Lifestyle</Text>
        <Text style={styles.headerSubtitle}>Step 4 of 4</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.label}>🎯 What do you enjoy doing?</Text>
          <Text style={styles.helperText}>
            Select all that apply - we'll find nearby amenities
          </Text>

          <View style={styles.hobbiesGrid}>
            {HOBBIES.map((hobby) => (
              <TouchableOpacity
                key={hobby.id}
                style={[
                  styles.hobbyCard,
                  selectedHobbies.includes(hobby.id) && styles.hobbyCardActive
                ]}
                onPress={() => toggleHobby(hobby.id)}
              >
                <Text style={styles.hobbyIcon}>{hobby.icon}</Text>
                <Text
                  style={[
                    styles.hobbyLabel,
                    selectedHobbies.includes(hobby.id) && styles.hobbyLabelActive
                  ]}
                  numberOfLines={2}
                >
                  {hobby.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {selectedHobbies.length > 0 && (
            <View style={styles.selectedCountCard}>
              <Text style={styles.selectedCountText}>
                ✓ {selectedHobbies.length} {selectedHobbies.length === 1 ? 'activity' : 'activities'} selected
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>⏰ When are you typically active outside?</Text>
          <Text style={styles.helperText}>
            This helps us analyze safety during your active hours
          </Text>

          <View style={styles.timesContainer}>
            {ACTIVITY_TIMES.map((time) => (
              <TouchableOpacity
                key={time.id}
                style={[
                  styles.timeCard,
                  activityTimes.includes(time.id) && styles.timeCardActive
                ]}
                onPress={() => toggleActivityTime(time.id)}
              >
                <Text style={styles.timeIcon}>{time.icon}</Text>
                <Text
                  style={[
                    styles.timeLabel,
                    activityTimes.includes(time.id) && styles.timeLabelActive
                  ]}
                >
                  {time.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>🔍 What we'll analyze:</Text>
          <Text style={styles.infoItem}>• Proximity to places matching your interests</Text>
          <Text style={styles.infoItem}>• Safety during your typical activity hours</Text>
          <Text style={styles.infoItem}>• Noise levels when you're home vs. out</Text>
          <Text style={styles.infoItem}>• Overall lifestyle compatibility score</Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            (selectedHobbies.length === 0 || activityTimes.length === 0) && styles.continueButtonDisabled
          ]}
          onPress={handleContinue}
          disabled={selectedHobbies.length === 0 || activityTimes.length === 0}
        >
          <Text style={styles.continueButtonText}>
            {selectedHobbies.length > 0 && activityTimes.length > 0
              ? 'Analyze My Move 🚀'
              : 'Select Activities & Times'}
          </Text>
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
    marginBottom: 6,
  },
  helperText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  hobbiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  hobbyCard: {
    width: '48%',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
    minHeight: 100,
    justifyContent: 'center',
  },
  hobbyCardActive: {
    borderColor: '#4A90E2',
    backgroundColor: '#E3F2FD',
  },
  hobbyIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  hobbyLabel: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
    textAlign: 'center',
  },
  hobbyLabelActive: {
    color: '#4A90E2',
    fontWeight: '600',
  },
  selectedCountCard: {
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  selectedCountText: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '600',
  },
  timesContainer: {
    gap: 10,
  },
  timeCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
  },
  timeCardActive: {
    borderColor: '#FF9800',
    backgroundColor: '#FFF3E0',
  },
  timeIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  timeLabel: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  timeLabelActive: {
    color: '#E65100',
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#E8F4FD',
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
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: '#ccc',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
