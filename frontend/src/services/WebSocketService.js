import { io } from 'socket.io-client';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect() {
    if (this.socket) {
      return;
    }

    // Connect to the backend Socket.IO server
    this.socket = io('http://localhost:3001', {
      path: '/ws',
      autoConnect: false,
      withCredentials: true
    });

    // Set up event listeners
    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected');
      this.isConnected = true;

      // Authenticate the connection
      const token = localStorage.getItem('accessToken');
      if (token) {
        this.socket.emit('authenticate', token);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
      this.isConnected = false;
    });

    this.socket.on('error', (error) => {
      console.error('❌ WebSocket error:', error);
    });

    // Connect to the server
    this.socket.connect();
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Add event listener for notifications
  onNotification(callback) {
    if (this.socket) {
      this.socket.on('notification', callback);
    }
  }

  // Remove event listener
  offNotification(callback) {
    if (this.socket) {
      this.socket.off('notification', callback);
    }
  }
}

// Create a singleton instance
const webSocketService = new WebSocketService();

export default webSocketService;
