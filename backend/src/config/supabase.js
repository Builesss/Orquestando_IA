import { createClient } from '@supabase/supabase-js';
import { config } from './env.js';

let supabaseClient = null;

if (config.supabase.isConfigured) {
  try {
    supabaseClient = createClient(
      config.supabase.url,
      config.supabase.serviceRoleKey || config.supabase.anonKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        }
      }
    );
    console.log('✅ Supabase Client conectado exitosamente');
  } catch (error) {
    console.warn('⚠️ Error al inicializar cliente de Supabase:', error.message);
  }
} else {
  console.log('ℹ️ Supabase no está configurado con credenciales activas. Usando almacén de datos seguro en memoria.');
}

export const getSupabase = () => supabaseClient;
export const isSupabaseConfigured = () => Boolean(supabaseClient);
