"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MiniKit } from "@worldcoin/minikit-js";
import { loginUser, getUserByWorldID, uploadUserAvatar } from '@/app/api/service';

export interface User {
  _id: string;
  worldId: string;
  nickname?: string;
  walletAddress: string;
  createdAt: string;
  updatedAt: string;
  avatarUrl: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (worldId: string, walletAddress: string) => Promise<User | null>;
  fetchUserData: () => Promise<void>;
  updateAvatar: (file: File) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = async (worldId: string, walletAddress: string) => {
    try {
      const response = await loginUser({
        worldId,
        walletAddress
      });
      
      setUser(response);
      return response;
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  };

  const fetchUserData = async () => {
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

      // For development, use a mock World ID
      // In production, you would need to get the World ID from the session or another source
      const mockWorldId = "mock-world-id";
      
      // Try to get user data by World ID
      try {
        const userData = await getUserByWorldID(mockWorldId);
        if (userData) {
          setUser(userData);
        } else {
          // If user doesn't exist, try to login (which will create the user if needed)
          await login(mockWorldId, walletAddress);
        }
      } catch (error) {
        console.error('Error fetching user by World ID:', error);
        // Try to login (which will create the user if needed)
        await login(mockWorldId, walletAddress);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateAvatar = async (file: File) => {
    if (!user) {
      console.error('Cannot update avatar: No user logged in');
      return false;
    }

    try {
      const response = await uploadUserAvatar(user._id, file);
      
      // Update the user state with the new avatar URL
      setUser(prevUser => {
        if (!prevUser) return null;
        return {
          ...prevUser,
          avatarUrl: response.avatarUrl
        };
      });
      
      return true;
    } catch (error) {
      console.error('Error updating avatar:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    fetchUserData,
    updateAvatar
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
