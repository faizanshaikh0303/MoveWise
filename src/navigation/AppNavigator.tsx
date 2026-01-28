import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import AddressInputScreen from '../screens/AddressInputScreen';
import WorkScheduleScreen from '../screens/WorkScheduleScreen';
import SleepScheduleScreen from '../screens/SleepScheduleScreen';
import HobbiesScreen from '../screens/HobbiesScreen';
import AnalysisLoadingScreen from '../screens/AnalysisLoadingScreen';
import ResultsScreen from '../screens/ResultsScreen';
import TestFirebaseScreen from '../screens/TestFirebaseScreen';
import MyComparisonsScreen from '../screens/MyComparisonsScreen';

export type RootStackParamList = {
  Home: undefined;
  AddressInput: undefined;
  WorkSchedule: undefined;
  SleepSchedule: undefined;
  Hobbies: undefined;
  AnalysisLoading: undefined;
  Results: undefined;
  TestFirebase: undefined;
  MyComparisons: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="AddressInput" component={AddressInputScreen} />
        <Stack.Screen name="WorkSchedule" component={WorkScheduleScreen} />
        <Stack.Screen name="SleepSchedule" component={SleepScheduleScreen} />
        <Stack.Screen name="Hobbies" component={HobbiesScreen} />
        <Stack.Screen name="AnalysisLoading" component={AnalysisLoadingScreen} />
        <Stack.Screen name="Results" component={ResultsScreen} />
        <Stack.Screen name="TestFirebase" component={TestFirebaseScreen} />
        <Stack.Screen name="MyComparisons" component={MyComparisonsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
