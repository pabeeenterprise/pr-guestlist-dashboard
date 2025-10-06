import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { DatabaseService } from '../services/databaseService';

export const PRDashboard: React.FC = () => {
  const { user, userProfile } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all events created by this PR
      const eventsData = await DatabaseService.getEventsByPR(user!.id);
      setEvents(eventsData);
      
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const createNewEvent = async () => {
    try {
      const newEvent = await DatabaseService.createEvent({
        name: 'Sample Event',
        description: 'A sample event for testing',
        venue: 'Skylite Club, Nagpur',
        date: new Date().toISOString(),
        capacity: 150,
        pr_id: user!.id,
        pr_name: userProfile?.profile?.full_name || 'Unknown PR'
      });
      
      // Refresh events list
      loadDashboardData();
      Alert.alert('Success', 'Event created successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const renderEventItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={{ padding: 15, backgroundColor: 'white', margin: 10, borderRadius: 8 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{item.basic_info.name}</Text>
      <Text>{item.basic_info.venue}</Text>
      <Text>{new Date(item.basic_info.date).toLocaleDateString()}</Text>
      <Text>Guests: {item.guestlist.length}</Text>
      <Text>Collectors: {item.collector_assignments.length}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
        Welcome, {userProfile?.profile?.full_name || 'PR'}
      </Text>
      
      <TouchableOpacity 
        onPress={createNewEvent}
        style={{ backgroundColor: '#007AFF', padding: 15, borderRadius: 8, marginBottom: 20 }}
      >
        <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
          Create New Event
        </Text>
      </TouchableOpacity>

      <FlatList
        data={events}
        keyExtractor={(item) => item.event_id}
        renderItem={renderEventItem}
        refreshing={loading}
        onRefresh={loadDashboardData}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 50, color: '#666' }}>
            No events created yet
          </Text>
        }
      />
    </View>
  );
};
