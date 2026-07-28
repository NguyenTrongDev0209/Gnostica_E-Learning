import { createContext } from 'react';

export const MessagingRealtimeContext = createContext({
  wsStatus: 'DISCONNECTED',
  reconnect: () => {},
});
