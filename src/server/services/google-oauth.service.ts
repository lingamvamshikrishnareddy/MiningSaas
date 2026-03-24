import { OAuth2Client } from 'google-auth-library';
import env from '../config/environment';
import { AppError } from '../middleware/error.middleware';

class GoogleOAuthService {
  private client: OAuth2Client;
  private readonly SCOPES = ['openid', 'email', 'profile'];

  constructor() {
    this.client = new OAuth2Client(
      env.GOOGLE_CLIENT_ID,
      env.GOOGLE_CLIENT_SECRET,
      this.getRedirectUri()
    );
  }

  private getRedirectUri(): string {
    // In production, this would be your production domain
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://your-domain.com' 
      : 'http://localhost:5000';
    return `${baseUrl}/api/auth/google/callback`;
  }

  /**
   * Generate the authorization URL for Google OAuth
   */
  getAuthorizationUrl(state: string): string {
    return this.client.generateAuthUrl({
      access_type: 'offline',
      scope: this.SCOPES,
      state,
      prompt: 'consent',
    });
  }

  /**
   * Exchange authorization code for tokens
   */
  async getTokensFromCode(code: string): Promise<{
    tokens: any;
    payload: any;
  }> {
    try {
      const { tokens } = await this.client.getToken(code);
      
      // Verify the ID token
      const ticket = await this.client.verifyIdToken({
        idToken: tokens.id_token!,
        audience: env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      
      if (!payload) {
        throw new AppError('Invalid Google token payload', 400);
      }

      return { tokens, payload };
    } catch (error) {
      console.error('Error exchanging code for tokens:', error);
      throw new AppError('Failed to exchange authorization code', 400);
    }
  }
}

export default new GoogleOAuthService();
