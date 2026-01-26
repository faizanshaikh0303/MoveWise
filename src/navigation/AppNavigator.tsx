import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import AddressInputScreen from '../screens/AddressInputScreen';
import TestFirebaseScreen from '../screens/TestFirebaseScreen';
import MyComparisonsScreen from '../screens/MyComparisonsScreen';
import WorkScheduleScreen from '../screens/WorkScheduleScreen';

export type RootStackParamList = {
  Home: undefined;
  AddressInput: undefined;
  TestFirebase: undefined;
  MyComparisons: undefined;
  WorkSchedule: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false, // We'll use custom headers
        }}
      >
        
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="AddressInput" component={AddressInputScreen} />
        <Stack.Screen name="TestFirebase" component={TestFirebaseScreen} />
        <Stack.Screen name="MyComparisons" component={MyComparisonsScreen} />
        <Stack.Screen name="WorkSchedule" component={WorkScheduleScreen} />
        </Stack.Navigator>
      
    </NavigationContainer>
  );
}