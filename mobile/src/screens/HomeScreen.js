import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as Device from 'expo-device';
import api from '../services/api';

export default function HomeScreen({ navigation }) {
  const [sessionName, setSessionName] = useState('');
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deviceId] = useState(Device.modelName || 'unknown');

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const response = await api.listSessions();
      if (response.success) {
        setSessions(response.sessions);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const createSession = async () => {
    if (!sessionName.trim()) {
      Alert.alert('Error', 'Please enter a session name');
      return;
    }

    try {
      setLoading(true);
      const response = await api.createSession(sessionName, deviceId);
      if (response.success) {
        navigation.navigate('Session', {
          sessionId: response.session.id,
          deviceId,
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  const joinSession = (sessionId) => {
    navigation.navigate('Session', { sessionId, deviceId });
  };

  const renderSessionItem = ({ item }) => (
    <TouchableOpacity
      style={styles.sessionItem}
      onPress={() => joinSession(item.id)}
    >
      <View>
        <Text style={styles.sessionName}>{item.name}</Text>
        <Text style={styles.sessionInfo}>
          Devices: {item.devices.length} | Status: {item.status}
        </Text>
        <Text style={styles.sessionDate}>
          Created: {new Date(item.createdAt).toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Unisynth</Text>
      <Text style={styles.subtitle}>Collaborative 3D Mesh Capture</Text>

      <View style={styles.createSection}>
        <TextInput
          style={styles.input}
          placeholder="Enter session name"
          value={sessionName}
          onChangeText={setSessionName}
        />
        <TouchableOpacity
          style={styles.createButton}
          onPress={createSession}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Create Session</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sessionsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Sessions</Text>
          <TouchableOpacity onPress={loadSessions} disabled={loading}>
            <Text style={styles.refreshText}>Refresh</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#007AFF" />
        ) : (
          <FlatList
            data={sessions}
            renderItem={renderSessionItem}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                No active sessions. Create one to get started!
              </Text>
            }
          />
        )}
      </View>

      <Text style={styles.deviceInfo}>Device: {deviceId}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 40,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  createSection: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  createButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sessionsSection: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshText: {
    color: '#007AFF',
    fontSize: 16,
  },
  sessionItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  sessionName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  sessionInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  sessionDate: {
    fontSize: 12,
    color: '#999',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginTop: 20,
  },
  deviceInfo: {
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
    marginTop: 10,
  },
});
