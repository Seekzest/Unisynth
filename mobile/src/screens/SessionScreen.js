import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Camera } from 'expo-camera';
import { Audio } from 'expo-av';
import { Accelerometer, Gyroscope, Magnetometer } from 'expo-sensors';
import api from '../services/api';

export default function SessionScreen({ route, navigation }) {
  const { sessionId, deviceId } = route.params;
  const [hasPermission, setHasPermission] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [session, setSession] = useState(null);
  const [connectedDevices, setConnectedDevices] = useState([]);
  const [recordingTime, setRecordingTime] = useState(0);

  const cameraRef = useRef(null);
  const recordingRef = useRef(null);
  const audioRecordingRef = useRef(null);
  const poseDataRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    (async () => {
      // Request permissions
      const cameraStatus = await Camera.requestCameraPermissionsAsync();
      const audioStatus = await Audio.requestPermissionsAsync();
      setHasPermission(
        cameraStatus.status === 'granted' && audioStatus.status === 'granted'
      );

      // Set audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
    })();

    loadSession();
    connectToSession();

    return () => {
      api.disconnect();
      stopSensors();
    };
  }, []);

  const loadSession = async () => {
    try {
      const response = await api.getSession(sessionId);
      if (response.success) {
        setSession(response.session);
        setConnectedDevices(response.session.devices);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load session');
    }
  };

  const connectToSession = async () => {
    try {
      await api.connectWebSocket();

      api.on('connected', (data) => {
        console.log('Connected with ID:', data.connectionId);
      });

      api.on('joined-session', (data) => {
        setSession(data.session);
        setConnectedDevices(data.session.devices);
      });

      api.on('device-joined', (data) => {
        loadSession();
      });

      api.on('device-left', (data) => {
        loadSession();
      });

      api.on('recording-started', (data) => {
        startRecording();
      });

      api.on('recording-stopped', (data) => {
        stopRecording();
      });

      // Join the session
      const deviceInfo = {
        model: deviceId,
        platform: 'mobile',
      };
      api.joinSession(sessionId, deviceId, deviceInfo);
    } catch (error) {
      Alert.alert('Error', 'Failed to connect to session');
    }
  };

  const startSensors = () => {
    Accelerometer.setUpdateInterval(100);
    Gyroscope.setUpdateInterval(100);
    Magnetometer.setUpdateInterval(100);

    const accelerometerSubscription = Accelerometer.addListener((data) => {
      poseDataRef.current.push({
        timestamp: Date.now(),
        type: 'accelerometer',
        data,
      });
    });

    const gyroscopeSubscription = Gyroscope.addListener((data) => {
      poseDataRef.current.push({
        timestamp: Date.now(),
        type: 'gyroscope',
        data,
      });
    });

    const magnetometerSubscription = Magnetometer.addListener((data) => {
      poseDataRef.current.push({
        timestamp: Date.now(),
        type: 'magnetometer',
        data,
      });
    });

    return () => {
      accelerometerSubscription && accelerometerSubscription.remove();
      gyroscopeSubscription && gyroscopeSubscription.remove();
      magnetometerSubscription && magnetometerSubscription.remove();
    };
  };

  const stopSensors = () => {
    Accelerometer.removeAllListeners();
    Gyroscope.removeAllListeners();
    Magnetometer.removeAllListeners();
  };

  const startRecording = async () => {
    if (!cameraRef.current || isRecording) return;

    try {
      setIsRecording(true);
      poseDataRef.current = [];

      // Start sensor recording
      const sensorCleanup = startSensors();

      // Start video recording
      const videoRecording = await cameraRef.current.recordAsync({
        quality: Camera.Constants.VideoQuality['720p'],
        maxDuration: 60, // 60 seconds max
      });
      recordingRef.current = videoRecording;

      // Start audio recording
      const audioRecording = new Audio.Recording();
      await audioRecording.prepareToRecordAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );
      await audioRecording.startAsync();
      audioRecordingRef.current = audioRecording;

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('Error', 'Failed to start recording');
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    if (!isRecording) return;

    try {
      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      setIsRecording(false);

      // Stop video recording
      if (cameraRef.current) {
        cameraRef.current.stopRecording();
      }

      // Stop audio recording
      if (audioRecordingRef.current) {
        await audioRecordingRef.current.stopAndUnloadAsync();
        const audioUri = audioRecordingRef.current.getURI();

        // Upload audio
        if (audioUri) {
          await api.uploadFile(sessionId, deviceId, audioUri, 'audio');
        }
      }

      // Stop sensors
      stopSensors();

      // Upload video
      if (recordingRef.current) {
        await api.uploadFile(sessionId, deviceId, recordingRef.current.uri, 'video');
      }

      // Upload pose data
      if (poseDataRef.current.length > 0) {
        const poseBlob = new Blob([JSON.stringify(poseDataRef.current)], {
          type: 'application/json',
        });
        const poseUri = URL.createObjectURL(poseBlob);
        await api.uploadFile(sessionId, deviceId, poseUri, 'pose');
      }

      Alert.alert('Success', 'Recording uploaded successfully!');
      setRecordingTime(0);
    } catch (error) {
      console.error('Error stopping recording:', error);
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  const initiateRecording = () => {
    api.startRecording(sessionId);
  };

  const initiateStop = () => {
    api.stopRecording(sessionId);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Camera and microphone permissions are required
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera style={styles.camera} ref={cameraRef} type={Camera.Constants.Type.back}>
        <View style={styles.overlay}>
          <View style={styles.header}>
            <Text style={styles.sessionTitle}>
              {session?.name || 'Loading...'}
            </Text>
            <Text style={styles.deviceCount}>
              {connectedDevices.length} devices connected
            </Text>
          </View>

          {isRecording && (
            <View style={styles.recordingIndicator}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingText}>
                Recording {Math.floor(recordingTime / 60)}:
                {(recordingTime % 60).toString().padStart(2, '0')}
              </Text>
            </View>
          )}

          <View style={styles.controls}>
            {!isRecording ? (
              <TouchableOpacity
                style={styles.recordButton}
                onPress={initiateRecording}
              >
                <Text style={styles.buttonText}>Start Recording</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.recordButton, styles.stopButton]}
                onPress={initiateStop}
              >
                <Text style={styles.buttonText}>Stop Recording</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.deviceList}>
            <Text style={styles.deviceListTitle}>Connected Devices:</Text>
            {connectedDevices.map((device) => (
              <Text key={device.id} style={styles.deviceItem}>
                • {device.model} ({device.status})
              </Text>
            ))}
          </View>
        </View>
      </Camera>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  header: {
    padding: 20,
    paddingTop: 50,
  },
  sessionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  deviceCount: {
    fontSize: 16,
    color: 'white',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'red',
    marginRight: 8,
  },
  recordingText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  controls: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 50,
  },
  recordButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  stopButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  deviceList: {
    padding: 20,
  },
  deviceListTitle: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  deviceItem: {
    fontSize: 14,
    color: 'white',
    marginBottom: 5,
  },
  errorText: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 20,
  },
});
