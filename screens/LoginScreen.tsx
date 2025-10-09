import React, { useState } from 'react';
import { View, Alert, StyleSheet } from 'react-native';
import { Input, Button, Text } from '@rneui/themed';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../contexts/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      await signIn(email, password);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text h3 style={styles.title}>PR Guestlist Dashboard</Text>
      <Input placeholder="Email" leftIcon={{ name: 'email' }} onChangeText={setEmail} value={email} autoCapitalize="none" />
      <Input placeholder="Password" leftIcon={{ name: 'lock' }} onChangeText={setPassword} value={password} secureTextEntry />
      <Button title="Sign In" onPress={handleLogin} />
      <Button type="clear" title="Register" onPress={() => navigation.navigate('Register')} titleStyle={{ color: '#007AFF' }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex:1, justifyContent:'center', padding:20 },
  title: { textAlign:'center', marginBottom:20 }
});
