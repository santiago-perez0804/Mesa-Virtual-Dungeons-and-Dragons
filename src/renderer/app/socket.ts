import { io } from 'socket.io-client';

export const socket = io(
  window.location.port === '5173'
    ? `${window.location.protocol}//${window.location.hostname}:3000`
    : window.location.origin
);
