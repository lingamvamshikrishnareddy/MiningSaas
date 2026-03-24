export type UserRole = 
  | 'ADMIN' 
  | 'MANAGER' 
  | 'SUPERVISOR' 
  | 'OPERATOR' 
  | 'MAINTENANCE_TECH' 
  | 'VIEWER';

export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organizationId: string;
}

export interface UpdateUserData {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organizationId: string;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  organization?: {
    id: string;
    name: string;
  };
}

export interface UserListFilters {
  role?: UserRole;
  isActive?: boolean;
  search?: string;
  organizationId?: string;
}

export interface UserFilterOptions extends UserListFilters {
  emailVerified?: boolean;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  byRole: {
    role: UserRole;
    count: number;
  }[];
}