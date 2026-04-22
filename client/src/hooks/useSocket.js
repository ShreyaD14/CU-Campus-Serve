import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

let socketInstance = null;

function getSocket() {
  if (!socketInstance) {
    socketInstance = io('/', { autoConnect: false, transports: ['websocket', 'polling'] });
  }
  return socketInstance;
}

export function useSocket() {
  const socket = getSocket();
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    socket.connect();
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);

  return { socket, connected };
}

export function useOrderTracking(orderId) {
  const { socket } = useSocket();
  const [status, setStatus] = useState(null);
  const [agentLocation, setAgentLocation] = useState(null);
  const [agentAssigned, setAgentAssigned] = useState(null);

  useEffect(() => {
    if (!orderId) return;
    socket.emit('order:track', { orderId });
    socket.on('order:statusUpdate', (data) => {
      if (String(data.orderId) === String(orderId)) setStatus(data.status);
    });
    socket.on('delivery:locationUpdate', (data) => setAgentLocation(data));
    socket.on('delivery:assigned', (data) => {
      if (String(data.orderId) === String(orderId)) setAgentAssigned(data.agentId);
    });
    return () => {
      socket.off('order:statusUpdate');
      socket.off('delivery:locationUpdate');
      socket.off('delivery:assigned');
    };
  }, [orderId, socket]);

  return { status, agentLocation, agentAssigned };
}
