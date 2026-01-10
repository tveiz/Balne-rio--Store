/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zhuqyenmojtoymnvmfza.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpodXF5ZW5tb2p0b3ltbnZtZnphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5OTE0OTEsImV4cCI6MjA4MzU2NzQ5MX0.2HALniJb3rOfPBYjjRJblsvWJ4MToYYkYc2joj0kPhQ',
  },
}

export default nextConfig
