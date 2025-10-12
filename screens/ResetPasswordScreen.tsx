import React, { useState, useEffect } from 'react';
import { View, Alert } from 'react-native';
import { Input, Button, Text } from '@rneui/themed';
import { supabase } from '../src/lib/supabase';
import * as Linking from 'expo-linking';

export const ResetPasswordScreen = () => {
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const handleDeepLink = async () => {
      // Get the initial URL that opened the app
      const url = await Linking.getInitialURL();
      
      if (url) {
        const parsed = Linking.parse(url);
        const accessToken = parsed.queryParams?.access_token;
        const refreshToken = parsed.queryParams?.refresh_token;

        if (accessToken && refreshToken) {
          try {
            // Authenticate user with tokens from the deep link
            const { error } = await supabase.auth.setSession({
              access_token: accessToken as string,
              refresh_token: refreshToken as string,
            });

            if (error) throw error;
            setIsAuthenticated(true);
          } catch (error: any) {
            Alert.alert('Error', `Authentication failed: ${error.message}`);
          }
        } else {
          Alert.alert('Error', 'Invalid reset link');
        }
      }
    };

    handleDeepLink();
  }, []);

  const handleResetPassword = async () => {
    if (!newPassword.trim()) {
      Alert.alert('Error', 'Please enter a new password');
      return;
    }

    if (!isAuthenticated) {
      Alert.alert('Error', 'User not authenticated for password reset');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ 
        password: newPassword 
      });
      
      if (error) throw error;
      Alert.alert('Success', 'Password updated successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
        <Text h4 style={{ textAlign: 'center' }}>
          Authenticating...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
      <Text h3 style={{ textAlign: 'center', marginBottom: 30 }}>
        Reset Password
      </Text>
      
      <Input
        placeholder="New Password"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />

      <Button
        title="Update Password"
        onPress={handleResetPassword}
        loading={loading}
        disabled={loading}
      />
    </View>
  );
};
