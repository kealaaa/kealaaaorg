import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@supabase/supabase-js'

// Validate the caller by their Bearer token (sent explicitly by the client).
// Uses the anon key (guaranteed present in all environments as NEXT_PUBLIC_)
// so token validation never fails due to a missing service-role key.
async function assertAdmin(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization')
    if (!auth?.startsWith('Bearer ')) return null

    const token = auth.slice(7)

    // Validate the token with the anon client — works in every environment
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    const { data, error } = await supabase.auth.getUser(token)
    const user = data?.user
    if (error || !user) return null
    if (user.app_metadata?.role !== 'admin') return null
    return user
  } catch {
    return null
  }
}

export async function GET(req: NextRequest) {
  if (!(await assertAdmin(req))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('user_requests')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest) {
  if (!(await assertAdmin(req))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { id, status, toggleAdmin } = body as {
    id: string
    status?: 'approved' | 'rejected' | 'pending'
    toggleAdmin?: boolean
  }

  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const admin = createAdminClient()

  if (status) {
    const { error } = await admin
      .from('user_requests')
      .update({ status })
      .eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (toggleAdmin !== undefined) {
    const { data: row, error: fetchErr } = await admin
      .from('user_requests')
      .select('user_id, email')
      .eq('id', id)
      .single()
    if (fetchErr || !row) return NextResponse.json({ error: 'Request not found' }, { status: 404 })

    const { data: { user: authUser }, error: authErr } = await admin.auth.admin.getUserById(row.user_id)
    if (authErr || !authUser) return NextResponse.json({ error: 'Auth user not found' }, { status: 404 })

    const currentRole = authUser.app_metadata?.role
    const newRole = currentRole === 'admin' ? null : 'admin'

    const { error: updateErr } = await admin.auth.admin.updateUserById(row.user_id, {
      app_metadata: { ...authUser.app_metadata, role: newRole },
    })
    if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 })

    return NextResponse.json({ ok: true, role: newRole })
  }

  return NextResponse.json({ ok: true })
}
