import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Input, Button, Text } from '@rneui/themed';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../src/navigation/types';
import { useAuth } from '../contexts/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

export const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      Alert.alert(
        'Reset Email Sent',
        'Check your email for password reset instructions.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text h3 style={styles.title}>Reset Password</Text>
      <Text style={styles.subtitle}>
        Enter your email address and we'll send you a link to reset your password.
      </Text>
      
      <Input
        placeholder="Email"
        placeholderTextColor="#aaa"
        leftIcon={{ name: 'email', color: '#555' }}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        containerStyle={styles.inputContainer}
      />

      <Button
        title="Send Reset Email"
        buttonStyle={styles.resetButton}
        onPress={handleResetPassword}
        loading={loading}
        disabled={loading}
      />

      <Button
        title="Back to Sign In"
        type="clear"
        titleStyle={styles.backText}
        onPress={() => navigation.goBack()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#222',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    textAlign: 'center',
    color: '#fff',
    marginBottom: 20,
  },
  subtitle: {
    textAlign: 'center',
    color: '#ccc',
    marginBottom: 40,
    fontSize: 16,
    lineHeight: 22,
  },
  inputContainer: {
    marginVertical: 10,
  },
  resetButton: {
    backgroundColor: '#e63946',
    borderRadius: 30,
    paddingVertical: 15,
    marginTop: 20,
  },
  backText: {
    color: '#fff',
    textDecorationLine: 'underline',
    marginTop: 20,
  },
});
