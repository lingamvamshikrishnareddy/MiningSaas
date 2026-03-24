export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organizationId?: string;
  organizationName?: string;
  role?: 'ADMIN' | 'MANAGER' | 'SUPERVISOR' | 'OPERATOR' | 'MAINTENANCE_TECH' | 'VIEWER';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: UserAuthInfo;
  tokens: AuthTokens;
}

export interface UserAuthInfo {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  organizationId: string;
  organization?: {
    id: string;
    name: string;
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface JWTPayload {
  id: string;
  email: string;
  role: string;
  organizationId: string;
  iat?: number;
  exp?: number;
}