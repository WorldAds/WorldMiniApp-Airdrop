"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// import { MiniKit } from "@worldcoin/minikit-js"; // Commented for development
import { loginUser, getUserByWorldID } from '@/app/api/service';

export interface User {
  _id: string;
  worldId: string;
  nickname?: string;
  walletAddress: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (worldId: string, walletAddress: string) => Promise<User | null>;
  fetchUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock user data for development
  const mockUser = {
    _id: "mock-user-id",
    worldId: "mock-world-id",
    nickname: "Developer",
    walletAddress: "0x1234567890abcdef1234567890abcdef12345678",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const login = async (worldId: string, walletAddress: string) => {
    try {
      // For development, use mock data instead of API call
      console.log('Mock login with:', { worldId, walletAddress });
      setUser(mockUser);
      return mockUser;
      
      /* Commented for development
      const response = await loginUser({
        worldId,
        walletAddress
      });
      
      setUser(response);
      return response;
      */
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  };

  const fetchUserData = async () => {
    // For development, set mock user data
    setUser(mockUser);
    setIsLoading(false);
    
    /* Commented for development
    if (!MiniKit.isInstalled()) {
      setIsLoading(false);
      return;
    }

    try {
      // Get wallet address from MiniKit
      const walletAddress = MiniKit.walletAddress;
      if (!walletAddress) {
        setIsLoading(false);
        return;
      }

      // We'll need to get the World ID from the session
      // This will be handled in the components that use this context
      // by passing the worldId from the session

    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
    */
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    fetchUserData
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
