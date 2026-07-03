'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Check, ChevronDown, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [projects, setProjects] = useState<string[]>([])
  const [projectsLoading, setProjectsLoading] = useState(true)
  const [selectedProjects, setSelectedProjects] = useState<string[]>([])
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/projects')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setProjects(data) })
      .finally(() => setProjectsLoading(false))
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function toggleProject(proj: string) {
    setSelectedProjects(prev =>
      prev.includes(proj) ? prev.filter(p => p !== proj) : [...prev, proj]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setMessage('')

    if (password !== confirm) { setError('Passwords do not match.'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (selectedProjects.length === 0) { setError('Please select at least one project.'); return }

    setLoading(true)
    const supabase = createClient()

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: { username: name || email.split('@')[0] },
      },
    })

    if (signUpError) {
      setLoading(false)
      setError(signUpError.message)
      return
    }

    const userId = data.user?.id
    if (userId) {
      const res = await fetch('/api/signup-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, email, name, projects: selectedProjects }),
      })
      if (!res.ok) {
        const body = await res.json()
        setLoading(false)
        setError(body.error || 'Failed to submit request.')
        return
      }
    }

    setLoading(false)

    if (data.session) {
      router.push('/pending')
      return
    }

    setMessage('Account created! Check your email to confirm, then sign in — your request will be reviewed by an admin.')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Branding panel — hidden on mobile */}
      <div className="auth-panel">
        <div className="auth-panel-grid" />
        <div className="auth-panel-glow" />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <Image
            src="/KealaLogo.png"
            alt="Keala Advisors"
            width={110}
            height={40}
            style={{ objectFit: 'contain' }}
          />
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{
            fontSize: '1.65rem',
            fontWeight: 700,
            color: '#e8e6e1',
            lineHeight: 1.3,
            letterSpacing: '-0.02em',
            marginBottom: '0.85rem',
          }}>
            Join the Keala<br />advisor network
          </p>
          <p style={{ fontSize: '0.875rem', color: '#4b5563', lineHeight: 1.7 }}>
            Request access to the portal and start managing your clients and financial plans.
          </p>
        </div>

        <p style={{ position: 'relative', zIndex: 1, fontSize: '0.7rem', color: '#2d3748', letterSpacing: '0.04em' }}>
          © {new Date().getFullYear()} Keala Advisors. All rights reserved.
        </p>
      </div>

      {/* Form panel */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem 1.5rem',
      }}>
        <div style={{ width: '100%', maxWidth: 400 }}>

          {/* Mobile-only logo */}
          <div className="auth-mobile-logo">
            <Image
              src="/KealaLogo.png"
              alt="Keala Advisors"
              width={110}
              height={40}
              style={{ objectFit: 'contain' }}
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{
              fontSize: '1.6rem',
              fontWeight: 700,
              color: '#f0eeea',
              letterSpacing: '-0.02em',
              marginBottom: '0.35rem',
            }}>
              Create an account
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Request access to the internal portal
            </p>
          </div>

          {message ? (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
              fontSize: '0.85rem', color: '#6fcf97',
              background: 'rgba(111,207,151,0.08)',
              border: '1px solid rgba(111,207,151,0.2)',
              borderRadius: 10, padding: '1rem 1.1rem',
            }}>
              <span style={{ flexShrink: 0, marginTop: 1 }}>✓</span>
              <span>{message}</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

              <div>
                <label style={labelStyle}>Full name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Smith"
                  style={inputStyle}
                  className="auth-input"
                />
              </div>

              <div>
                <label style={labelStyle}>Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@keala.io"
                  style={inputStyle}
                  className="auth-input"
                />
              </div>

              <div>
                <label style={labelStyle}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Min. 8 characters"
                    style={{ ...inputStyle, paddingRight: '2.8rem' }}
                    className="auth-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(s => !s)}
                    tabIndex={-1}
                    style={eyeBtn}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Confirm password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    placeholder="••••••••"
                    style={{ ...inputStyle, paddingRight: '2.8rem' }}
                    className="auth-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(s => !s)}
                    tabIndex={-1}
                    style={eyeBtn}
                  >
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Project selector */}
              <div ref={dropdownRef} style={{ position: 'relative' }}>
                <label style={labelStyle}>Select project(s)</label>
                <button
                  type="button"
                  onClick={() => !projectsLoading && setDropdownOpen(o => !o)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.72rem 0.9rem',
                    borderRadius: 8,
                    border: dropdownOpen
                      ? '1px solid rgba(87,94,207,0.55)'
                      : '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.04)',
                    color: selectedProjects.length ? '#e5e3df' : '#4b5563',
                    fontSize: '0.9rem',
                    fontFamily: 'var(--font-body)',
                    cursor: projectsLoading ? 'not-allowed' : 'pointer',
                    textAlign: 'left',
                    boxSizing: 'border-box',
                    opacity: projectsLoading ? 0.6 : 1,
                    boxShadow: dropdownOpen ? '0 0 0 3px rgba(87,94,207,0.12)' : 'none',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                  }}
                >
                  <span style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {projectsLoading && (
                      <Loader2 size={13} color="#7a7872" style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }} />
                    )}
                    {projectsLoading
                      ? 'Loading projects…'
                      : selectedProjects.length === 0
                        ? 'Choose project(s)…'
                        : selectedProjects.join(', ')}
                  </span>
                  {!projectsLoading && (
                    <ChevronDown
                      size={14}
                      color="#6b7280"
                      style={{
                        flexShrink: 0,
                        marginLeft: '0.5rem',
                        transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s',
                      }}
                    />
                  )}
                </button>

                {dropdownOpen && projects.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 5px)',
                    left: 0, right: 0,
                    background: '#161f2e',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8,
                    overflow: 'hidden',
                    zIndex: 50,
                    boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
                    maxHeight: 220,
                    overflowY: 'auto',
                  }}>
                    {projects.map((project, i) => {
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
                            padding: '0.65rem 0.9rem',
                            border: 'none',
                            borderTop: i > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                            background: active ? 'rgba(87,94,207,0.14)' : 'transparent',
                            color: active ? '#a5a8f0' : '#d1cfc9',
                            fontSize: '0.875rem',
                            fontFamily: 'var(--font-body)',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'background 0.1s',
                          }}
                          onMouseEnter={e => {
                            if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = active ? 'rgba(87,94,207,0.14)' : 'transparent'
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
                <div style={{
                  display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
                  fontSize: '0.8rem', color: '#f87171',
                  background: 'rgba(248,113,113,0.08)',
                  border: '1px solid rgba(248,113,113,0.2)',
                  borderRadius: 8, padding: '0.75rem 1rem',
                }}>
                  <span style={{ flexShrink: 0, marginTop: 1 }}>⚠</span>
                  <span>{error}</span>
                </div>
              )}

              <button type="submit" disabled={loading} style={btnStyle(loading)} className="auth-btn">
                {loading && <Spinner />}
                {loading ? 'Submitting request…' : 'Request access'}
              </button>
            </form>
          )}

          <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.8rem', color: '#6b7280' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#575ECF', textDecoration: 'none', fontWeight: 600 }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

function Spinner() {
  return (
    <span style={{
      display: 'inline-block',
      width: 13, height: 13,
      border: '2px solid rgba(255,255,255,0.25)',
      borderTopColor: '#fff',
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
      marginRight: '0.5rem',
      flexShrink: 0,
    }} />
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.78rem',
  color: '#9ca3af',
  marginBottom: '0.4rem',
  fontWeight: 500,
  letterSpacing: '0.01em',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8,
  padding: '0.72rem 0.9rem',
  color: '#e5e3df',
  fontSize: '0.9rem',
  fontFamily: 'var(--font-body)',
  outline: 'none',
  transition: 'border-color 0.15s, box-shadow 0.15s',
  boxSizing: 'border-box',
}

const eyeBtn: React.CSSProperties = {
  position: 'absolute', right: '0.8rem', top: '50%',
  transform: 'translateY(-50%)',
  background: 'none', border: 'none', cursor: 'pointer',
  color: '#6b7280', display: 'flex', alignItems: 'center', padding: 0,
}

const btnStyle = (loading: boolean): React.CSSProperties => ({
  width: '100%',
  background: loading ? 'rgba(87,94,207,0.5)' : '#575ECF',
  color: loading ? 'rgba(255,255,255,0.45)' : '#fff',
  border: 'none',
  borderRadius: 8,
  padding: '0.78rem',
  fontSize: '0.9rem',
  fontWeight: 600,
  fontFamily: 'var(--font-body)',
  cursor: loading ? 'not-allowed' : 'pointer',
  transition: 'background 0.15s, box-shadow 0.15s',
  letterSpacing: '0.01em',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
})
