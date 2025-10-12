import React, { useState } from 'react';
import { View, Alert, StyleSheet } from 'react-native';
import { Input, Button, Text } from '@rneui/themed';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../src/navigation/types';
import { useAuth } from '../contexts/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    try {
      await signUp(email, password, fullName, 'pr');
      Alert.alert('Success', 'Check your email, then Sign In.');
      navigation.replace('Login');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text h3 style={styles.title}>Register</Text>
      <Input placeholder="Full Name" leftIcon={{ name: 'person' }} onChangeText={setFullName} value={fullName} />
      <Input placeholder="Email" leftIcon={{ name: 'email' }} onChangeText={setEmail} value={email} autoCapitalize="none" />
      <Input placeholder="Password" leftIcon={{ name: 'lock' }} onChangeText={setPassword} value={password} secureTextEntry />
      <Button title="Sign Up" onPress={handleRegister} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex:1, justifyContent:'center', padding:20 },
  title: { textAlign:'center', marginBottom:20 }
});
