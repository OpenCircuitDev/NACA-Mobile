import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setActiveCommunityId } from '../api/client';
import { getUserCommunities, type Community } from '../api/communities';
import { useAuth } from './AuthContext';

interface CommunityContextType {
  communities: Community[];
  activeCommunity: Community | null;
  isLoading: boolean;
  switchCommunity: (community: Community) => void;
  refreshCommunities: () => Promise<void>;
}

const CommunityContext = createContext<CommunityContextType | null>(null);

const ACTIVE_COMMUNITY_KEY = 'naca_active_community_id';

export function CommunityProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [activeCommunity, setActiveCommunity] = useState<Community | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshCommunities = useCallback(async () => {
    if (!isAuthenticated) {
      setCommunities([]);
      setActiveCommunity(null);
      setActiveCommunityId(null);
      return;
    }

    try {
      const result = await getUserCommunities();
      const comms = result.data || [];
      setCommunities(comms);

      // Restore last active community or pick the first one
      const savedId = await AsyncStorage.getItem(ACTIVE_COMMUNITY_KEY);
      const saved = comms.find(c => c.id === savedId);
      const active = saved || comms[0] || null;

      setActiveCommunity(active);
      setActiveCommunityId(active?.id || null);
    } catch {
      // Failed to load communities
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshCommunities();
  }, [refreshCommunities]);

  const switchCommunity = useCallback((community: Community) => {
    setActiveCommunity(community);
    setActiveCommunityId(community.id);
    AsyncStorage.setItem(ACTIVE_COMMUNITY_KEY, community.id);
  }, []);

  return (
    <CommunityContext.Provider value={{ communities, activeCommunity, isLoading, switchCommunity, refreshCommunities }}>
      {children}
    </CommunityContext.Provider>
  );
}

export function useCommunity() {
  const context = useContext(CommunityContext);
  if (!context) {
    throw new Error('useCommunity must be used within CommunityProvider');
  }
  return context;
}
