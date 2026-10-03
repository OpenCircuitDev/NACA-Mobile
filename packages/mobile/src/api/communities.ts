import { apiRequest } from './client';
import type { Community, DashboardData } from '@naca/shared';
export type { Community, DashboardData } from '@naca/shared';

export async function getUserCommunities(): Promise<{ success: boolean; data: Community[] }> {
  return apiRequest('GET', '/api/connected/mobile/communities');
}

export async function getCommunityDashboard(communityId: string): Promise<{ success: boolean; data: DashboardData }> {
  return apiRequest('GET', `/api/connected/mobile/dashboard/${communityId}`);
}
