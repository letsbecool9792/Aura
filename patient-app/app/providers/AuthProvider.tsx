import React, { createContext, useContext, useEffect, useState } from 'react';
import { Redirect, router, useRootNavigationState } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

// Define the shape of our authentication context
interface User {
  role: 'patient' | 'doctor' | null;
  name: string | null;
  walletAddress: string | null;
  token?: string | null;
  email?: string | null;
  picture?: string | null;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (userData: { 
    role: 'patient' | 'doctor'; 
    name: string; 
    walletAddress: string; 
    token?: string;
    email?: string;
    picture?: string;
  }) => void;
  logout: () => void;
  isLoading: boolean;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// A key for storing the session token in secure storage
const SESSION_KEY = 'user_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigationState = useRootNavigationState();

  // This effect checks for a stored session when the app loads
  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await SecureStore.getItemAsync(SESSION_KEY);
        if (session) {
          // In a real app, you would validate this session token with your server or blockchain
          setUser(JSON.parse(session));
        }
      } catch (e) {
        console.error('Failed to load session:', e);
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, []);

  // The login function for the app
  const login = async (userData: { 
    role: 'patient' | 'doctor'; 
    name: string; 
    walletAddress: string; 
    token?: string;
    email?: string;
    picture?: string;
  }) => {
    try {
      // In a real app, this would be a real token from a login service
      const sessionToken = JSON.stringify(userData);
      await SecureStore.setItemAsync(SESSION_KEY, sessionToken);
      setUser(userData);
      console.log('Login successful:', userData);
      router.replace('/(app)/(patient)/finder'); // Navigate to the main app after login
    } catch (e) {
      console.error('Failed to log in:', e);
    }
  };

  // The logout function for the app
  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync(SESSION_KEY);
      setUser(null);
      console.log('Logout successful');
      router.replace('/(auth)/welcome'); // Navigate back to the auth flow
    } catch (e) {
      console.error('Failed to log out:', e);
    }
  };

  // The context value
  const value = {
    isAuthenticated: !!user,
    user,
    login,
    logout,
    isLoading,
  };

  // Wait until the root layout is mounted to prevent a flicker
  if (!navigationState?.key) {
    return null;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the authentication context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a202c',
  },
  loadingText: {
    marginTop: 10,
    color: '#CBD5E0',
  },
});
