export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface PackageResponse<T = unknown> {
  data: T;
  subscription_required: boolean;
  package: string | null;
  message: string | null;
  feature?: string;
}
