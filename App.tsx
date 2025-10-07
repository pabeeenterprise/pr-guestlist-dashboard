// App.tsx

import 'react-native-url-polyfill/auto';
import React, { useEffect } from 'react';
import { Platform, StatusBar, View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import {
  createBottomTabNavigator
} from '@react-navigation/bottom-tabs';
import {
  createNativeStackNavigator
} from '@react-navigation/native-stack';
import { ThemeProvider } from '@rneui/themed';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginScreen } from './screens/LoginScreen';
import { RegisterScreen } from './screens/RegisterScreen';
import { PRDashboard } from './screens/PRDashboard';
import { CollectorAssignmentScreen } from './screens/CollectorAssignmentScreen';
import { GuestlistCollectionScreen } from './screens/GuestlistCollectionScreen';
import { TemplateManagerScreen } from './screens/TemplateManagerScreen';
// Update the import path to the correct module that exports these components
import { EventsScreen } from './screens/EventsScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { LoadingScreen } from './screens/LoadingScreen';
import { Icon } from './components/Icon'; // Adjust path if needed

import { RootStackParamList } from './navigation/types';  // ensure this exists

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();

const theme = {
  lightColors: {
    primary: '#007AFF',
    secondary: '#34C759',
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    text: '#000000',
  },
};

function AuthenticatedTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: Platform.select({
          web: { height: 60, paddingBottom: 8 },
          default: {}
        }),
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={PRDashboard}
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => <Icon name="dashboard" color={color} size={24} />
        }}
      />
      <Tab.Screen
        name="Events"
        component={EventsScreen}
        options={{
          tabBarIcon: ({ color }) => <Icon name="event" color={color} size={24} />
        }}
      />
      <Tab.Screen
        name="Templates"
        component={TemplateManagerScreen}
        options={{
          tabBarIcon: ({ color }) => <Icon name="email" color={color} size={24} />
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }) => <Icon name="person" color={color} size={24} />
        }}
      />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { session, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>

        {session ? (
          // Authenticated screens
          <Stack.Screen
            name="Main"
            component={AuthenticatedTabs}
          />
        ) : (
          // Unauthenticated screens
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: true, title: 'Sign In' }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ headerShown: true, title: 'Register' }}
            />
          </>
        )}

        {/* Nested within the same Navigator so route typing works */}
        <Stack.Screen
          name="CollectorAssignment"
          component={CollectorAssignmentScreen}
          options={{ headerShown: true, title: 'Assign Collectors' }}
        />
        <Stack.Screen
          name="GuestlistCollection"
          component={GuestlistCollectionScreen}
          options={{ headerShown: true, title: 'Collect Guestlist' }}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  useEffect(() => {
    if (Platform.OS === 'web' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then(() => console.log('SW registered'))
        .catch(console.error);
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <AppNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}
