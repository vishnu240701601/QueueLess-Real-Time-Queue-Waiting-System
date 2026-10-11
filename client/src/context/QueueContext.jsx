import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { queueService } from '../api/queueService';
import { useAuth } from './AuthContext';

const QueueContext = createContext(null);

export function QueueProvider({ children }) {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [activeToken, setActiveToken] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchQueueData = useCallback(async () => {
    try {
      setError(null);
      const [serviceList, tokenData, histList] = await Promise.all([
        queueService.getServices(),
        user ? queueService.getStudentActiveToken(user.id) : null,
        queueService.getHistory()
      ]);
      setServices(serviceList);
      setActiveToken(tokenData);
      setHistory(histList);
    } catch (err) {
      console.error('Failed to load queue data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchQueueData();
    // Subscribe to state updates (mimicking Supabase Realtime)
    const unsubscribe = queueService.subscribe(() => {
      fetchQueueData();
    });
    return () => unsubscribe();
  }, [fetchQueueData]);

  const joinQueue = async (serviceId) => {
    if (!user) throw new Error('You must be signed in to join a queue.');
    const token = await queueService.joinQueue(serviceId, user);
    await fetchQueueData();
    return token;
  };

  const cancelToken = async (tokenId, reason) => {
    await queueService.cancelToken(tokenId, reason);
    await fetchQueueData();
  };

  return (
    <QueueContext.Provider value={{
      services,
      activeToken,
      history,
      loading,
      error,
      joinQueue,
      cancelToken,
      refreshQueue: fetchQueueData
    }}>
      {children}
    </QueueContext.Provider>
  );
}

export function useQueue() {
  const context = useContext(QueueContext);
  if (!context) throw new Error('useQueue must be used within a QueueProvider');
  return context;
}
