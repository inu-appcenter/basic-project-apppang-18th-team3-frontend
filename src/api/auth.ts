import instance from '@/api/instance';
import type {
  EmailCheckResponse,
  FindEmailRequest,
  FindEmailResponse,
  LoginRequest,
  LoginResponse,
  LogoutResponse,
  PasswordResetVerifyRequest,
  PasswordResetVerifyResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  SignupRequest,
  SignupResponse,
} from '@/types/auth';

export const login = async (payload: LoginRequest) => {
  const { data } = await instance.post<LoginResponse>('/api/auth/login', payload);
  return data;
};

export const signup = async (payload: SignupRequest) => {
  const { data } = await instance.post<SignupResponse>('/api/auth/signup', payload);
  return data;
};

export const checkEmail = async (email: string) => {
  const { data } = await instance.get<EmailCheckResponse>('/api/auth/check-email', {
    params: { email },
  });
  return data;
};

export const logout = async () => {
  const { data } = await instance.post<LogoutResponse>('/api/auth/logout');
  return data;
};

export const findEmail = async (payload: FindEmailRequest) => {
  const { data } = await instance.post<FindEmailResponse>('/api/auth/find-email', payload);
  return data;
};

export const verifyPasswordReset = async (payload: PasswordResetVerifyRequest) => {
  const { data } = await instance.post<PasswordResetVerifyResponse>(
    '/api/auth/password-reset-verify',
    payload,
  );
  return data;
};

export const resetPassword = async (payload: ResetPasswordRequest) => {
  const { data } = await instance.post<ResetPasswordResponse>('/api/auth/reset-password', payload);
  return data;
};
