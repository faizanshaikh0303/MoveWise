import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  LogBox,
} from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { GOOGLE_MAPS_API_KEY } from '@env';
import AddressMap from '../components/AddressMap';
import { saveComparison } from '../services/comparisonService';
import { useUserProfile } from '../context/UserProfileContext';

// Suppress the VirtualizedList warning for GooglePlacesAutocomplete
LogBox.ignoreLogs([
  'VirtualizedLists should never be nested inside plain ScrollViews',
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
  const { profileData } = useUserProfile();
  console.log('✅ AI Context working! Data:', profileData);
  const { updateAddresses } = useUserProfile();
  const [currentAddress, setCurrentAddress] = useState<AddressDetails | null>(null);
  const [newAddress, setNewAddress] = useState<AddressDetails | null>(null);
  
  const currentRef = useRef<any>(null);
  const newRef = useRef<any>(null);

  const handleContinue = async () => {
    console.log('🔵 handleContinue called');
    
    // Basic validation
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

    console.log('✅ Validation passed');

    // Calculate distance
    const distance = calculateDistance(
        currentAddress.lat,
        currentAddress.lng,
        newAddress.lat,
        newAddress.lng
    );

    console.log('📏 Distance calculated:', distance);

    // Save to context
    updateAddresses({
      current: currentAddress,
      new: newAddress,
      distance: parseFloat(distance.toFixed(1)),
    });

    // Try to save with timeout - don't wait forever
    const savePromise = saveComparison({
        currentAddress,
        newAddress,
        distance: parseFloat(distance.toFixed(1)),
    });

    const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Save timeout')), 3000)
    );

    try {
        await Promise.race([savePromise, timeoutPromise]);
        console.log('✅ Comparison saved');
    } catch (error: any) {
        console.log('⚠️ Save failed or timed out:', error.message);
        // Continue anyway
    }

    console.log('🚀 Navigating to WorkSchedule...');
    navigation.navigate('WorkSchedule');
    console.log('✅ Navigation called');
  };

  // Haversine formula to calculate distance between two coordinates
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 3959; // Earth's radius in miles
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
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
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Compare Locations</Text>
        <Text style={styles.headerSubtitle}>Step 1 of 4</Text>
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Current Address Section */}
          <View style={[styles.section, styles.firstSection]}>
            <Text style={styles.label}>📍 Where do you live now?</Text>
            <Text style={styles.helperText}>Search for your current address in California</Text>

            <GooglePlacesAutocomplete
              ref={currentRef}
              placeholder="Start typing your address..."
              onPress={(data, details = null) => {
                console.log('Selected current:', data.description);
                if (details) {
                  // Check if address is in California
                  const isInCalifornia = details.address_components?.some(
                    component => 
                      component.types.includes('administrative_area_level_1') && 
                      component.short_name === 'CA'
                  );
                  
                  if (!isInCalifornia) {
                    Alert.alert('California Only', 'Please select an address in California. This app currently only supports California addresses.');
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
                types: 'address',
              }}
              fetchDetails={true}
              enablePoweredByContainer={false}
              styles={{
                container: {
                  flex: 0,
                },
                textInputContainer: {
                  backgroundColor: 'white',
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: '#ddd',
                },
                textInput: {
                  height: 48,
                  fontSize: 16,
                },
                listView: {
                  backgroundColor: 'white',
                  borderRadius: 8,
                  borderWidth: 2,
                  borderColor: '#4A90E2',
                  marginTop: 4,
                  elevation: 10,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 5,
                },
                row: {
                  backgroundColor: 'white',
                  padding: 13,
                },
              }}
            />

            {currentAddress && (
              <View style={styles.selectedAddress}>
                <Text style={styles.selectedAddressText}>✓ {currentAddress.description}</Text>
              </View>
            )}
          </View>

          {/* New Address Section */}
          <View style={[styles.section, styles.secondSection]}>
            <Text style={styles.label}>🎯 Where are you thinking of moving?</Text>
            <Text style={styles.helperText}>Search for the potential new address</Text>

            <GooglePlacesAutocomplete
              ref={newRef}
              placeholder="Start typing the new address..."
              onPress={(data, details = null) => {
                console.log('Selected new:', data.description);
                if (details) {
                  // Check if address is in California
                  const isInCalifornia = details.address_components?.some(
                    component => 
                      component.types.includes('administrative_area_level_1') && 
                      component.short_name === 'CA'
                  );
                  
                  if (!isInCalifornia) {
                    Alert.alert('California Only', 'Please select an address in California. This app currently only supports California addresses.');
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
                types: 'address',
              }}
              fetchDetails={true}
              enablePoweredByContainer={false}
              styles={{
                container: {
                  flex: 0,
                },
                textInputContainer: {
                  backgroundColor: 'white',
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: '#ddd',
                },
                textInput: {
                  height: 48,
                  fontSize: 16,
                },
                listView: {
                  backgroundColor: 'white',
                  borderRadius: 8,
                  borderWidth: 2,
                  borderColor: '#E65100',
                  marginTop: 4,
                  elevation: 10,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 5,
                },
                row: {
                  backgroundColor: 'white',
                  padding: 13,
                },
              }}
            />

            {newAddress && (
              <View style={styles.selectedAddress}>
                <Text style={styles.selectedAddressText}>✓ {newAddress.description}</Text>
              </View>
            )}
          </View>

          {/* Distance Display */}
          {currentAddress && newAddress && (
            <View style={styles.distanceCard}>
              <Text style={styles.distanceText}>
                📏 Distance:{' '}
                {calculateDistance(
                  currentAddress.lat,
                  currentAddress.lng,
                  newAddress.lat,
                  newAddress.lng
                ).toFixed(1)}{' '}
                miles apart
              </Text>
            </View>
          )}

          {/* Map showing both locations */}
          {currentAddress && newAddress && (
            <AddressMap currentAddress={currentAddress} newAddress={newAddress} />
          )}

          {/* Info Card */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>💡 What we'll analyze:</Text>
            <Text style={styles.infoItem}>• Crime rates and safety patterns</Text>
            <Text style={styles.infoItem}>• Commute time to your work</Text>
            <Text style={styles.infoItem}>• Noise levels and construction</Text>
            <Text style={styles.infoItem}>• Nearby amenities matching your lifestyle</Text>
          </View>

          {/* Spacer for bottom button */}
          <View style={{ height: 20 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            (!currentAddress || !newAddress) && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!currentAddress || !newAddress}
        >
          <Text style={styles.continueButtonText}>
            {currentAddress && newAddress
              ? 'Continue to Work Schedule'
              : 'Select Both Addresses'}
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
    marginBottom: 10,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 30,
  },
  firstSection: {
    zIndex: 10,
  },
  secondSection: {
    zIndex: 5,
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
    marginBottom: 12,
  },
  selectedAddress: {
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  selectedAddressText: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '500',
  },
  distanceCard: {
    backgroundColor: '#FFF3E0',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  distanceText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E65100',
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
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
    lineHeight: 24,
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
  continueButtonDisabled: {
    backgroundColor: '#ccc',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
