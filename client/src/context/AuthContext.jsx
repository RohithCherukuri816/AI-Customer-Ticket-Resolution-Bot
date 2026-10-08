import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('resolvai_token') || null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);

  // Initialize Socket.io
  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    const s = io(socketUrl, {
      transports: ['websocket', 'polling'],
    });

    s.on('connect', () => {
      console.log('Socket connected:', s.id);
      if (user && (user.role === 'agent' || user.role === 'admin')) {
        s.emit('join_agents');
      }
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [user]);

  // Load current user profile if token exists
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        // Auto log in as demo agent by default for immediate preview if nothing in localStorage
        await quickSwitchUser('agent');
        return;
      }

      try {
        const { data } = await API.get('/auth/me');
        if (data.success) {
          setUser(data.user);
        } else {
          logout();
        }
      } catch (err) {
        console.warn('Token validation failed, falling back to demo login:', err.message);
        await quickSwitchUser('agent');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await API.post('/auth/login', { email, password });
      if (data.success) {
        localStorage.setItem('resolvai_token', data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const { data } = await API.post('/auth/register', userData);
      if (data.success) {
        localStorage.setItem('resolvai_token', data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('resolvai_token');
    setToken(null);
    setUser(null);
  };

  // Instant 1-click role switcher for seamless demo/viva evaluation
  const quickSwitchUser = async (targetRole) => {
    setLoading(true);
    try {
      const credentials = {
        admin: { email: 'admin@support.ai', password: 'password123' },
        agent: { email: 'agent@support.ai', password: 'password123' },
        customer: { email: 'alice@customer.com', password: 'password123' },
      };

      const cred = credentials[targetRole] || credentials.agent;
      const { data } = await API.post('/auth/login', cred);
      if (data.success) {
        localStorage.setItem('resolvai_token', data.token);
        setToken(data.token);
        setUser(data.user);
      }
    } catch (err) {
      console.error('Quick switch error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        socket,
        login,
        register,
        logout,
        quickSwitchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
