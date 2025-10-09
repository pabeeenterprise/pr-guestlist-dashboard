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
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../contexts/AuthContext';
import { DatabaseService } from '../services/databaseService';

type Props = NativeStackScreenProps<RootStackParamList, 'CollectorAssignment'>;

interface User {
  user_id: string;
  email: string;
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

export const CollectorAssignmentScreen: React.FC<Props> = ({ route }) => {
  const { eventId } = route.params;
  const { user } = useAuth();
  const [collectors, setCollectors] = useState<User[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCollectors();
    fetchAssignments();
  }, [eventId]);

  const fetchCollectors = async () => {
    try {
      const { data, error } = await DatabaseService.fetchCollectors();
      if (error) throw error;
      setCollectors(data);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    try {
      const event = await DatabaseService.getEvent(eventId);
      const active = event.collector_assignments?.filter(
        (a: Assignment) => a.is_active
      ) || [];
      setAssignments(active);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const toggleCollector = (collectorId: string) => {
    const exists = assignments.find(a => a.collector_id === collectorId);
    if (exists) {
      DatabaseService.removeCollector(eventId, exists.assignment_id)
        .then(fetchAssignments)
        .catch((err: any) => Alert.alert('Error', err.message));
    } else {
      const collector = collectors.find(c => c.user_id === collectorId)!;
      DatabaseService.assignCollector(eventId, {
        collector_id: collectorId,
        collector_name: collector.profile.full_name,
      })
        .then(fetchAssignments)
        .catch((err: any) => Alert.alert('Error', err.message));
    }
  };

  const shareLink = async (assignment: Assignment) => {
    const message = `Hi ${assignment.collector_name}, use this link to collect guest entries:\n${assignment.invitation_link}`;
    try {
      await Share.share({ message, title: 'Guestlist Assignment' });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  const filtered = collectors.filter(c =>
    c.profile.full_name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }: { item: User }) => {
    const assigned = assignments.some(a => a.collector_id === item.user_id);
    const assignment = assignments.find(a => a.collector_id === item.user_id);

    return (
      <Card containerStyle={styles.card}>
        <View style={styles.header}>
          <View style={styles.info}>
            <Text style={styles.name}>{item.profile.full_name}</Text>
            <Text style={styles.email}>{item.email}</Text>
            {item.profile.phone && <Text style={styles.email}>{item.profile.phone}</Text>}
          </View>
          <CheckBox
            checked={assigned}
            onPress={() => toggleCollector(item.user_id)}
            containerStyle={styles.checkbox}
          />
        </View>
        {assigned && assignment && (
          <View style={styles.actions}>
            <Button
              title="Share"
              type="outline"
              onPress={() => shareLink(assignment)}
            />
            <Text style={styles.token}>
              {assignment.unique_token.substring(0, 8)}...
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
        value={search}
        onChangeText={setSearch}
        containerStyle={styles.searchContainer}
        inputContainerStyle={styles.inputContainer}
      />
      <Text style={styles.count}>
        {assignments.length} collector{assignments.length !== 1 ? 's' : ''} assigned
      </Text>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.user_id}
        renderItem={renderItem}
        refreshing={loading}
        onRefresh={fetchCollectors}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f5f5f5' 
  },
  searchContainer: { 
    backgroundColor: 'transparent',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent'
  },
  inputContainer: { 
    backgroundColor: '#e0e0e0' 
  },
  count: { 
    padding: 15, 
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333'
  },
  listContent: {
    paddingHorizontal: 15
  },
  card: { 
    borderRadius: 8,
    marginVertical: 5,
    padding: 15
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  info: { 
    flex: 1 
  },
  name: { 
    fontSize: 16, 
    fontWeight: 'bold',
    color: '#333'
  },
  email: { 
    fontSize: 14, 
    color: '#666',
    marginTop: 2
  },
  checkbox: { 
    backgroundColor: 'transparent', 
    borderWidth: 0 
  },
  actions: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0'
  },
  token: { 
    fontFamily: 'monospace', 
    color: '#888',
    fontSize: 12
  },
});
