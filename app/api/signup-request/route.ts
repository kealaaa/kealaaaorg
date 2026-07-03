import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const { userId, email, name, projects } = await req.json()

  if (!userId || !email || !projects?.length) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY is not configured on the server.' }, { status: 500 })
  }

  const supabase = createAdminClient()

  // Upsert so resubmission after rejection replaces the old row
  const { error } = await supabase
    .from('user_requests')
    .upsert(
      { user_id: userId, email, name: name || '', projects, status: 'pending' },
      { onConflict: 'user_id' }
    )

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
