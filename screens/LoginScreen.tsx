// screens/LoginScreen.tsx

import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Input, Button, Text } from '@rneui/themed';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../src/navigation/types';
import { useAuth } from '../contexts/AuthContext';
import { Alert } from 'react-native';



type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { signIn } = useAuth();


  const handleLogin = async () => {
    console.log('🔹 handleLogin called with', email, password);
  try {
    await signIn(email, password);
    console.log('✅ signIn succeeded');
  } catch (error: any) {
    console.log('❌ signIn error', error);
    Alert.alert('Error', error.message);
  }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <Text h3 style={styles.title}>PR Guestlist Dashboard</Text>

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

      <Input
        placeholder="Password"
        placeholderTextColor="#aaa"
        leftIcon={{ name: 'lock', color: '#555' }}
        secureTextEntry={!showPassword}
        rightIcon={{
          type: 'feather',
          name: showPassword ? 'eye-off' : 'eye',
          color: '#555',
          onPress: () => setShowPassword(!showPassword),
        }}
        value={password}
        onChangeText={setPassword}
        containerStyle={styles.inputContainer}
      />

      <Button
        title="Sign In"
        buttonStyle={styles.signInButton}
        onPress={handleLogin}
      />

        <Button
  title="Forgot Password?"
  type="clear"
  titleStyle={styles.forgotText}
  onPress={() => navigation.navigate('ForgotPassword')}
/>

      <Button
        title="Register"
        type="clear"
        titleStyle={styles.registerText}
        onPress={() => navigation.navigate('Register')}
      />
    </KeyboardAvoidingView>
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
    marginBottom: 40,
  },
  inputContainer: {
    marginVertical: 10,
  },
  signInButton: {
    backgroundColor: '#e63946',
    borderRadius: 30,
    paddingVertical: 15,
    marginTop: 20,
  },
  registerText: {
    color: '#fff',
    textDecorationLine: 'underline',
    marginTop: 15,
    textAlign: 'center',
  },
  forgotText: {
  color: '#ccc',
  fontSize: 14,
  marginTop: 10,
},

});
