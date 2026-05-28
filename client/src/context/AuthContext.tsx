import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { User, LoginForm, RegisterForm } from '../types/user';
import * as authApi from '../api/auth';
import * as storage from '../utils/storage';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'INIT_DONE'; payload: { user: User | null; token: string | null } };

interface AuthContextValue extends AuthState {
  login: (data: LoginForm) => Promise<void>;
  register: (data: RegisterForm) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function reducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true };
    case 'LOGIN_SUCCESS':
      return {
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      };
    case 'LOGOUT':
      return { user: null, token: null, isAuthenticated: false, loading: false };
    case 'INIT_DONE':
      return {
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: !!action.payload.token,
        loading: false,
      };
    default:
      return state;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: true,
  });

  // 初始化：从 localStorage 恢复登录状态
  useEffect(() => {
    const token = storage.getToken();
    const user = storage.getUser<User>();
    dispatch({ type: 'INIT_DONE', payload: { user, token } });
  }, []);

  const login = async (data: LoginForm) => {
    dispatch({ type: 'LOGIN_START' });
    const res = await authApi.login(data);
    storage.setToken(res.token);
    storage.setUser(res.user);
    dispatch({ type: 'LOGIN_SUCCESS', payload: res });
  };

  const register = async (data: RegisterForm) => {
    await authApi.register(data);
  };

  const logout = () => {
    storage.removeToken();
    storage.removeUser();
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
