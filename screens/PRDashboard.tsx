import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Button } from '@rneui/themed';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../src/lib/supabase';

export const PRDashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    if (user) loadEvents();
  }, [user]);

  const loadEvents = async () => {
    const { data, error } = await supabase
      .from('events_doc')
      .select('document')
      .eq('document->>pr_id', user!.id);
    if (!error) setEvents(data?.map((d: any) => d.document) || []);
  };

  const handleLogout = async () => {
  try {
    console.log('Attempting logout...');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', error.message);
    } else {
      console.log('Logout successful');
    }
  } catch (err: any) {
    console.error('Logout catch error:', err);
    Alert.alert('Error', err.message);
  }
};


  return (
    <View style={styles.container}>
      {/* Header with user info and logout */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome back!</Text>
          <Text style={styles.emailText}>{user?.email}</Text>
        </View>
        <Button
  title="Logout"
  type="outline"
  onPress={handleLogout}
/>
        
      </View>

      <Text style={styles.sectionHeader}>Your Events</Text>
      
      <TouchableOpacity 
        onPress={() => {/* navigate to create event */}} 
        style={styles.createButton}
      >
        <Text style={styles.createButtonText}>+ New Event</Text>
      </TouchableOpacity>
      
      <FlatList
        data={events}
        keyExtractor={item => item.event_id}
        renderItem={({ item }) => (
          <View style={styles.eventCard}>
            <Text style={styles.eventTitle}>{item.basic_info?.name || 'Untitled Event'}</Text>
            <Text style={styles.eventDate}>
              {item.basic_info?.date ? new Date(item.basic_info.date).toLocaleDateString() : 'No date'}
            </Text>
          </View>
        )}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No events yet</Text>
            <Text style={styles.emptySubtext}>Create your first event to get started</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 10,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  emailText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  logoutButton: {
    borderColor: '#FF3B30',
    borderWidth: 1,
    paddingHorizontal: 20,
  },
  logoutButtonText: {
    color: '#FF3B30',
    fontSize: 14,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  createButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  createButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  eventCard: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  eventDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
});
