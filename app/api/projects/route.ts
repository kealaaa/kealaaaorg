import { NextResponse } from 'next/server'

export async function GET() {
  const token = process.env.SUPABASE_ACCESS_TOKEN

  if (!token) {
    return NextResponse.json({ error: 'SUPABASE_ACCESS_TOKEN not set' }, { status: 500 })
  }

  const res = await fetch('https://api.supabase.com/v1/projects', {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 300 }, // cache for 5 minutes
  })

  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to fetch projects from Supabase' }, { status: res.status })
  }

  const projects: { id: string; name: string; status: string }[] = await res.json()

  const EXCLUDED = new Set(['ClientRiskNavigator', 'kealaa', 'keala'])

  const DISPLAY_NAMES: Record<string, string> = {
    KealaHQ: 'CRM & Workflow',
    KealaIQ: 'Research Database',
  }

  const names = projects
    .filter(p => p.status !== 'REMOVED' && !EXCLUDED.has(p.name))
    .map(p => DISPLAY_NAMES[p.name] ?? p.name)
    .sort()

  return NextResponse.json(names)
}
