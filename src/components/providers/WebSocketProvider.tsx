"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface WebSocketContextType {
  isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws');

    ws.onopen = () => {
      console.log('WebSocket connection established');
      setIsConnected(true);
      toast.success('เชื่อมต่อกับเซิร์ฟเวอร์แจ้งเตือนแล้ว');
    };

    ws.onmessage = (event) => {
      console.log('Message from server: ', event.data);
      toast.info(event.data, {
        description: 'มีการแจ้งเตือนใหม่เข้ามา',
        duration: 5000,
      });
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
      setIsConnected(false);
      toast.error('การเชื่อมต่อกับเซิร์ฟเวอร์แจ้งเตือนหลุด');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
      toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อ WebSocket');
    };

    // Clean up the connection when the component unmounts
    return () => {
      ws.close();
    };
  }, []);

  const value = {
    isConnected,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};
