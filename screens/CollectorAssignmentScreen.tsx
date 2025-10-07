import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  Share,
} from 'react-native';
import { Card, Button, CheckBox, SearchBar } from '@rneui/themed';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { DatabaseService } from '../services/databaseService';
import { supabase } from '../lib/supabase';

// Navigation types
type RootStackParamList = {
  CollectorAssignment: { eventId: string };
};

type CollectorAssignmentScreenRouteProp = RouteProp<RootStackParamList, 'CollectorAssignment'>;
type CollectorAssignmentScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CollectorAssignment'>;

interface Props {
  route: CollectorAssignmentScreenRouteProp;
  navigation: CollectorAssignmentScreenNavigationProp;
}

interface User {
  user_id: string;
  email: string;
  role: string;
  profile: {
    full_name: string;
    phone?: string;
  };
}

interface Assignment {
  assignment_id: string;
  collector_id: string;
  collector_name: string;
  unique_token: string;
  invitation_link: string;
  is_active: boolean;
}

export const CollectorAssignmentScreen: React.FC<Props> = ({ route, navigation }) => {
  // Get eventId from navigation parameters
  const { eventId } = route.params;
  
  const { user } = useAuth();
  const [collectors, setCollectors] = useState<User[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCollectors();
    fetchExistingAssignments();
  }, [eventId]);

  const fetchCollectors = async () => {
    try {
      // Fetch all users with collector role from NoSQL database
      const { data, error } = await supabase
        .from('users_doc')
        .select('document')
        .eq('document->>role', 'collector');

      if (error) throw error;
      
      // Extract users from documents
      const usersList = data?.map((item: { document: User }) => item.document).filter((doc: User) => 
        doc.profile && doc.email
      ) || [];
      
      setCollectors(usersList);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingAssignments = async () => {
    try {
      // Get current event document
      const eventDoc = await DatabaseService.getEvent(eventId);
      
      if (eventDoc && eventDoc.collector_assignments) {
        const activeAssignments = eventDoc.collector_assignments.filter(
          (assignment: Assignment) => assignment.is_active
        );
        setAssignments(activeAssignments);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const generateUniqueLink = (collectorId: string, token: string) => {
    return `https://yourapp.com/collect/${token}?event=${eventId}&collector=${collectorId}`;
  };

  const assignCollector = async (collectorId: string) => {
    try {
      const collector = collectors.find(c => c.user_id === collectorId);
      if (!collector) return;

      // Use DatabaseService to assign collector
      await DatabaseService.assignCollector(eventId, {
        collector_id: collectorId,
        collector_name: collector.profile.full_name
      });
      
      fetchExistingAssignments();
      Alert.alert('Success', 'Collector assigned successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const removeAssignment = async (assignmentId: string) => {
    try {
      // Get current event
      const currentEvent = await DatabaseService.getEvent(eventId);
      
      // Update the assignment to inactive
      const updatedAssignments = currentEvent.collector_assignments.map(
        (assignment: Assignment) => 
          assignment.assignment_id === assignmentId 
            ? { ...assignment, is_active: false }
            : assignment
      );

      // Update event document
      const { data, error } = await supabase
        .from('events_doc')
        .update({
          document: {
            ...currentEvent,
            collector_assignments: updatedAssignments
          }
        })
        .eq('document->>event_id', eventId);

      if (error) throw error;
      
      fetchExistingAssignments();
      Alert.alert('Success', 'Assignment removed successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const shareInvitationLink = async (assignment: Assignment) => {
    const collector = collectors.find(c => c.user_id === assignment.collector_id);
    const message = `Hi ${collector?.profile.full_name}! You've been assigned to collect guestlist entries. Use this link: ${assignment.invitation_link}`;
    
    try {
      await Share.share({
        message,
        title: 'Guestlist Collection Assignment',
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  const toggleCollectorSelection = (collectorId: string) => {
    const existingAssignment = assignments.find(a => a.collector_id === collectorId);
    
    if (existingAssignment) {
      removeAssignment(existingAssignment.assignment_id);
    } else {
      assignCollector(collectorId);
    }
  };

  const filteredCollectors = collectors.filter(collector =>
    collector.profile.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    collector.email.toLowerCase().includes(search.toLowerCase())
  );

  const renderCollectorItem = ({ item }: { item: User }) => {
    const isAssigned = assignments.some(a => a.collector_id === item.user_id);
    const assignment = assignments.find(a => a.collector_id === item.user_id);

    return (
      <Card containerStyle={styles.collectorCard}>
        <View style={styles.collectorHeader}>
          <View style={styles.collectorInfo}>
            <Text style={styles.collectorName}>
              {item.profile.full_name || 'Unknown'}
            </Text>
            <Text style={styles.collectorEmail}>{item.email}</Text>
            {item.profile.phone && (
              <Text style={styles.collectorPhone}>{item.profile.phone}</Text>
            )}
          </View>
          <CheckBox
            checked={isAssigned}
            onPress={() => toggleCollectorSelection(item.user_id)}
            containerStyle={styles.checkbox}
          />
        </View>
        
        {isAssigned && assignment && (
          <View style={styles.assignmentActions}>
            <Button
              title="Share Link"
              size="sm"
              buttonStyle={styles.shareButton}
              onPress={() => shareInvitationLink(assignment)}
            />
            <Text style={styles.tokenText}>
              Token: {assignment.unique_token.substring(0, 8)}...
            </Text>
          </View>
        )}
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <SearchBar
        placeholder="Search collectors..."
        onChangeText={setSearch}
        value={search}
        containerStyle={styles.searchContainer}
        inputContainerStyle={styles.searchInputContainer}
      />

      <Text style={styles.assignedCount}>
        {assignments.length} collector{assignments.length !== 1 ? 's' : ''} assigned
      </Text>

      <FlatList
        data={filteredCollectors}
        keyExtractor={(item) => item.user_id}
        renderItem={renderCollectorItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    backgroundColor: 'transparent',
    borderBottomColor: 'transparent',
    borderTopColor: 'transparent',
    paddingHorizontal: 15,
  },
  searchInputContainer: {
    backgroundColor: '#e9ecef',
  },
  assignedCount: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    paddingVertical: 10,
    color: '#333',
  },
  listContainer: {
    paddingHorizontal: 15,
  },
  collectorCard: {
    borderRadius: 10,
    marginVertical: 5,
    padding: 15,
  },
  collectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  collectorInfo: {
    flex: 1,
  },
  collectorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  collectorEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  collectorPhone: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  checkbox: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  assignmentActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  shareButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 20,
    height: 35,
  },
  tokenText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
});
