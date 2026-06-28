import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('user_requests')
    .select('projects, status')
    .eq('user_id', user.id)
    .single()

  if (error || !data) {
    return NextResponse.json({ projects: [] })
  }

  if (data.status !== 'approved') {
    return NextResponse.json({ projects: [] })
  }

  return NextResponse.json({ projects: data.projects as string[] })
}
