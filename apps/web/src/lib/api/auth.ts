import { api } from '../api-client';
import type { User } from '@needx/types';
import type { LoginInput, RegisterInput } from '@needx/validation';

export const authApi = {
  me: () => api.get<User>('/users/me'),
  register: (input: RegisterInput) => api.post<User>('/auth/register', input),
  login: (input: LoginInput) => api.post<User>('/auth/login', input),
  logout: () => api.post<{ loggedOut: true }>('/auth/logout'),
  forgotPassword: (email: string) => api.post<{ message: string }>('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) => api.post<{ message: string }>('/auth/reset-password', { token, password }),
  verifyEmail: (token: string) => api.post<{ message: string }>('/auth/verify-email', { token }),
  requestOtp: (phone: string) => api.post<{ message: string }>('/auth/otp/request', { phone }),
  verifyOtp: (phone: string, code: string) => api.post<{ message: string }>('/auth/otp/verify', { phone, code }),
};
