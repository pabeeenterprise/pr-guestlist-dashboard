import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { DatabaseService } from '../services/databaseService';

type Props = NativeStackScreenProps<RootStackParamList, 'GuestlistCollection'>;

interface GuestEntry {
  guest_id: string;
  personal_info: { name: string; email?: string; phone?: string };
  booking_details: { rsvp_status: string; plus_ones: number };
}

export const GuestlistCollectionScreen: React.FC<Props> = ({
  route,
}) => {
  const { collectorToken } = route.params;
  const [guestName, setGuestName] = useState('');
  const [guestList, setGuestList] = useState<GuestEntry[]>([]);

  useEffect(() => {
    loadGuestList();
  }, []);

  const loadGuestList = async () => {
    try {
      const data = await DatabaseService.fetchGuestlistByToken(collectorToken);
      setGuestList(data);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const addGuest = async () => {
    if (!guestName.trim()) return Alert.alert('Enter a name');
    try {
      await DatabaseService.addGuest(collectorToken, { name: guestName });
      setGuestName('');
      loadGuestList();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Add Guest</Text>
      <TextInput
        style={styles.input}
        placeholder="Guest Name"
        value={guestName}
        onChangeText={setGuestName}
      />
      <TouchableOpacity style={styles.button} onPress={addGuest}>
        <Text style={styles.buttonText}>Add</Text>
      </TouchableOpacity>
      <View style={styles.list}>
        {guestList.map(g => (
          <Text key={g.guest_id} style={styles.guestItem}>
            • {g.personal_info.name} ({g.booking_details.rsvp_status})
          </Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 5 },
  button: { backgroundColor: '#007AFF', padding: 12, borderRadius: 5, marginBottom: 20 },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  list: { borderTopWidth: 1, borderColor: '#eee', paddingTop: 10 },
  guestItem: { fontSize: 16, marginBottom: 5 },
});
