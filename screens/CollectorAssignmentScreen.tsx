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
import { useAuth } from '../contexts/AuthContext';
import { supabase, User, CollectorAssignment } from '../lib/supabase';

interface CollectorAssignmentScreenProps {
  eventId: string;
}

export const CollectorAssignmentScreen: React.FC<CollectorAssignmentScreenProps> = ({
  eventId,
}) => {
  const { user } = useAuth();
  const [collectors, setCollectors] = useState<User[]>([]);
  const [assignments, setAssignments] = useState<CollectorAssignment[]>([]);
  const [selectedCollectors, setSelectedCollectors] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCollectors();
    fetchExistingAssignments();
  }, []);

  const fetchCollectors = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'collector')
        .eq('is_active', true)
        .order('full_name');

      if (error) throw error;
      setCollectors(data || []);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingAssignments = async () => {
    try {
      const { data, error } = await supabase
        .from('collector_assignments')
        .select('*')
        .eq('event_id', eventId)
        .eq('pr_id', user?.id)
        .eq('is_active', true);

      if (error) throw error;
      setAssignments(data || []);
      
      // Set selected collectors based on existing assignments
      const assignedCollectorIds = data?.map(a => a.collector_id) || [];
      setSelectedCollectors(assignedCollectorIds);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const generateUniqueLink = (collectorId: string, token: string) => {
    return `https://yourapp.com/collect/${token}?event=${eventId}&collector=${collectorId}`;
  };

  const assignCollector = async (collectorId: string) => {
    try {
      // Generate unique token
      const token = Math.random().toString(36).substring(2, 15) + 
                   Math.random().toString(36).substring(2, 15);
      
      const invitationLink = generateUniqueLink(collectorId, token);

      const { error } = await supabase
        .from('collector_assignments')
        .insert({
          event_id: eventId,
          pr_id: user?.id,
          collector_id: collectorId,
          unique_token: token,
          invitation_link: invitationLink,
        });

      if (error) throw error;
      
      fetchExistingAssignments();
      Alert.alert('Success', 'Collector assigned successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const removeAssignment = async (assignmentId: string) => {
    try {
      const { error } = await supabase
        .from('collector_assignments')
        .update({ is_active: false })
        .eq('id', assignmentId);

      if (error) throw error;
      
      fetchExistingAssignments();
      Alert.alert('Success', 'Assignment removed successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const shareInvitationLink = async (assignment: CollectorAssignment) => {
    const collector = collectors.find(c => c.id === assignment.collector_id);
    const message = `Hi ${collector?.full_name}! You've been assigned to collect guestlist entries. Use this link: ${assignment.invitation_link}`;
    
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
      // Remove assignment
      removeAssignment(existingAssignment.id);
    } else {
      // Add assignment
      assignCollector(collectorId);
    }
  };

  const filteredCollectors = collectors.filter(collector =>
    collector.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    collector.email.toLowerCase().includes(search.toLowerCase())
  );

  const renderCollectorItem = ({ item }: { item: User }) => {
    const isAssigned = assignments.some(a => a.collector_id === item.id);
    const assignment = assignments.find(a => a.collector_id === item.id);

    return (
      <Card containerStyle={styles.collectorCard}>
        <View style={styles.collectorHeader}>
          <View style={styles.collectorInfo}>
            <Text style={styles.collectorName}>{item.full_name || 'Unknown'}</Text>
            <Text style={styles.collectorEmail}>{item.email}</Text>
            {item.phone && <Text style={styles.collectorPhone}>{item.phone}</Text>}
          </View>
          <CheckBox
            checked={isAssigned}
            onPress={() => toggleCollectorSelection(item.id)}
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
            <Text style={styles.tokenText}>Token: {assignment.unique_token.substring(0, 8)}...</Text>
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
        keyExtractor={(item) => item.id}
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
