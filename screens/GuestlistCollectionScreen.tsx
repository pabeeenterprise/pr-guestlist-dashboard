import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { DatabaseService } from '../services/databaseService';

interface Props {
  eventId: string;
  collectorId: string;
  assignmentId: string;
}

export const GuestlistCollectionScreen: React.FC<Props> = ({ 
  eventId, 
  collectorId, 
  assignmentId 
}) => {
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const addGuest = async () => {
    if (!guestName.trim()) {
      Alert.alert('Error', 'Please enter guest name');
      return;
    }

    try {
      setLoading(true);
      
      await DatabaseService.addGuestToEvent(eventId, {
        name: guestName,
        email: guestEmail,
        phone: guestPhone,
        guest_type: 'regular',
        plus_ones: 0,
        collector_id: collectorId,
        assignment_id: assignmentId
      });

      // Clear form
      setGuestName('');
      setGuestEmail('');
      setGuestPhone('');
      
      Alert.alert('Success', 'Guest added successfully!');
      
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 20 }}>
        Add New Guest
      </Text>

      <TextInput
        placeholder="Guest Name *"
        value={guestName}
        onChangeText={setGuestName}
        style={{ borderWidth: 1, borderColor: '#ddd', padding: 10, marginBottom: 15, borderRadius: 5 }}
      />

      <TextInput
        placeholder="Email (optional)"
        value={guestEmail}
        onChangeText={setGuestEmail}
        keyboardType="email-address"
        style={{ borderWidth: 1, borderColor: '#ddd', padding: 10, marginBottom: 15, borderRadius: 5 }}
      />

      <TextInput
        placeholder="Phone (optional)"
        value={guestPhone}
        onChangeText={setGuestPhone}
        keyboardType="phone-pad"
        style={{ borderWidth: 1, borderColor: '#ddd', padding: 10, marginBottom: 20, borderRadius: 5 }}
      />

      <TouchableOpacity
        onPress={addGuest}
        disabled={loading}
        style={{ 
          backgroundColor: loading ? '#ccc' : '#007AFF', 
          padding: 15, 
          borderRadius: 8 
        }}
      >
        <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
          {loading ? 'Adding...' : 'Add Guest'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
