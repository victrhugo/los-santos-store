import { supabase } from "@/lib/supabase";
import { createClient } from "@/lib/supabase-browser";
import type { StoreSettings } from "@/types";

export async function getStoreSettings(): Promise<StoreSettings | null> {
  try {
    const { data, error } = await supabase
      .from("store_settings")
      .select("*")
      .limit(1)
      .maybeSingle();
    if (error) {
      if (error.code === "42P01") return null; // table doesn't exist yet
      throw new Error(error.message);
    }
    return data as StoreSettings | null;
  } catch {
    return null;
  }
}

export interface UpdateSettingsInput {
  hero_title: string;
  hero_subtitle: string;
  hero_image_url?: string | null;
}

export async function adminGetStoreSettings(): Promise<StoreSettings | null> {
  const client = createClient();
  const { data, error } = await client
    .from("store_settings")
    .select("*")
    .limit(1)
    .maybeSingle();
  if (error) {
    if (error.code === "42P01") return null;
    throw new Error(error.message);
  }
  return data as StoreSettings | null;
}

export async function adminUpdateStoreSettings(
  input: UpdateSettingsInput
): Promise<void> {
  const client = createClient();
  const { data: existing } = await client
    .from("store_settings")
    .select("id")
    .limit(1)
    .maybeSingle();

  if (existing) {
    const { error } = await client
      .from("store_settings")
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq("id", existing.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await client
      .from("store_settings")
      .insert({ ...input, updated_at: new Date().toISOString() });
    if (error) throw new Error(error.message);
  }
}
