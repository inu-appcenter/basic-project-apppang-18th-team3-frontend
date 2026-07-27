export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserInfo {
  userId: number;
  name: string;
}

export interface LoginResponse {
  token: string;
  user: UserInfo;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  phoneNumber: string;
  agreedRequiredTerms: boolean;
}

export interface SignupResponse {
  userId: number;
  email: string;
  name: string;
}

export interface EmailCheckResponse {
  available: boolean;
}

export interface LogoutResponse {
  message: string;
}

export interface FindEmailRequest {
  name: string;
  phoneNumber: string;
}

export interface FindEmailResponse {
  emails: string[];
}

export interface PasswordResetVerifyRequest {
  email: string;
  name: string;
  phoneNumber: string;
}

export interface PasswordResetVerifyResponse {
  resetToken: string;
}

export interface ResetPasswordRequest {
  resetToken: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}
