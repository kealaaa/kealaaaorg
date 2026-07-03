import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

async function assertAdmin() {
  // Identify the caller via their session cookie
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Verify their role via the service-role client — avoids expired-token issues
  // because the admin client talks directly to Supabase, not through the cookie session
  const admin = createAdminClient()
  const { data: { user: authUser } } = await admin.auth.admin.getUserById(user.id)
  if (authUser?.app_metadata?.role !== 'admin') return null
  return user
}

export async function GET() {
  if (!(await assertAdmin())) {
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
  if (!(await assertAdmin())) {
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
    // Fetch the user_id for this request
    const { data: row, error: fetchErr } = await admin
      .from('user_requests')
      .select('user_id, email')
      .eq('id', id)
      .single()
    if (fetchErr || !row) return NextResponse.json({ error: 'Request not found' }, { status: 404 })

    // Get current app_metadata to decide current role
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
