import { z } from 'zod';

const ConfigSchema = z.object({
  env: z.enum(['development', 'production', 'test']),
  port: z.number().int().positive(),
  databaseUrl: z.string().optional(),
  jwtSecret: z.string().min(16),
  encryptionKey: z.string().optional(),
  appUrl: z.string().optional(),
});

type Config = z.infer<typeof ConfigSchema>;

function validateEnv(): Config {
  const env = (process.env.NODE_ENV || 'development') as string;

  const raw = {
    env,
    port: parseInt(process.env.PORT || '3000', 10),
    databaseUrl: process.env.DATABASE_URL || 'd1://email-automation-db',
    jwtSecret: process.env.JWT_SECRET || 'vorynex-secure-jwt-auth-edge-secret-key-32chars',
    encryptionKey: process.env.ENCRYPTION_KEY || 'default-encryption-key-for-auth',
    appUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://email-automation.pages.dev',
  };

  return ConfigSchema.parse(raw);
}

export const config = validateEnv();
