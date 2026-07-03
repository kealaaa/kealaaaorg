import { NextResponse } from 'next/server'

const PROJECTS = ['CRM & Workflow', 'Research Database']

export async function GET() {
  return NextResponse.json(PROJECTS)
}
