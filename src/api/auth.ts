import instance from '@/api/instance';
import type {
  EmailCheckResponse,
  LoginRequest,
  LoginResponse,
  LogoutResponse,
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
