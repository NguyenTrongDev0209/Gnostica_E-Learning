import { useContext } from 'react';
import { MessagingRealtimeContext } from './MessagingRealtimeContext';

export const useMessagingRealtime = () => useContext(MessagingRealtimeContext);
