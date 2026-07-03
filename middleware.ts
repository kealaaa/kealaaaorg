import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Redirect unauthenticated users away from protected pages
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user) {
    const isAdmin = user.app_metadata?.role === 'admin'
    const isDashboard = request.nextUrl.pathname.startsWith('/dashboard')
    const isAdminRoute = request.nextUrl.pathname.startsWith('/dashboard/admin')
    const isPending = request.nextUrl.pathname === '/pending'

    // Block non-admins from /dashboard/admin
    if (isAdminRoute && !isAdmin) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Non-admins accessing the dashboard must be approved
    if (isDashboard && !isAdmin) {
      const { data } = await supabase
        .from('user_requests')
        .select('status')
        .eq('user_id', user.id)
        .single()

      const status = data?.status
      if (status !== 'approved') {
        return NextResponse.redirect(new URL('/pending', request.url))
      }
    }

    // Approved users (or admins) shouldn't stay on /pending
    if (isPending && isAdmin) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    if (isPending && !isAdmin) {
      const { data } = await supabase
        .from('user_requests')
        .select('status')
        .eq('user_id', user.id)
        .single()
      if (data?.status === 'approved') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }

    // Redirect authenticated users away from login/signup
    if (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup') {
      if (isAdmin) return NextResponse.redirect(new URL('/dashboard', request.url))
      const { data } = await supabase
        .from('user_requests')
        .select('status')
        .eq('user_id', user.id)
        .single()
      const dest = data?.status === 'approved' ? '/dashboard' : '/pending'
      return NextResponse.redirect(new URL(dest, request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup', '/pending'],
}
