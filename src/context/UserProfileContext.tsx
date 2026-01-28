import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface UserProfileData {
  addresses?: {
    current: { description: string; lat: number; lng: number };
    new: { description: string; lat: number; lng: number };
    distance: number;
  };
  work?: {
    location?: string;
    workDays: string[];
    workHours: { start: string; end: string };
    commuteMethod: string;
  };
  sleep?: {
    bedtime: string;
    wakeTime: string;
    noiseSensitivity: number;
    weekendDifferent: boolean;
    weekendSleep?: { bedtime: string; wakeTime: string };
  };
  lifestyle?: {
    hobbies: string[];
    activityTimes: string[];
  };
}

interface UserProfileContextType {
  profileData: UserProfileData;
  updateAddresses: (addresses: UserProfileData['addresses']) => void;
  updateWork: (work: UserProfileData['work']) => void;
  updateSleep: (sleep: UserProfileData['sleep']) => void;
  updateLifestyle: (lifestyle: UserProfileData['lifestyle']) => void;
  clearProfile: () => void;
  isComplete: () => boolean;
}

// Create context with undefined default (will be provided by Provider)
const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

// Provider component
export function UserProfileProvider({ children }: { children: ReactNode }) {
  const [profileData, setProfileData] = useState<UserProfileData>({});

  const updateAddresses = (addresses: UserProfileData['addresses']) => {
    console.log('💾 Saving addresses to context:', addresses);
    setProfileData(prev => ({ ...prev, addresses }));
  };

  const updateWork = (work: UserProfileData['work']) => {
    console.log('💾 Saving work to context:', work);
    setProfileData(prev => ({ ...prev, work }));
  };

  const updateSleep = (sleep: UserProfileData['sleep']) => {
    console.log('💾 Saving sleep to context:', sleep);
    setProfileData(prev => ({ ...prev, sleep }));
  };

  const updateLifestyle = (lifestyle: UserProfileData['lifestyle']) => {
    console.log('💾 Saving lifestyle to context:', lifestyle);
    setProfileData(prev => ({ ...prev, lifestyle }));
  };

  const clearProfile = () => {
    console.log('🗑️ Clearing profile data');
    setProfileData({});
  };

  const isComplete = () => {
    return !!(
      profileData.addresses &&
      profileData.work &&
      profileData.sleep &&
      profileData.lifestyle
    );
  };

  const value = {
    profileData,
    updateAddresses,
    updateWork,
    updateSleep,
    updateLifestyle,
    clearProfile,
    isComplete,
  };

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
}

// Custom hook with better error message
export function useUserProfile() {
  const context = useContext(UserProfileContext);
  
  if (context === undefined) {
    throw new Error(
      'useUserProfile must be used within a UserProfileProvider. ' +
      'Make sure App.tsx wraps <AppNavigator /> with <UserProfileProvider>.'
    );
  }
  
  return context;
}
