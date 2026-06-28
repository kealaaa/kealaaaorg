'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Clock, XCircle } from 'lucide-react'

export default function PendingPage() {
  const [status, setStatus] = useState<'pending' | 'rejected' | 'loading'>('loading')
  const [projects, setProjects] = useState<string[]>([])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const { data } = await supabase
        .from('user_requests')
        .select('status, projects')
        .eq('user_id', user.id)
        .single()
      if (data) {
        setStatus(data.status === 'rejected' ? 'rejected' : 'pending')
        setProjects(data.projects ?? [])
      }
    })
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const isRejected = status === 'rejected'

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '0 1rem',
    }}>
      <div style={{ width: '100%', maxWidth: 420, textAlign: 'center' }}>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2.5rem' }}>
          <Image src="/KealaLogo.png" alt="Keala Advisors" width={120} height={44} style={{ objectFit: 'contain', borderRadius: 4 }} />
        </div>

        <div style={{
          background: '#1a2332',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 10,
          padding: '2.5rem 2rem',
          boxShadow: '0 0 0 1px rgba(0,0,0,0.5), 0 8px 32px rgba(0,0,0,0.5)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
            {isRejected
              ? <XCircle size={40} color="#e05252" />
              : <Clock size={40} color="#d97706" />}
          </div>

          <h1 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#dcdad5', marginBottom: '0.5rem' }}>
            {isRejected ? 'Access Denied' : 'Request Pending'}
          </h1>

          <p style={{ fontSize: '0.82rem', color: '#7a7872', lineHeight: 1.7, marginBottom: '1.5rem' }}>
            {isRejected
              ? 'Your access request has been rejected. Please contact your administrator for more information.'
              : 'Your request to access the portal is awaiting admin approval. You\'ll be able to sign in once your account is approved.'}
          </p>

          {projects.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.72rem', color: '#9a9790', marginBottom: '0.5rem', letterSpacing: '0.03em' }}>
                REQUESTED PROJECTS
              </p>
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                {projects.map(p => (
                  <span key={p} style={{
                    fontSize: '0.72rem', color: '#c5c1b9',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 99, padding: '0.15rem 0.55rem',
                  }}>
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleSignOut}
            style={{
              width: '100%', background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6,
              padding: '0.65rem', fontSize: '0.875rem', fontWeight: 500,
              color: '#c5c1b9', cursor: 'pointer',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          >
            Sign out
          </button>
        </div>

        {isRejected && (
          <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.78rem', color: '#7a7872' }}>
            Want to try again?{' '}
            <Link href="/signup" style={{ color: '#575ECF', textDecoration: 'none', fontWeight: 500 }}>
              Submit a new request
            </Link>
          </p>
        )}

      </div>
    </div>
  )
}
