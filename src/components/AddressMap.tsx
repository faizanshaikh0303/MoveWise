import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

interface AddressDetails {
  description: string;
  lat: number;
  lng: number;
}

interface Props {
  currentAddress: AddressDetails;
  newAddress: AddressDetails;
}

export default function AddressMap({ currentAddress, newAddress }: Props) {
  // Calculate center point between two addresses
  const centerLat = (currentAddress.lat + newAddress.lat) / 2;
  const centerLng = (currentAddress.lng + newAddress.lng) / 2;

  // Calculate appropriate zoom level based on distance
  const latDelta = Math.abs(currentAddress.lat - newAddress.lat) * 2.5;
  const lngDelta = Math.abs(currentAddress.lng - newAddress.lng) * 2.5;

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: centerLat,
          longitude: centerLng,
          latitudeDelta: Math.max(latDelta, 0.1),
          longitudeDelta: Math.max(lngDelta, 0.1),
        }}
      >
        {/* Current Address Marker - Blue Pin */}
        <Marker
          coordinate={{
            latitude: currentAddress.lat,
            longitude: currentAddress.lng,
          }}
          title="Current Location"
          description={currentAddress.description}
          pinColor="blue"
        />

        {/* New Address Marker - Red Pin */}
        <Marker
          coordinate={{
            latitude: newAddress.lat,
            longitude: newAddress.lng,
          }}
          title="New Location"
          description={newAddress.description}
          pinColor="red"
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 250,
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  map: {
    width: '100%',
    height: '100%',
  },
});