import { apiRequest } from './client';

export interface Community {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  bannerImageUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  role: string;
  joinedAt: string;
}

export interface DashboardData {
  community: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    primaryColor: string | null;
    secondaryColor: string | null;
  };
  stats: {
    totalEntries: number;
    totalDictionaries: number;
    totalMembers: number;
  };
}

export async function getUserCommunities(): Promise<{ success: boolean; data: Community[] }> {
  return apiRequest('GET', '/api/connected/mobile/communities');
}

export async function getCommunityDashboard(communityId: string): Promise<{ success: boolean; data: DashboardData }> {
  return apiRequest('GET', `/api/connected/mobile/dashboard/${communityId}`);
}
