import React, { useEffect, useState, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import useAuthStore from '@/store/useAuthStore';
import messagingRealtimeClient from '@/lib/messaging/messagingRealtimeClient';
import { messagingCache } from '@/lib/messaging/messagingCache';
import { messagingKeys } from '@/lib/messaging/messagingQueryKeys';
import { MessagingRealtimeContext } from './MessagingRealtimeContext';

export const MessagingRealtimeProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const [wsStatus, setWsStatus] = useState('DISCONNECTED');
  const prevStatusRef = useRef('DISCONNECTED');

  const token = user?.token || null;
  const currentAccountId = user?.id || user?.accountId || null;

  useEffect(() => {
    const unsubStatus = messagingRealtimeClient.onStatusChange((status, eventDetail) => {
      setWsStatus(status);

      // Cache resynchronization after reconnecting
      if (
        status === 'CONNECTED' &&
        (prevStatusRef.current === 'RECONNECTING' || eventDetail === 'RECONNECTED')
      ) {
        queryClient.invalidateQueries({ queryKey: messagingKeys.conversations() });
        queryClient.invalidateQueries({ queryKey: messagingKeys.allMessages() });
      }
      prevStatusRef.current = status;
    });

    if (token) {
      messagingRealtimeClient.connect(token);
    } else {
      messagingRealtimeClient.disconnect();
    }

    return () => {
      unsubStatus();
    };
  }, [token, queryClient]);

  useEffect(() => {
    if (!token) return;

    const unsubMessage = messagingRealtimeClient.on('MESSAGE_CREATED', (envelope) => {
      messagingCache.onMessageCreated(queryClient, envelope, currentAccountId);
    });

    const unsubUpdated = messagingRealtimeClient.on('CONVERSATION_UPDATED', (envelope) => {
      messagingCache.onConversationUpdated(queryClient, envelope);
    });

    const unsubRead = messagingRealtimeClient.on('CONVERSATION_READ', (envelope) => {
      messagingCache.onConversationRead(queryClient, envelope);
    });

    return () => {
      unsubMessage();
      unsubUpdated();
      unsubRead();
    };
  }, [token, queryClient, currentAccountId]);

  useEffect(() => {
    const handleOnline = () => {
      if (token) {
        messagingRealtimeClient.connect(token);
        queryClient.invalidateQueries({ queryKey: messagingKeys.conversations() });
        queryClient.invalidateQueries({ queryKey: messagingKeys.allMessages() });
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [token, queryClient]);

  const reconnect = () => {
    if (token) {
      messagingRealtimeClient.connect(token);
    }
  };

  return (
    <MessagingRealtimeContext.Provider value={{ wsStatus, reconnect }}>
      {children}
    </MessagingRealtimeContext.Provider>
  );
};
