import { OAuth2Client, TokenPayload } from 'google-auth-library';
import env from '../config/environment';
import { AppError } from '../middleware/error.middleware';

class GoogleAuthService {
  private client: OAuth2Client;

  constructor() {
    this.client = new OAuth2Client(env.GOOGLE_CLIENT_ID);
  }

  /**
   * Verify Google ID token and return payload
   */
  async verifyToken(idToken: string): Promise<TokenPayload> {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new AppError('Invalid Google token payload', 400);
      }

      return payload;
    } catch (error) {
      console.error('Google token verification error:', error);
      throw new AppError('Failed to verify Google token', 401);
    }
  }
}

export default new GoogleAuthService();
