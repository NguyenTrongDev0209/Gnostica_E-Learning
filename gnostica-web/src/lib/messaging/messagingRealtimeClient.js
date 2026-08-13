import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class MessagingRealtimeClient {
  constructor() {
    this.client = null;
    this.status = 'DISCONNECTED'; // DISCONNECTED, CONNECTING, CONNECTED, RECONNECTING, ERROR
    this.listeners = new Map();
    this.subscriptions = [];
    this.processedEvents = new Set();
    this.maxProcessedEvents = 1000;
    this.currentToken = null;
    this.reconnectAttempts = 0;
    this.backoffDelays = [1000, 2000, 5000, 10000, 30000];
  }

  getWsUrl() {
    return import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws';
  }

  getNextReconnectDelay() {
    const delay = this.backoffDelays[Math.min(this.reconnectAttempts, this.backoffDelays.length - 1)];
    this.reconnectAttempts++;
    return delay;
  }

  connect(token) {
    if (!token) {
      this.disconnect();
      return;
    }

    if (this.client && this.client.active && this.currentToken === token) {
      return;
    }

    this.disconnect();
    this.currentToken = token;
    this.reconnectAttempts = 0;
    this.status = 'CONNECTING';
    this.notifyStatusChange();

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const initialDelay = this.backoffDelays[0];

    this.client = new Client({
      webSocketFactory: () => new SockJS(this.getWsUrl()),
      connectHeaders: headers,
      reconnectDelay: initialDelay,
      onConnect: () => {
        const wasReconnecting = this.status === 'RECONNECTING' || this.reconnectAttempts > 0;
        this.status = 'CONNECTED';
        this.reconnectAttempts = 0;
        if (this.client) {
          this.client.reconnectDelay = this.backoffDelays[0];
        }
        this.notifyStatusChange(wasReconnecting ? 'RECONNECTED' : 'CONNECTED');
        this.subscribeQueues();
      },
      onStompError: (frame) => {
        console.warn('[MessagingWS] STOMP Error:', frame.headers?.message || 'Unknown error');
        this.status = 'ERROR';
        this.notifyStatusChange();
      },
      onWebSocketClose: () => {
        if (this.currentToken && this.client) {
          const nextDelay = this.getNextReconnectDelay();
          this.client.reconnectDelay = nextDelay;
          this.status = 'RECONNECTING';
          this.notifyStatusChange();
        } else {
          this.status = 'DISCONNECTED';
          this.notifyStatusChange();
        }
      },
    });

    this.client.activate();
  }

  subscribeQueues() {
    if (!this.client || !this.client.connected) return;

    this.unsubscribeQueues();

    try {
      const subMessages = this.client.subscribe('/user/queue/messages', (messageFrame) => {
        this.handleIncomingEnvelope(messageFrame);
      });
      const subConversations = this.client.subscribe('/user/queue/conversations', (messageFrame) => {
        this.handleIncomingEnvelope(messageFrame);
      });
      const subRead = this.client.subscribe('/user/queue/read-receipts', (messageFrame) => {
        this.handleIncomingEnvelope(messageFrame);
      });

      this.subscriptions = [subMessages, subConversations, subRead];
    } catch (err) {
      console.warn('[MessagingWS] Failed to subscribe queues:', err);
    }
  }

  unsubscribeQueues() {
    if (this.subscriptions && this.subscriptions.length > 0) {
      this.subscriptions.forEach((sub) => {
        try {
          if (sub && typeof sub.unsubscribe === 'function') {
            sub.unsubscribe();
          }
        } catch {
          // ignore
        }
      });
      this.subscriptions = [];
    }
  }

  handleIncomingEnvelope(frame) {
    try {
      const envelope = JSON.parse(frame.body);
      if (!envelope || !envelope.type) return;

      if (envelope.eventId) {
        if (this.processedEvents.has(envelope.eventId)) {
          return; // Skip duplicate event
        }
        this.processedEvents.add(envelope.eventId);
        if (this.processedEvents.size > this.maxProcessedEvents) {
          const firstItem = this.processedEvents.values().next().value;
          this.processedEvents.delete(firstItem);
        }
      }

      const type = envelope.type;
      const listeners = this.listeners.get(type) || [];
      listeners.forEach((callback) => {
        try {
          callback(envelope);
        } catch (err) {
          console.error(`[MessagingWS] Listener error for ${type}:`, err);
        }
      });
    } catch (err) {
      console.error('[MessagingWS] Parse envelope error:', err);
    }
  }

  on(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType).push(callback);

    return () => {
      const list = this.listeners.get(eventType) || [];
      this.listeners.set(
        eventType,
        list.filter((cb) => cb !== callback)
      );
    };
  }

  onStatusChange(callback) {
    return this.on('STATUS_CHANGE', callback);
  }

  notifyStatusChange(eventDetail = null) {
    const listeners = this.listeners.get('STATUS_CHANGE') || [];
    listeners.forEach((cb) => cb(this.status, eventDetail));
  }

  disconnect() {
    this.unsubscribeQueues();
    if (this.client) {
      try {
        this.client.deactivate();
      } catch (err) {
        console.warn('[MessagingWS] Error deactivating client:', err);
      }
      this.client = null;
    }
    this.currentToken = null;
    this.reconnectAttempts = 0;
    this.processedEvents.clear();
    this.status = 'DISCONNECTED';
    this.notifyStatusChange();
  }
}

const messagingRealtimeClient = new MessagingRealtimeClient();
export default messagingRealtimeClient;
