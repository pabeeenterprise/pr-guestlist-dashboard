import React, { useState } from 'react';
import { View, Alert, StyleSheet } from 'react-native';
import { Input, Button, Text } from '@rneui/themed';
import { useAuth } from '../contexts/AuthContext';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
// Make sure the types file exists and exports RootStackParamList.
// If the file is missing, create it at ../navigation/types.ts with the following content:

// export type RootStackParamList = {
//   Register: undefined;
//   Login: undefined;
//   // add other routes here
// };

import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'pr' | 'collector'>('collector');

  const handleRegister = async () => {
    try {
      await signUp(email, password, fullName, role);
      Alert.alert('Success', 'Account created! Please check your email to confirm.');
      navigation.replace('Login');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text h3 style={styles.title}>Register</Text>
      <Input
        placeholder="Full Name"
        leftIcon={{ name: 'person' }}
        onChangeText={setFullName}
        value={fullName}
      />
      <Input
        placeholder="Email"
        leftIcon={{ name: 'email' }}
        onChangeText={setEmail}
        value={email}
        autoCapitalize="none"
      />
      <Input
        placeholder="Password"
        leftIcon={{ name: 'lock' }}
        onChangeText={setPassword}
        value={password}
        secureTextEntry
      />
      <Button title="Sign Up" onPress={handleRegister} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { textAlign: 'center', marginBottom: 20 },
});
