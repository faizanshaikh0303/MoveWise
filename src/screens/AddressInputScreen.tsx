import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  LogBox,
} from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { GOOGLE_MAPS_API_KEY } from '@env';
import { useUserProfile } from '../context/UserProfileContext';

// Suppress VirtualizedList warning (safe for Google Places Autocomplete)
LogBox.ignoreLogs([
  'VirtualizedLists should never be nested',
]);

type Props = {
  navigation: any;
};

interface AddressDetails {
  description: string;
  lat: number;
  lng: number;
}

export default function AddressInputScreen({ navigation }: Props) {
  const { updateAddresses } = useUserProfile();
  const [currentAddress, setCurrentAddress] = useState<AddressDetails | null>(null);
  const [newAddress, setNewAddress] = useState<AddressDetails | null>(null);
  
  const currentRef = useRef<any>(null);
  const newRef = useRef<any>(null);

  const handleContinue = () => {
    // Validation
    if (!currentAddress) {
      Alert.alert('Missing Information', 'Please select your current address');
      return;
    }
    if (!newAddress) {
      Alert.alert('Missing Information', 'Please select your new address');
      return;
    }
    if (currentAddress.description.toLowerCase() === newAddress.description.toLowerCase()) {
      Alert.alert('Same Address', 'Current and new addresses cannot be the same');
      return;
    }

    // Calculate distance
    const distance = calculateDistance(
      currentAddress.lat,
      currentAddress.lng,
      newAddress.lat,
      newAddress.lng
    );

    console.log('📏 Distance:', distance, 'miles');

    // Save to context
    updateAddresses({
      current: currentAddress,
      new: newAddress,
      distance: parseFloat(distance.toFixed(1)),
    });

    // Navigate to next screen
    navigation.navigate('WorkSchedule');
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 3959; // Earth's radius in miles
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const toRad = (value: number): number => {
    return (value * Math.PI) / 180;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Where are you moving?</Text>
        <Text style={styles.subtitle}>Let's compare your addresses</Text>
      </View>

      {/* Scrollable Content */}
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
        {/* Current Address */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>📍 Current Address</Text>
          <Text style={styles.helperText}>Where do you live now?</Text>
          
          <View style={styles.autocompleteWrapper}>
            <GooglePlacesAutocomplete
              ref={currentRef}
              placeholder="Start typing your address..."
              minLength={2}
              listViewDisplayed="auto"
              fetchDetails={true}
              onPress={(data, details = null) => {
                console.log('✅ Current address selected:', data.description);
                if (details) {
                  // Check if address is in California
                  const isInCalifornia = details.address_components?.some(
                    component => 
                      component.types.includes('administrative_area_level_1') && 
                      component.short_name === 'CA'
                  );
                  
                  if (!isInCalifornia) {
                    Alert.alert(
                      'California Only', 
                      'Please select an address in California. This app currently only supports California addresses.',
                      [{ text: 'OK' }]
                    );
                    return;
                  }
                  
                  setCurrentAddress({
                    description: data.description,
                    lat: details.geometry.location.lat,
                    lng: details.geometry.location.lng,
                  });
                }
              }}
              query={{
                key: GOOGLE_MAPS_API_KEY,
                language: 'en',
                components: 'country:us',
              }}
              requestUrl={{
                useOnPlatform: 'web',
                url: 'https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api',
              }}
              enablePoweredByContainer={false}
              styles={{
                container: {
                  flex: 0,
                  zIndex: 1000,
                },
                textInputContainer: {
                  backgroundColor: 'white',
                  borderRadius: 12,
                  paddingHorizontal: 10,
                  borderWidth: 2,
                  borderColor: currentAddress ? '#4CAF50' : '#E0E0E0',
                },
                textInput: {
                  height: 50,
                  fontSize: 16,
                  color: '#333',
                  backgroundColor: 'transparent',
                },
                listView: {
                  position: 'absolute',
                  top: 55,
                  left: 0,
                  right: 0,
                  backgroundColor: 'white',
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: '#E0E0E0',
                  maxHeight: 200,
                  elevation: 5,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 4,
                  zIndex: 1001,
                },
                row: {
                  backgroundColor: 'white',
                  padding: 13,
                  height: 54,
                  flexDirection: 'row',
                },
                separator: {
                  height: 0.5,
                  backgroundColor: '#E0E0E0',
                },
                description: {
                  fontSize: 14,
                  color: '#333',
                },
                loader: {
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                  height: 20,
                },
              }}
              debounce={300}
              nearbyPlacesAPI="GooglePlacesSearch"
              GooglePlacesSearchQuery={{
                rankby: 'distance',
              }}
            />
          </View>

          {currentAddress && (
            <View style={styles.selectedBox}>
              <Text style={styles.selectedIcon}>✓</Text>
              <Text style={styles.selectedText}>{currentAddress.description}</Text>
            </View>
          )}
        </View>

        {/* Spacer */}
        <View style={{ height: 20 }} />

        {/* New Address */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>🎯 New Address</Text>
          <Text style={styles.helperText}>Where are you thinking of moving?</Text>
          
          <View style={styles.autocompleteWrapper}>
            <GooglePlacesAutocomplete
              ref={newRef}
              placeholder="Start typing the new address..."
              minLength={2}
              listViewDisplayed="auto"
              fetchDetails={true}
              onPress={(data, details = null) => {
                console.log('✅ New address selected:', data.description);
                if (details) {
                  // Check if address is in California
                  const isInCalifornia = details.address_components?.some(
                    component => 
                      component.types.includes('administrative_area_level_1') && 
                      component.short_name === 'CA'
                  );
                  
                  if (!isInCalifornia) {
                    Alert.alert(
                      'California Only', 
                      'Please select an address in California. This app currently only supports California addresses.',
                      [{ text: 'OK' }]
                    );
                    return;
                  }
                  
                  setNewAddress({
                    description: data.description,
                    lat: details.geometry.location.lat,
                    lng: details.geometry.location.lng,
                  });
                }
              }}
              query={{
                key: GOOGLE_MAPS_API_KEY,
                language: 'en',
                components: 'country:us',
              }}
              requestUrl={{
                useOnPlatform: 'web',
                url: 'https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api',
              }}
              enablePoweredByContainer={false}
              styles={{
                container: {
                  flex: 0,
                  zIndex: 999,
                },
                textInputContainer: {
                  backgroundColor: 'white',
                  borderRadius: 12,
                  paddingHorizontal: 10,
                  borderWidth: 2,
                  borderColor: newAddress ? '#4CAF50' : '#E0E0E0',
                },
                textInput: {
                  height: 50,
                  fontSize: 16,
                  color: '#333',
                  backgroundColor: 'transparent',
                },
                listView: {
                  position: 'absolute',
                  top: 55,
                  left: 0,
                  right: 0,
                  backgroundColor: 'white',
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: '#E0E0E0',
                  maxHeight: 200,
                  elevation: 5,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 4,
                  zIndex: 1000,
                },
                row: {
                  backgroundColor: 'white',
                  padding: 13,
                  height: 54,
                  flexDirection: 'row',
                },
                separator: {
                  height: 0.5,
                  backgroundColor: '#E0E0E0',
                },
                description: {
                  fontSize: 14,
                  color: '#333',
                },
                loader: {
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                  height: 20,
                },
              }}
              debounce={300}
              nearbyPlacesAPI="GooglePlacesSearch"
              GooglePlacesSearchQuery={{
                rankby: 'distance',
              }}
            />
          </View>

          {newAddress && (
            <View style={styles.selectedBox}>
              <Text style={styles.selectedIcon}>✓</Text>
              <Text style={styles.selectedText}>{newAddress.description}</Text>
            </View>
          )}
        </View>

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* Distance Display */}
        {currentAddress && newAddress && (
          <View style={styles.distanceCard}>
            <Text style={styles.distanceIcon}>📏</Text>
            <Text style={styles.distanceText}>
              Distance: {calculateDistance(currentAddress.lat, currentAddress.lng, newAddress.lat, newAddress.lng).toFixed(1)} miles
            </Text>
          </View>
        )}

        {/* Continue Button */}
        <TouchableOpacity
          style={[styles.continueButton, (!currentAddress || !newAddress) && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={!currentAddress || !newAddress}
        >
          <Text style={styles.continueButtonText}>
            Continue →
          </Text>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: '#4A90E2',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 20,
  },
  inputSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  helperText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  autocompleteWrapper: {
    height: 50,
    marginBottom: 10,
  },
  selectedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  selectedIcon: {
    fontSize: 18,
    marginRight: 8,
    color: '#4CAF50',
  },
  selectedText: {
    flex: 1,
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '500',
  },
  distanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  distanceIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  distanceText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  continueButton: {
    backgroundColor: '#4A90E2',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  continueButtonDisabled: {
    backgroundColor: '#CCCCCC',
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
