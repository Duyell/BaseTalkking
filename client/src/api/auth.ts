import client from './client';
import type { User, LoginForm, RegisterForm } from '../types/user';

interface LoginResponse {
  token: string;
  user: User;
}

interface RegisterResponse {
  id: number;
  username: string;
  nickname: string;
}

export const login = (data: LoginForm): Promise<LoginResponse> => {
  return client.post('/auth/login', data);
};

export const register = (data: RegisterForm): Promise<RegisterResponse> => {
  return client.post('/auth/register', data);
};
