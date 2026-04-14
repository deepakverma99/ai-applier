import { cleanEnv, str, port } from 'envalid';
import dotenv from 'dotenv';

dotenv.config();

export const env = cleanEnv(process.env, {
  SUPABASE_URL: str({ desc: 'Supabase Project URL' }),
  SUPABASE_SERVICE_ROLE_KEY: str({ desc: 'Supabase Service Role Key' }),
  REDIS_URL: str({ default: 'redis://localhost:6379' }),
  OPENAI_API_KEY: str(),
  PORT: port({ default: 3001 }),
  NODE_ENV: str({ choices: ['development', 'test', 'production', 'staging'], default: 'development' }),
});

export const validateEnv = () => {
  // envalid handles validation on export
  return env;
};
