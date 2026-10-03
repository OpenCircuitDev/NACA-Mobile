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
