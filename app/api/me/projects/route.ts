import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // RLS policy "Users can view own request" allows this without the admin client
  const { data, error } = await supabase
    .from('user_requests')
    .select('projects, granted_projects, status')
    .eq('user_id', user.id)
    .single()

  if (error || !data || data.status !== 'approved') {
    return NextResponse.json({ projects: [] })
  }

  // granted_projects lets an admin approve access to only some of the
  // requested projects; null means the row predates that column, so fall
  // back to the full request.
  const granted = data.granted_projects ?? data.projects
  return NextResponse.json({ projects: granted as string[] })
}
