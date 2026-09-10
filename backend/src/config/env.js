import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: (process.env.NODE_ENV || 'development') === 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  jwt: {
    secret: process.env.JWT_SECRET || 'default_jwt_secret_dev_key_orquestando_ia',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  supabase: {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    isConfigured: Boolean(
      process.env.SUPABASE_URL &&
      process.env.SUPABASE_URL.startsWith('http') &&
      !process.env.SUPABASE_URL.includes('your-project') &&
      process.env.SUPABASE_ANON_KEY &&
      !process.env.SUPABASE_ANON_KEY.includes('your-supabase')
    ),
  },
  openRouter: {
    apiKey: process.env.OPENROUTER_API_KEY || '',
    defaultModel: process.env.OPENROUTER_DEFAULT_MODEL || 'nex-agi/nex-n2.5-mini:free',
    fallbackModels: (process.env.OPENROUTER_FALLBACK_MODELS || 'nex-agi/nex-n2.5-pro:free,google/gemma-4-26b-a4b-it:free').split(','),
  }
};
