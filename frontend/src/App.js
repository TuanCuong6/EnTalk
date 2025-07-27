//frontend/src/App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import MainNavigator from './navigation/MainNavigator';
import { AuthProvider } from './context/AuthContext';
import { navigationRef } from './utils/RootNavigation';
import { NotificationProvider } from './context/NotificationContext';
export default function App() {
  return (
    <NavigationContainer ref={navigationRef}>
      <AuthProvider>
        <NotificationProvider>
          <MainNavigator />
        </NotificationProvider>
      </AuthProvider>
    </NavigationContainer>
  );
}
