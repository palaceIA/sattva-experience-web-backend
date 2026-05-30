import 'dotenv/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);

export const supabase: SupabaseClient | null = isSupabaseConfigured
    ? createClient(SUPABASE_URL as string, SUPABASE_SERVICE_ROLE_KEY as string, {
          auth: {
              persistSession: false,
              detectSessionInUrl: false
          }
      })
    : null;

export async function ensureBucket(bucket: string) {
    if (!isSupabaseConfigured || !supabase) {
        return null;
    }

    try {
        const { data, error } = await supabase.storage.createBucket(bucket, { public: true });
        if (error) {
            const message = String(error.message || error);
            if (
                message.includes('already exists') ||
                message.includes('row-level security') ||
                message.includes('RLS') ||
                message.includes('Policy')
            ) {
                console.warn(`Supabase bucket initialization ignorada: ${message}`);
                return null;
            }
            throw error;
        }
        return data;
    } catch (error: any) {
        const message = String(error.message || error);
        if (message.includes('row-level security') || message.includes('RLS')) {
            console.warn(`Supabase bucket initialization ignorada: ${message}`);
            return null;
        }
        throw error;
    }
}
