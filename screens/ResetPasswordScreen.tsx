import React, { useState, useEffect } from 'react';
import { View, Alert } from 'react-native';
import { Input, Button, Text } from '@rneui/themed';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const ResetPasswordScreen = () => {
  const { user } = useAuth(); // Get the current user session
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Listen for PASSWORD_RECOVERY event
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        // User is now authenticated and can reset password
        console.log('Password recovery mode activated');
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const handleResetPassword = async () => {
    if (!newPassword.trim()) {
      Alert.alert('Error', 'Please enter a new password');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'No authenticated user found');
      return;
    }

    setLoading(true);
    try {
      // Simply update the password - no need for verifyOtp
      const { error } = await supabase.auth.updateUser({ 
        password: newPassword 
      });
      
      if (error) throw error;

      Alert.alert('Success', 'Password updated successfully!');
      // Navigate to login or main screen
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

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
