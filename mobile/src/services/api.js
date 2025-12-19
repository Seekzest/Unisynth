// API configuration and service
const API_BASE_URL = 'http://localhost:3000'; // Change to your server URL

class UnisynthAPI {
  constructor() {
    this.ws = null;
    this.listeners = new Map();
  }

  // Session Management
  async createSession(name, creatorId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, creatorId }),
      });
      return await response.json();
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }

  async getSession(sessionId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}`);
      return await response.json();
    } catch (error) {
      console.error('Error getting session:', error);
      throw error;
    }
  }

  async listSessions() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sessions`);
      return await response.json();
    } catch (error) {
      console.error('Error listing sessions:', error);
      throw error;
    }
  }

  // File Upload
  async uploadFile(sessionId, deviceId, fileUri, fileType) {
    try {
      const formData = new FormData();
      formData.append('deviceId', deviceId);
      
      const filename = fileUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `${fileType}/${match[1]}` : fileType;

      formData.append(fileType, {
        uri: fileUri,
        name: filename,
        type,
      });

      const response = await fetch(
        `${API_BASE_URL}/api/sessions/${sessionId}/upload/${fileType}`,
        {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return await response.json();
    } catch (error) {
      console.error(`Error uploading ${fileType}:`, error);
      throw error;
    }
  }

  // WebSocket Connection
  connectWebSocket() {
    return new Promise((resolve, reject) => {
      const wsUrl = API_BASE_URL.replace('http', 'ws');
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        resolve();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        reject(error);
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleWebSocketMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
      };
    });
  }

  handleWebSocketMessage(data) {
    const { type } = data;
    const listeners = this.listeners.get(type) || [];
    listeners.forEach(callback => callback(data));
  }

  on(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType).push(callback);
  }

  off(eventType, callback) {
    const listeners = this.listeners.get(eventType) || [];
    const index = listeners.indexOf(callback);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  }

  send(type, payload) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    }
  }

  joinSession(sessionId, deviceId, deviceInfo) {
    this.send('join-session', { sessionId, deviceId, deviceInfo });
  }

  startRecording(sessionId) {
    this.send('start-recording', { sessionId });
  }

  stopRecording(sessionId) {
    this.send('stop-recording', { sessionId });
  }

  syncTime() {
    this.send('sync-time', { clientTime: Date.now() });
  }

  sendPoseUpdate(sessionId, deviceId, pose) {
    this.send('pose-update', { sessionId, deviceId, pose });
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export default new UnisynthAPI();
