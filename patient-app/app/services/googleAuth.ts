import * as AuthSession from 'expo-auth-session';
import * as Crypto from 'expo-crypto';

// Google OAuth2 configuration
const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || 'your_google_client_id_here';
const REDIRECT_URI = AuthSession.makeRedirectUri({ 
  scheme: 'aura'
});

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: GoogleUser;
  error?: string;
}

/**
 * Google OAuth2 Authentication Service
 */
export class GoogleAuthService {
  private static instance: GoogleAuthService;
  
  public static getInstance(): GoogleAuthService {
    if (!GoogleAuthService.instance) {
      GoogleAuthService.instance = new GoogleAuthService();
    }
    return GoogleAuthService.instance;
  }

  /**
   * Initiate Google OAuth2 flow
   */
  async signIn(): Promise<AuthResponse> {
    try {
      // Create code challenge for PKCE
      const codeChallenge = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        Math.random().toString(36).substring(2, 15),
        { encoding: Crypto.CryptoEncoding.BASE64 }
      );

      // OAuth2 request configuration
      const request = new AuthSession.AuthRequest({
        clientId: GOOGLE_CLIENT_ID,
        scopes: ['openid', 'profile', 'email'],
        responseType: AuthSession.ResponseType.Code,
        redirectUri: REDIRECT_URI,
        codeChallenge,
        codeChallengeMethod: AuthSession.CodeChallengeMethod.S256,
      });

      // Start OAuth2 flow
      const result = await request.promptAsync({
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      });

      if (result.type === 'success' && result.params.code) {
        // Exchange authorization code for tokens
        const tokenResponse = await this.exchangeCodeForToken(
          result.params.code,
          codeChallenge
        );

        if (tokenResponse.success && tokenResponse.id_token) {
          // Get user info from ID token
          const userInfo = await this.getUserInfo(tokenResponse.id_token);
          
          if (userInfo) {
            return {
              success: true,
              token: tokenResponse.id_token,
              user: userInfo,
            };
          }
        }
      }

      return {
        success: false,
        error: 'Authentication failed',
      };
    } catch (error) {
      console.error('Google Sign-In error:', error);
      return {
        success: false,
        error: 'Authentication failed',
      };
    }
  }

  /**
   * Exchange authorization code for access token and ID token
   */
  private async exchangeCodeForToken(
    code: string,
    codeVerifier: string
  ): Promise<any> {
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: GOOGLE_CLIENT_ID,
          code,
          code_verifier: codeVerifier,
          grant_type: 'authorization_code',
          redirect_uri: REDIRECT_URI,
        }).toString(),
      });

      const data = await response.json();
      
      if (response.ok) {
        return {
          success: true,
          access_token: data.access_token,
          id_token: data.id_token,
          refresh_token: data.refresh_token,
        };
      } else {
        console.error('Token exchange error:', data);
        return { success: false };
      }
    } catch (error) {
      console.error('Token exchange error:', error);
      return { success: false };
    }
  }

  /**
   * Decode and extract user information from ID token
   */
  private async getUserInfo(idToken: string): Promise<GoogleUser | null> {
    try {
      // For production, you should verify the token signature
      // For development, we'll just decode the payload
      const payload = JSON.parse(
        atob(idToken.split('.')[1])
      );

      return {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
      };
    } catch (error) {
      console.error('Error decoding ID token:', error);
      return null;
    }
  }

  /**
   * Sign out (clear local state)
   */
  async signOut(): Promise<void> {
    // Clear any stored tokens or user data
    // This is handled by the AuthProvider in your app
  }
}

// Export singleton instance
export const googleAuth = GoogleAuthService.getInstance();
