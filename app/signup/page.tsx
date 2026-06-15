'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Check, ChevronDown } from 'lucide-react'

const PROJECTS = ['Project 1', 'Project 2', 'Project 3']

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail]             = useState('')
  const [password, setPassword]       = useState('')
  const [confirm, setConfirm]         = useState('')
  const [selectedProjects, setSelectedProjects] = useState<string[]>([])
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [error, setError]             = useState('')
  const [message, setMessage]         = useState('')
  const [loading, setLoading]         = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function toggleProject(name: string) {
    setSelectedProjects(prev =>
      prev.includes(name) ? prev.filter(p => p !== name) : [...prev, name]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setMessage('')

    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (selectedProjects.length === 0) {
      setError('Please select at least one project.')
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { data, error: signUpError } = await supabase.auth.signUp({ email, password })

    setLoading(false)

    if (signUpError) {
      setError(signUpError.message)
      return
    }

    if (data.session) {
      router.push('/dashboard')
      router.refresh()
      return
    }

    setMessage('Account created! Check your email to confirm, then sign in.')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 1rem' }}>
      <div style={{ width: '100%', maxWidth: 380 }}>

        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2.5rem' }}>
          <Image
            src="/KealaLogo.png"
            alt="Keala Advisors"
            width={120}
            height={44}
            style={{ objectFit: 'contain', borderRadius: 4 }}
          />
        </div>

        {/* Card */}
        <div style={{
          background: '#1a2332',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 10,
          padding: '2rem',
          boxShadow: '0 0 0 1px rgba(0,0,0,0.5), 0 8px 32px rgba(0,0,0,0.5)',
        }}>
          <h1 style={{ fontSize: '1rem', fontWeight: 600, color: '#dcdad5', marginBottom: '0.25rem' }}>
            Create account
          </h1>
          <p style={{ fontSize: '0.8rem', color: '#7a7872', marginBottom: '1.75rem' }}>
            Request access to the internal portal
          </p>

          {message ? (
            <p style={{
              fontSize: '0.78rem',
              color: '#6fcf97',
              background: 'rgba(111,207,151,0.08)',
              border: '1px solid rgba(111,207,151,0.2)',
              borderRadius: 6,
              padding: '0.5rem 0.75rem',
            }}>
              {message}
            </p>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@keala.io"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Min. 8 characters"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Confirm password</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  placeholder="••••••••"
                  style={inputStyle}
                />
              </div>

              {/* Project selection */}
              <div ref={dropdownRef} style={{ position: 'relative' }}>
                <label style={{ ...labelStyle, marginBottom: '0.5rem' }}>
                  Select project(s)
                </label>
                <button
                  type="button"
                  onClick={() => setDropdownOpen(o => !o)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.6rem 0.8rem',
                    borderRadius: 6,
                    border: dropdownOpen
                      ? '1px solid rgba(87,94,207,0.5)'
                      : '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.04)',
                    color: selectedProjects.length ? '#c5c1b9' : '#55524e',
                    fontSize: '0.875rem',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    cursor: 'pointer',
                    textAlign: 'left',
                    boxSizing: 'border-box',
                  }}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {selectedProjects.length === 0
                      ? 'Choose project(s)…'
                      : selectedProjects.join(', ')}
                  </span>
                  <ChevronDown
                    size={14}
                    color="#7a7872"
                    style={{
                      flexShrink: 0,
                      marginLeft: '0.5rem',
                      transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s',
                    }}
                  />
                </button>

                {dropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 4px)',
                    left: 0,
                    right: 0,
                    background: '#1e2d3f',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 6,
                    overflow: 'hidden',
                    zIndex: 50,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                  }}>
                    {PROJECTS.map((project, i) => {
                      const active = selectedProjects.includes(project)
                      return (
                        <button
                          key={project}
                          type="button"
                          onClick={() => toggleProject(project)}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.6rem 0.8rem',
                            border: 'none',
                            borderTop: i > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                            background: active ? 'rgba(87,94,207,0.12)' : 'transparent',
                            color: active ? '#a5a8f0' : '#c5c1b9',
                            fontSize: '0.85rem',
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'background 0.12s',
                          }}
                          onMouseEnter={e => {
                            if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = active ? 'rgba(87,94,207,0.12)' : 'transparent'
                          }}
                        >
                          <span>{project}</span>
                          {active && <Check size={13} color="#7c86e8" />}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {error && (
                <p style={{ fontSize: '0.78rem', color: '#e05252', marginTop: '-0.1rem' }}>{error}</p>
              )}

              <button type="submit" disabled={loading} style={buttonStyle(loading)}>
                {loading ? 'Creating account…' : 'Create account'}
              </button>
            </form>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.78rem', color: '#7a7872' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#575ECF', textDecoration: 'none', fontWeight: 500 }}>
            Sign in
          </Link>
        </p>

      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.72rem',
  color: '#9a9790',
  marginBottom: '0.4rem',
  letterSpacing: '0.03em',
  fontWeight: 500,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 6,
  padding: '0.6rem 0.8rem',
  color: '#c5c1b9',
  fontSize: '0.875rem',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  outline: 'none',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box',
}

const buttonStyle = (loading: boolean): React.CSSProperties => ({
  width: '100%',
  background: loading ? 'rgba(87,94,207,0.4)' : '#575ECF',
  color: loading ? 'rgba(255,255,255,0.4)' : '#ffffff',
  border: 'none',
  borderRadius: 6,
  padding: '0.65rem',
  fontSize: '0.875rem',
  fontWeight: 500,
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  cursor: loading ? 'not-allowed' : 'pointer',
  marginTop: '0.15rem',
  transition: 'background 0.2s',
  letterSpacing: '0.01em',
})
