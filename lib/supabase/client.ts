import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  // Fallback para as variáveis específicas do projeto
  const url = supabaseUrl || (typeof window !== "undefined" ? (window as any).__NEXT_PUBLIC_SUPABASE_URL__ : "")
  const key = supabaseKey || (typeof window !== "undefined" ? (window as any).__NEXT_PUBLIC_SUPABASE_ANON_KEY__ : "")

  return createBrowserClient(url, key)
}
