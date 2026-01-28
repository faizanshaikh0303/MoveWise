import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { UserProfileProvider } from './src/context/UserProfileContext';

export default function App() {
  return (
    <UserProfileProvider>
      <AppNavigator />
    </UserProfileProvider>
  );
}