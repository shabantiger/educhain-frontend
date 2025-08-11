import { jwtDecode } from 'jwt-decode';

interface TokenPayload {
  institutionId: string;
  name: string;
  walletAddress: string;
  email: string;
  isVerified: boolean;
  exp: number;
}

// Custom event for authentication state changes
const AUTH_STATE_CHANGE_EVENT = 'authStateChange';

export const auth = {
  getToken: () => localStorage.getItem('auth_token'),
  
  setToken: (token: string) => {
    localStorage.setItem('auth_token', token);
    // Dispatch custom event to notify components of auth state change
    window.dispatchEvent(new CustomEvent(AUTH_STATE_CHANGE_EVENT, { detail: { isAuthenticated: true } }));
  },
  
  removeToken: () => {
    localStorage.removeItem('auth_token');
    // Dispatch custom event to notify components of auth state change
    window.dispatchEvent(new CustomEvent(AUTH_STATE_CHANGE_EVENT, { detail: { isAuthenticated: false } }));
  },
  
  isAuthenticated: () => {
    const token = auth.getToken();
    if (!token) return false;
    
    try {
      const decoded = jwtDecode<TokenPayload>(token);
      return decoded.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  },
  
  getUser: () => {
    const token = auth.getToken();
    if (!token) return null;
    
    try {
      return jwtDecode<TokenPayload>(token);
    } catch {
      return null;
    }
  },
  
  logout: () => {
    auth.removeToken();
    window.location.href = '/';
  }
};

export const getAuthHeaders = (): Record<string, string> => {
  const token = auth.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};
