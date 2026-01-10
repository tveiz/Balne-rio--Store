import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function initializeDatabase() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  try {
    // Check if tables exist
    const { data: tables, error: checkError } = await supabase.from("users").select("id").limit(1)

    if (checkError && checkError.message.includes("does not exist")) {
      console.log("[v0] Database not initialized. Please run the SQL script.")
      return { success: false, message: "Database not initialized" }
    }

    return { success: true, message: "Database is ready" }
  } catch (error) {
    console.error("[v0] Database check error:", error)
    return { success: false, message: "Database check failed" }
  }
}
