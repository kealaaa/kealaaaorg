import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAdminDiag } from '@/lib/supabase/admin-auth'

export async function GET(req: NextRequest) {
  const diag = await getAdminDiag(req)
  if (!diag.ok) {
    return NextResponse.json({ error: 'Forbidden', diag }, { status: 403 })
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY is not configured on the server.' }, { status: 500 })
  }

  try {
    const admin = createAdminClient()
    const { data, error } = await admin
      .from('user_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const diag = await getAdminDiag(req)
  if (!diag.ok) {
    return NextResponse.json({ error: 'Forbidden', diag }, { status: 403 })
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY is not configured on the server.' }, { status: 500 })
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
