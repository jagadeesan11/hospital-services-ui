import { authApi } from './api';

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  username: string;
  password: string;
  role: 'ADMIN' | 'USER' | 'MANAGER';
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  username: string;
  role: 'ROLE_ADMIN' | 'ROLE_USER' | 'ROLE_MANAGER';
}

export interface LoginResponse {
  token: string;
  type: string;
  id: number;
  username: string;
  email: string;
  name: string;
  role: 'ROLE_ADMIN' | 'ROLE_USER' | 'ROLE_MANAGER';
}

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await authApi.post('/api/auth/login', credentials);
    return response.data;
  },

  register: async (userData: RegisterRequest): Promise<any> => {
    const response = await authApi.post('/api/auth/register', userData);
    return response.data;
  },

  getCurrentUser: async (): Promise<UserResponse> => {
    const response = await authApi.get('/api/users/me');
    return response.data;
  },

  logout: () => {
    console.log('🔐 Logging out - clearing auth data');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
  },

  isAuthenticated: (): boolean => {
    try {
      const token = localStorage.getItem('accessToken');
      return !!token && token !== 'undefined' && token !== 'null';
    } catch (error) {
      console.error('Error checking authentication status:', error);
      return false;
    }
  },

  getStoredUser: (): UserResponse | null => {
    try {
      const user = localStorage.getItem('user');
      const token = localStorage.getItem('accessToken');

      console.log('🔐 Getting stored user:', {
        userExists: !!user,
        tokenExists: !!token,
        allKeys: Object.keys(localStorage),
        timestamp: new Date().toISOString()
      });

      if (!user || user === 'undefined' || user === 'null') {
        console.log('🔐 No valid user found in storage');
        return null;
      }
      return JSON.parse(user);
    } catch (error) {
      console.error('🔐 Error parsing stored user data:', error);
      // Clear corrupted data
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      return null;
    }
  },

  storeAuthData: (token: string, user: UserResponse) => {
    try {
      console.log('🔐 Storing auth data:', {
        tokenLength: token.length,
        tokenPrefix: token.substring(0, 20) + '...',
        user: user.name,
        role: user.role,
        timestamp: new Date().toISOString()
      });

      localStorage.setItem('accessToken', token);
      localStorage.setItem('user', JSON.stringify(user));

      console.log('🔐 Auth data stored successfully');
      
      // Verify storage immediately
      const verifyToken = localStorage.getItem('accessToken');
      const verifyUser = localStorage.getItem('user');
      console.log('🔐 Verification check:', {
        tokenStored: !!verifyToken,
        userStored: !!verifyUser,
        allKeys: Object.keys(localStorage)
      });

    } catch (error) {
      console.error('🔐 Error storing auth data:', error);
    }
  },

  // Helper function to normalize role format
  normalizeUserRole: (role: string): 'ADMIN' | 'USER' | 'MANAGER' => {
    if (role === 'ROLE_ADMIN') return 'ADMIN';
    if (role === 'ROLE_MANAGER') return 'MANAGER';
    if (role === 'ROLE_USER') return 'USER';
    return 'USER'; // default fallback
  }
};

// Add interceptor to include auth token in requests for auth service
authApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
