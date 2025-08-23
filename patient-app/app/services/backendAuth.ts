import axios from 'axios';

// Backend API configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

export interface BackendAuthResponse {
  success: boolean;
  token?: string;
  user?: {
    id: number;
    email: string;
    name: string;
    role: string;
    picture?: string;
    is_new_user?: boolean;
  };
  error?: string;
}

export interface VerifyTokenResponse {
  success: boolean;
  user?: {
    id: number;
    email: string;
    name: string;
    role: string;
    picture?: string;
  };
  error?: string;
}

/**
 * Backend API Service for authentication
 */
export class BackendAuthService {
  private static instance: BackendAuthService;
  
  public static getInstance(): BackendAuthService {
    if (!BackendAuthService.instance) {
      BackendAuthService.instance = new BackendAuthService();
    }
    return BackendAuthService.instance;
  }

  /**
   * Authenticate with Google ID token via Django backend
   */
  async authenticateWithGoogle(
    googleIdToken: string, 
    role: 'patient' | 'doctor' = 'patient'
  ): Promise<BackendAuthResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/google/`, {
        token: googleIdToken,
        role: role,
      });

      return response.data;
    } catch (error: any) {
      console.error('Backend authentication error:', error);
      
      if (error.response?.data?.error) {
        return {
          success: false,
          error: error.response.data.error,
        };
      }
      
      return {
        success: false,
        error: 'Authentication failed',
      };
    }
  }

  /**
   * Verify JWT token with backend
   */
  async verifyToken(jwtToken: string): Promise<VerifyTokenResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/verify/`, {
        token: jwtToken,
      });

      return response.data;
    } catch (error: any) {
      console.error('Token verification error:', error);
      
      if (error.response?.data?.error) {
        return {
          success: false,
          error: error.response.data.error,
        };
      }
      
      return {
        success: false,
        error: 'Token verification failed',
      };
    }
  }

  /**
   * Set authorization header for future requests
   */
  setAuthToken(token: string) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Clear authorization header
   */
  clearAuthToken() {
    delete axios.defaults.headers.common['Authorization'];
  }
}

// Export singleton instance
export const backendAuth = BackendAuthService.getInstance();
