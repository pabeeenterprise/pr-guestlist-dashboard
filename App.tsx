import 'react-native-url-polyfill/auto';
import React, { useEffect } from 'react';
import { Platform, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ThemeProvider } from '@rneui/themed';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginScreen } from './screens/LoginScreen';
import { RegisterScreen } from './screens/RegisterScreen';
import { PRDashboard } from './screens/PRDashboard';
import { CollectorAssignmentScreen } from './screens/CollectorAssignmentScreen';
import { GuestlistCollectionScreen } from './screens/GuestlistCollectionScreen';
import { TemplateManagerScreen } from './screens/TemplateManagerScreen';
import { EventsScreen, ProfileScreen, LoadingScreen, Icon } from './screens/Placeholders';
import { RootStackParamList } from './navigation/types';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();

function AuthenticatedTabs() {
  return (
    <Tab.Navigator screenOptions={{ tabBarActiveTintColor: '#007AFF' }}>
      <Tab.Screen name="Dashboard" component={PRDashboard} options={{ headerShown: false, tabBarIcon: ({ color }) => <Icon name="dashboard" color={color} size={20}/> }} />
      <Tab.Screen name="Events" component={EventsScreen} options={{ tabBarIcon: ({ color }) => <Icon name="event" color={color} size={20}/> }} />
      <Tab.Screen name="Templates" component={TemplateManagerScreen} options={{ tabBarIcon: ({ color }) => <Icon name="email" color={color} size={20}/> }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: ({ color }) => <Icon name="person" color={color} size={20}/> }} />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { session, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!session ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: true, title: 'Sign In' }}/>
            <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: true, title: 'Register' }}/>
          </>
        ) : (
          <Stack.Screen name="Main" component={AuthenticatedTabs}/>
        )}
        <Stack.Screen name="CollectorAssignment" component={CollectorAssignmentScreen} options={{ headerShown: true, title: 'Assign Collectors' }}/>
        <Stack.Screen name="GuestlistCollection" component={GuestlistCollectionScreen} options={{ headerShown: true, title: 'Collect Guestlist' }}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  useEffect(() => {
    if (Platform.OS === 'web' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js').catch(console.error);
    }
  }, []);
  const theme = { lightColors: { primary:'#007AFF', secondary:'#34C759'} };
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <AppNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}
