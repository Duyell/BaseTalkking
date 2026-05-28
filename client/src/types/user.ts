export interface User {
  id: number;
  username: string;
  nickname: string;
  avatar: string;
  intro?: string;
  role: 'admin' | 'user';
  status: number;
  invite_code?: string;
  create_time: string;
}

export interface LoginForm {
  username: string;
  password: string;
}

export interface RegisterForm {
  username: string;
  password: string;
  invite_code: string;
}
