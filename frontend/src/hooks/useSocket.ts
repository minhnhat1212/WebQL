import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './useAuth';

const SOCKET_URL = 'http://localhost:5000'; // Sửa lại nếu backend chạy cổng khác

export function useSocket() {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (user && !socketRef.current) {
      try {
        const socket = io(SOCKET_URL, { 
          transports: ['polling', 'websocket'],
          timeout: 10000,
          reconnection: true,
          reconnectionAttempts: 10,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          forceNew: true
        });
        
        socket.on('connect', () => {
          console.log('Socket connected successfully');
          socket.emit('join', user.id);
        });
        
        socket.on('connect_error', (error) => {
          console.warn('Socket connection error:', error.message);
        });
        
        socket.on('disconnect', (reason) => {
          console.log('Socket disconnected:', reason);
        });
        
        socket.on('reconnect', (attemptNumber) => {
          console.log('Socket reconnected after', attemptNumber, 'attempts');
        });
        
        socket.on('reconnect_error', (error) => {
          console.warn('Socket reconnection error:', error);
        });
        
        socketRef.current = socket;
      } catch (error) {
        console.error('Failed to initialize socket:', error);
      }
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
    // eslint-disable-next-line
  }, [user?.id]);

  // Hàm join room hội thoại
  const joinConversation = (conversationId: string) => {
    socketRef.current?.emit('join-conversation', conversationId);
  };

  // Hàm gửi tin nhắn real-time
  const sendMessage = (conversationId: string, message: any) => {
    socketRef.current?.emit('send-message', { conversationId, message });
  };

  // Lắng nghe tin nhắn mới
  const onReceiveMessage = (handler: (message: any) => void) => {
    socketRef.current?.on('receive-message', handler);
    return () => {
      socketRef.current?.off('receive-message', handler);
    };
  };

  return { socket: socketRef.current, joinConversation, sendMessage, onReceiveMessage };
} 