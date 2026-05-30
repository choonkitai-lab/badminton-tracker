export async function GET() {
  return Response.json({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL
      ? `set (${process.env.NEXT_PUBLIC_SUPABASE_URL.slice(0, 30)}...)`
      : 'MISSING',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ? `set (${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.slice(0, 15)}...)`
      : 'MISSING',
  });
}
