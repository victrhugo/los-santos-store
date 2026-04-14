import { createClient } from "@supabase/supabase-js";

/** Evita falha de build/SSG quando o env ainda não está definido (ex.: CI). Em produção, defina na Vercel. */
const FALLBACK_URL = "https://placeholder.supabase.co";
/** JWT sintaticamente válido só para passar no client; requisições reais exigem a anon key do projeto. */
const FALLBACK_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiJ9.placeholder";

function resolvePublicUrl(): string {
  const u = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  return u && /^https?:\/\//i.test(u) ? u : FALLBACK_URL;
}

function resolveAnonKey(): string {
  const k = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  return k && k.length > 0 ? k : FALLBACK_ANON;
}

export const supabase = createClient(resolvePublicUrl(), resolveAnonKey());

export function isSupabaseConfigured(): boolean {
  const u = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const k = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  return Boolean(u && /^https?:\/\//i.test(u) && k);
}
