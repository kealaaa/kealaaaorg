import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Validate the caller by their Bearer token (sent explicitly by the client).
// Uses the anon key (guaranteed present in all environments as NEXT_PUBLIC_)
// so token validation never fails due to a missing service-role key.
export async function getAdminDiag(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) return { ok: false, reason: 'no_bearer' }

  const token = auth.slice(7)
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    const { data, error } = await supabase.auth.getUser(token)
    const user = data?.user
    if (error) return { ok: false, reason: 'getUser_error', detail: error.message }
    if (!user) return { ok: false, reason: 'no_user' }
    return {
      ok: user.app_metadata?.role === 'admin',
      reason: 'role_check',
      role: user.app_metadata?.role ?? null,
      app_metadata: user.app_metadata,
      user_id: user.id,
    }
  } catch (e) {
    return { ok: false, reason: 'exception', detail: String(e) }
  }
}
