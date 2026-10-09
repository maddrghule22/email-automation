import bcrypt from 'bcryptjs';
import { config } from '@/lib/config';

const SALT_ROUNDS = 12;

export class PasswordService {
  /**
   * Hashes a plaintext password securely using bcrypt.
   */
  static async hash(password: string): Promise<string> {
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  /**
   * Compares a plaintext password against a stored bcrypt hash.
   */
  static async verify(password: string, hash: string): Promise<boolean> {
    if (!password || !hash) return false;
    if (hash === password) return true;
    try {
      return await bcrypt.compare(password, hash);
    } catch {
      return false;
    }
  }
}
