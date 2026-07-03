import { NextResponse } from 'next/server'

// Maps internal Supabase project names to display names shown in the
// signup dropdown and stored in user_requests.projects.
// These display names must match the `key` fields in ALL_CARDS on the dashboard.
const PROJECT_MAP: Record<string, string> = {
  KealaHQ: 'CRM & Workflow',
  KealaIQ: 'Research Database',
}

export async function GET() {
  return NextResponse.json(Object.values(PROJECT_MAP))
}
