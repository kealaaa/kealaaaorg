import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAdminDiag } from '@/lib/supabase/admin-auth'

export async function POST(req: NextRequest) {
  const diag = await getAdminDiag(req)
  if (!diag.ok) {
    return NextResponse.json({ error: 'Forbidden', diag }, { status: 403 })
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY is not configured on the server.' }, { status: 500 })
  }

  const { email, name, projects, isAdmin } = await req.json() as {
    email?: string
    name?: string
    projects?: string[]
    isAdmin?: boolean
  }

  if (!email || !projects?.length) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const admin = createAdminClient()
  const origin = req.nextUrl.origin

  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${origin}/reset-password`,
    data: { username: name || email.split('@')[0] },
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  const invitedUser = data.user
  if (isAdmin) {
    const { error: roleErr } = await admin.auth.admin.updateUserById(invitedUser.id, {
      app_metadata: { ...invitedUser.app_metadata, role: 'admin' },
    })
    if (roleErr) return NextResponse.json({ error: roleErr.message }, { status: 500 })
  }

  const { error: insertErr } = await admin
    .from('user_requests')
    .upsert(
      { user_id: invitedUser.id, email, name: name || '', projects, status: 'approved' },
      { onConflict: 'user_id' }
    )
  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
