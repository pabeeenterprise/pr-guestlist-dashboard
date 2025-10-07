import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Card, Button, FAB } from '@rneui/themed';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Event, GuestlistEntry } from '../lib/supabase';

interface DashboardStats {
  totalEvents: number;
  activeGuests: number;
  confirmedGuests: number;
  pendingRSVPs: number;
}

export const PRDashboard: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalEvents: 0,
    activeGuests: 0,
    confirmedGuests: 0,
    pendingRSVPs: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch PR's events
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .eq('created_by', user?.id)
        .order('event_date', { ascending: false });

      if (eventsError) throw eventsError;
      setEvents(eventsData || []);

      // Calculate stats
      if (eventsData && eventsData.length > 0) {
        const eventIds = eventsData.map(e => e.id);
        
        const { data: guestlistData, error: guestlistError } = await supabase
          .from('guestlist')
          .select('rsvp_status, checked_in')
          .in('event_id', eventIds);

        if (guestlistError) throw guestlistError;

        const totalGuests = guestlistData?.length || 0;
        const confirmed = guestlistData?.filter(g => g.rsvp_status === 'confirmed').length || 0;
        const pending = guestlistData?.filter(g => g.rsvp_status === 'pending').length || 0;

        setStats({
          totalEvents: eventsData.length,
          activeGuests: totalGuests,
          confirmedGuests: confirmed,
          pendingRSVPs: pending,
        });
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const createNewEvent = () => {
    // Navigate to create event screen
    console.log('Navigate to create event');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Welcome back!</Text>
          <Text style={styles.headerSubtitle}>Manage your events and guestlists</Text>
        </View>

        {/* Stats Cards */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsContainer}>
          <Card containerStyle={[styles.statCard, { backgroundColor: '#007AFF' }]}>
            <Text style={[styles.statNumber, { color: 'white' }]}>{stats.totalEvents}</Text>
            <Text style={[styles.statLabel, { color: 'white' }]}>Total Events</Text>
          </Card>
          
          <Card containerStyle={[styles.statCard, { backgroundColor: '#34C759' }]}>
            <Text style={[styles.statNumber, { color: 'white' }]}>{stats.confirmedGuests}</Text>
            <Text style={[styles.statLabel, { color: 'white' }]}>Confirmed</Text>
          </Card>
          
          <Card containerStyle={[styles.statCard, { backgroundColor: '#FF9500' }]}>
            <Text style={[styles.statNumber, { color: 'white' }]}>{stats.pendingRSVPs}</Text>
            <Text style={[styles.statLabel, { color: 'white' }]}>Pending</Text>
          </Card>
          
          <Card containerStyle={[styles.statCard, { backgroundColor: '#8E8E93' }]}>
            <Text style={[styles.statNumber, { color: 'white' }]}>{stats.activeGuests}</Text>
            <Text style={[styles.statLabel, { color: 'white' }]}>Total Guests</Text>
          </Card>
        </ScrollView>

        {/* Recent Events */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Events</Text>
          {events.map((event) => (
            <TouchableOpacity key={event.id} style={styles.eventCard}>
              <View style={styles.eventHeader}>
                <Text style={styles.eventName}>{event.name}</Text>
                <Text style={styles.eventDate}>{formatDate(event.event_date)}</Text>
              </View>
              <Text style={styles.eventVenue}>{event.venue || 'No venue specified'}</Text>
              <View style={styles.eventActions}>
                <Button
                  title="View Guestlist"
                  size="sm"
                  buttonStyle={styles.actionButton}
                  titleStyle={styles.actionButtonText}
                />
                <Button
                  title="Assign Collectors"
                  size="sm"
                  buttonStyle={[styles.actionButton, styles.secondaryButton]}
                  titleStyle={[styles.actionButtonText, styles.secondaryButtonText]}
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        placement="right"
        icon={{ name: 'add', color: 'white' }}
        color="#007AFF"
        onPress={createNewEvent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  statsContainer: {
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  statCard: {
    width: 120,
    height: 100,
    marginHorizontal: 5,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 5,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  eventCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  eventName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    color: '#333',
  },
  eventDate: {
    fontSize: 14,
    color: '#666',
  },
  eventVenue: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  eventActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    height: 35,
  },
  actionButtonText: {
    fontSize: 12,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  secondaryButtonText: {
    color: '#007AFF',
  },
});
