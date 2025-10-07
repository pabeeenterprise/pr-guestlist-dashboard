import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import { Card, Button, Input, ButtonGroup } from '@rneui/themed';
import { useForm, Controller } from 'react-hook-form';
import { supabase, GuestlistEntry, Event } from '../lib/supabase';

interface GuestlistCollectionScreenProps {
  collectorToken: string;
}

interface GuestFormData {
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  guest_type: 'regular' | 'vip' | 'staff';
  plus_ones: string;
  special_notes: string;
}

export const GuestlistCollectionScreen: React.FC<GuestlistCollectionScreenProps> = ({
  collectorToken,
}) => {
  const [guests, setGuests] = useState<GuestlistEntry[]>([]);
  const [event, setEvent] = useState<Event | null>(null);
  const [assignment, setAssignment] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedGuestTypeIndex, setSelectedGuestTypeIndex] = useState(0);

  const guestTypes = ['Regular', 'VIP', 'Staff'];
  const guestTypeValues: Array<'regular' | 'vip' | 'staff'> = ['regular', 'vip', 'staff'];

  const { control, handleSubmit, reset, formState: { errors } } = useForm<GuestFormData>({
    defaultValues: {
      guest_name: '',
      guest_email: '',
      guest_phone: '',
      guest_type: 'regular',
      plus_ones: '0',
      special_notes: '',
    },
  });

  useEffect(() => {
    fetchAssignmentAndEvent();
  }, []);

  const fetchAssignmentAndEvent = async () => {
    try {
      // Fetch assignment details
      const { data: assignmentData, error: assignmentError } = await supabase
        .from('collector_assignments')
        .select(`
          *,
          events:event_id (*)
        `)
        .eq('unique_token', collectorToken)
        .eq('is_active', true)
        .single();

      if (assignmentError) throw assignmentError;
      
      setAssignment(assignmentData);
      setEvent(assignmentData.events);
      
      // Fetch existing guests
      fetchGuests(assignmentData.id);
    } catch (error: any) {
      Alert.alert('Error', 'Invalid or expired collector link');
    } finally {
      setLoading(false);
    }
  };

  const fetchGuests = async (assignmentId: string) => {
    try {
      const { data, error } = await supabase
        .from('guestlist')
        .select('*')
        .eq('collector_assignment_id', assignmentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGuests(data || []);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const addGuest = async (formData: GuestFormData) => {
    try {
      const { error } = await supabase
        .from('guestlist')
        .insert({
          event_id: event?.id,
          collector_assignment_id: assignment.id,
          guest_name: formData.guest_name,
          guest_email: formData.guest_email || null,
          guest_phone: formData.guest_phone || null,
          guest_type: guestTypeValues[selectedGuestTypeIndex],
          plus_ones: parseInt(formData.plus_ones) || 0,
          special_notes: formData.special_notes || null,
        });

      if (error) throw error;
      
      setModalVisible(false);
      reset();
      setSelectedGuestTypeIndex(0);
      fetchGuests(assignment.id);
      Alert.alert('Success', 'Guest added successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const updateGuestStatus = async (guestId: string, newStatus: 'confirmed' | 'declined') => {
    try {
      const { error } = await supabase
        .from('guestlist')
        .update({ rsvp_status: newStatus })
        .eq('id', guestId);

      if (error) throw error;
      
      fetchGuests(assignment.id);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const renderGuestItem = ({ item }: { item: GuestlistEntry }) => (
    <Card containerStyle={styles.guestCard}>
      <View style={styles.guestHeader}>
        <View style={styles.guestInfo}>
          <Text style={styles.guestName}>{item.guest_name}</Text>
          {item.guest_email && <Text style={styles.guestDetail}>{item.guest_email}</Text>}
          {item.guest_phone && <Text style={styles.guestDetail}>{item.guest_phone}</Text>}
          <View style={styles.guestMeta}>
            <Text style={[styles.guestType, getGuestTypeStyle(item.guest_type)]}>
              {item.guest_type.toUpperCase()}
            </Text>
            {item.plus_ones > 0 && (
              <Text style={styles.plusOnes}>+{item.plus_ones}</Text>
            )}
          </View>
        </View>
        
        <View style={styles.guestActions}>
          <View style={[styles.statusBadge, getStatusBadgeStyle(item.rsvp_status)]}>
            <Text style={[styles.statusText, getStatusTextStyle(item.rsvp_status)]}>
              {item.rsvp_status.toUpperCase()}
            </Text>
          </View>
          
          {item.rsvp_status === 'pending' && (
            <View style={styles.actionButtons}>
              <Button
                title="✓"
                size="sm"
                buttonStyle={[styles.statusButton, styles.confirmButton]}
                onPress={() => updateGuestStatus(item.id, 'confirmed')}
              />
              <Button
                title="✗"
                size="sm"
                buttonStyle={[styles.statusButton, styles.declineButton]}
                onPress={() => updateGuestStatus(item.id, 'declined')}
              />
            </View>
          )}
        </View>
      </View>
      
      {item.special_notes && (
        <Text style={styles.specialNotes}>Note: {item.special_notes}</Text>
      )}
    </Card>
  );

  const getGuestTypeStyle = (type: string) => {
    switch (type) {
      case 'vip': return { backgroundColor: '#FFD700', color: '#000' };
      case 'staff': return { backgroundColor: '#007AFF', color: '#fff' };
      default: return { backgroundColor: '#e9ecef', color: '#333' };
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'confirmed': return { backgroundColor: '#34C759' };
      case 'declined': return { backgroundColor: '#FF3B30' };
      default: return { backgroundColor: '#FF9500' };
    }
  };

  const getStatusTextStyle = (status: string) => {
    return { color: 'white', fontSize: 12, fontWeight: 'bold' as 'bold' };
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.eventTitle}>{event?.name}</Text>
        <Text style={styles.eventDate}>
          {new Date(event?.event_date || '').toLocaleDateString()}
        </Text>
        <Text style={styles.guestCount}>
          {guests.length} guest{guests.length !== 1 ? 's' : ''} added
        </Text>
      </View>

      {/* Add Guest Button */}
      <Button
        title="Add New Guest"
        onPress={() => setModalVisible(true)}
        buttonStyle={styles.addButton}
        containerStyle={styles.addButtonContainer}
      />

      {/* Guest List */}
      <FlatList
        data={guests}
        keyExtractor={(item) => item.id}
        renderItem={renderGuestItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No guests added yet</Text>
        }
      />

      {/* Add Guest Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Guest</Text>
            <Button
              title="Cancel"
              type="clear"
              onPress={() => setModalVisible(false)}
            />
          </View>
          
          <View style={styles.form}>
            <Controller
              control={control}
              name="guest_name"
              rules={{ required: 'Name is required' }}
              render={({ field: { onChange, value } }) => (
                <Input
                  placeholder="Guest Name *"
                  value={value}
                  onChangeText={onChange}
                  errorMessage={errors.guest_name?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="guest_email"
              render={({ field: { onChange, value } }) => (
                <Input
                  placeholder="Email (optional)"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="email-address"
                />
              )}
            />

            <Controller
              control={control}
              name="guest_phone"
              render={({ field: { onChange, value } }) => (
                <Input
                  placeholder="Phone (optional)"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="phone-pad"
                />
              )}
            />

            <Text style={styles.fieldLabel}>Guest Type</Text>
            <ButtonGroup
              buttons={guestTypes}
              selectedIndex={selectedGuestTypeIndex}
              onPress={setSelectedGuestTypeIndex}
              containerStyle={styles.buttonGroup}
            />

            <Controller
              control={control}
              name="plus_ones"
              render={({ field: { onChange, value } }) => (
                <Input
                  placeholder="Plus Ones (0-5)"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="numeric"
                />
              )}
            />

            <Controller
              control={control}
              name="special_notes"
              render={({ field: { onChange, value } }) => (
                <Input
                  placeholder="Special Notes (optional)"
                  value={value}
                  onChangeText={onChange}
                  multiline
                />
              )}
            />

            <Button
              title="Add Guest"
              onPress={handleSubmit(addGuest)}
              buttonStyle={styles.submitButton}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Continue with styles...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  eventTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  eventDate: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  guestCount: {
    fontSize: 14,
    color: '#007AFF',
    marginTop: 5,
    fontWeight: 'bold',
  },
  addButtonContainer: {
    padding: 20,
  },
  addButton: {
    backgroundColor: '#007AFF',
    height: 50,
  },
  listContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  guestCard: {
    borderRadius: 10,
    marginVertical: 5,
    padding: 15,
  },
  guestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  guestInfo: {
    flex: 1,
  },
  guestName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  guestDetail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  guestMeta: {
    flexDirection: 'row',
    marginTop: 8,
  },
  guestType: {
    fontSize: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  plusOnes: {
    fontSize: 12,
    color: '#007AFF',
    marginLeft: 10,
    fontWeight: 'bold',
  },
  guestActions: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  statusButton: {
    width: 30,
    height: 30,
    marginHorizontal: 2,
  },
  confirmButton: {
    backgroundColor: '#34C759',
  },
  declineButton: {
    backgroundColor: '#FF3B30',
  },
  specialNotes: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 50,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  form: {
    padding: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  buttonGroup: {
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    height: 50,
    marginTop: 20,
  },
});
