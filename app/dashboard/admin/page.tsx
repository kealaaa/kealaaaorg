'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ShieldCheck, UserCheck, Clock, CheckCircle2, XCircle, RefreshCw } from 'lucide-react'

type RequestStatus = 'pending' | 'approved' | 'rejected'

interface UserRequest {
  id: string
  user_id: string
  name: string
  email: string
  projects: string[]
  created_at: string
  status: RequestStatus
  isAdmin: boolean
}

export default function AdminPage() {
  const [ready, setReady]       = useState(false)
  const [requests, setRequests] = useState<UserRequest[]>([])
  const [loading, setLoading]   = useState(true)
  const [fetchError, setFetchError] = useState('')
  const router = useRouter()

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    setFetchError('')
    try {
      const res = await fetch('/api/admin/requests')
      if (res.ok) {
        const data = await res.json()
        setRequests(data.map((r: Omit<UserRequest, 'isAdmin'> & { is_admin?: boolean }) => ({
          ...r,
          isAdmin: r.is_admin ?? false,
        })))
      } else {
        const body = await res.json().catch(() => ({}))
        setFetchError(body.error || `Failed to load requests (${res.status})`)
      }
    } catch {
      setFetchError('Network error — could not reach the server.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.app_metadata?.role !== 'admin') {
        router.replace('/dashboard')
      } else {
        setReady(true)
        fetchRequests()
      }
    })
  }, [router, fetchRequests])

  async function updateStatus(id: string, status: RequestStatus) {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r))
    await fetch('/api/admin/requests', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
  }

  async function toggleAdmin(id: string) {
    const res = await fetch('/api/admin/requests', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, toggleAdmin: true }),
    })
    if (res.ok) {
      const body = await res.json()
      const newIsAdmin = body.role === 'admin'
      setRequests(prev => prev.map(r => r.id === id ? { ...r, isAdmin: newIsAdmin } : r))
    }
  }

  if (!ready) return null

  const pending  = requests.filter(r => r.status === 'pending')
  const resolved = requests.filter(r => r.status !== 'pending')

  return (
    <div style={{ padding: '2.5rem 2rem', maxWidth: 1100 }}>

      <div style={{ marginBottom: '2.5rem' }}>
        <p style={{
          fontSize: '0.75rem', color: '#9ca3af', letterSpacing: '0.08em',
          textTransform: 'uppercase', marginBottom: '0.4rem',
        }}>
          Restricted
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ShieldCheck size={22} color="#7c3aed" />
            <h1 style={{ fontSize: '1.6rem', fontWeight: 600, color: '#111827', lineHeight: 1.2 }}>
              Admin Panel
            </h1>
          </div>
          <button
            onClick={fetchRequests}
            disabled={loading}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
              fontSize: '0.75rem', fontWeight: 500, color: '#6b7280',
              background: '#f9fafb', border: '1px solid #e5e7eb',
              borderRadius: 6, padding: '0.35rem 0.7rem', cursor: 'pointer',
            }}
          >
            <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            Refresh
          </button>
        </div>
      </div>

      {fetchError && (
        <div style={{
          marginBottom: '1.5rem',
          padding: '0.75rem 1rem',
          background: 'rgba(220,38,38,0.06)',
          border: '1px solid rgba(220,38,38,0.2)',
          borderRadius: 8,
          fontSize: '0.82rem',
          color: '#dc2626',
        }}>
          {fetchError}
        </div>
      )}

      <Section title="Pending Requests" count={pending.length}>
        {pending.length === 0 ? (
          <EmptyState text="No pending requests." />
        ) : (
          pending.map(req => (
            <RequestRow
              key={req.id}
              req={req}
              onApprove={() => updateStatus(req.id, 'approved')}
              onReject={() => updateStatus(req.id, 'rejected')}
              onToggleAdmin={() => toggleAdmin(req.id)}
            />
          ))
        )}
      </Section>

      <Section title="Resolved" count={resolved.length} style={{ marginTop: '2rem' }}>
        {resolved.length === 0 ? (
          <EmptyState text="Nothing resolved yet." />
        ) : (
          resolved.map(req => (
            <RequestRow
              key={req.id}
              req={req}
              onApprove={() => updateStatus(req.id, 'approved')}
              onReject={() => updateStatus(req.id, 'rejected')}
              onToggleAdmin={() => toggleAdmin(req.id)}
            />
          ))
        )}
      </Section>

    </div>
  )
}

function Section({
  title, count, children, style,
}: {
  title: string
  count: number
  children: React.ReactNode
  style?: React.CSSProperties
}) {
  return (
    <div style={style}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.9rem' }}>
        <h2 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>{title}</h2>
        <span style={{
          fontSize: '0.7rem', fontWeight: 600, color: '#6b7280',
          background: '#f3f4f6', border: '1px solid #e5e7eb',
          borderRadius: 99, padding: '0.1rem 0.5rem',
        }}>
          {count}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {children}
      </div>
    </div>
  )
}

function RequestRow({
  req, onApprove, onReject, onToggleAdmin,
}: {
  req: UserRequest
  onApprove: () => void
  onReject: () => void
  onToggleAdmin: () => void
}) {
  const displayName = req.name || req.email.split('@')[0]
  const dateLabel = new Date(req.created_at).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  })

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: 10,
      padding: '1rem 1.25rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      flexWrap: 'wrap',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    }}>

      <div style={{
        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
        background: avatarColor(displayName),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.8rem', fontWeight: 700, color: '#fff',
      }}>
        {initials(displayName)}
      </div>

      <div style={{ flex: 1, minWidth: 160 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827' }}>{displayName}</span>
          {req.isAdmin && (
            <span style={{
              fontSize: '0.65rem', fontWeight: 600, color: '#7c3aed',
              background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)',
              borderRadius: 99, padding: '0.1rem 0.45rem', letterSpacing: '0.03em',
            }}>
              ADMIN
            </span>
          )}
        </div>
        <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.1rem' }}>{req.email}</p>
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
          {req.projects.map(p => (
            <span key={p} style={{
              fontSize: '0.68rem', color: '#4b5563',
              background: '#f3f4f6', border: '1px solid #e5e7eb',
              borderRadius: 99, padding: '0.1rem 0.5rem',
            }}>
              {p}
            </span>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
        <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{dateLabel}</span>
        <StatusBadge status={req.status} />
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0, flexWrap: 'wrap' }}>
        {req.status === 'pending' && (
          <>
            <ActionButton label="Approve" icon={<CheckCircle2 size={13} />} color="#059669" bg="rgba(5,150,105,0.08)" border="rgba(5,150,105,0.25)" onClick={onApprove} />
            <ActionButton label="Reject"  icon={<XCircle size={13} />}       color="#dc2626" bg="rgba(220,38,38,0.06)"  border="rgba(220,38,38,0.2)"  onClick={onReject} />
          </>
        )}
        {req.status === 'rejected' && (
          <ActionButton label="Approve" icon={<CheckCircle2 size={13} />} color="#059669" bg="rgba(5,150,105,0.08)" border="rgba(5,150,105,0.25)" onClick={onApprove} />
        )}
        <ActionButton
          label={req.isAdmin ? 'Revoke Admin' : 'Make Admin'}
          icon={<UserCheck size={13} />}
          color={req.isAdmin ? '#7c3aed' : '#4b5563'}
          bg={req.isAdmin ? 'rgba(124,58,237,0.08)' : '#f9fafb'}
          border={req.isAdmin ? 'rgba(124,58,237,0.25)' : '#e5e7eb'}
          onClick={onToggleAdmin}
        />
      </div>

    </div>
  )
}

function StatusBadge({ status }: { status: RequestStatus }) {
  const map: Record<RequestStatus, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
    pending:  { label: 'Pending',  color: '#b45309', bg: 'rgba(217,119,6,0.08)',  border: 'rgba(217,119,6,0.25)',  icon: <Clock size={11} /> },
    approved: { label: 'Approved', color: '#059669', bg: 'rgba(5,150,105,0.08)', border: 'rgba(5,150,105,0.25)', icon: <CheckCircle2 size={11} /> },
    rejected: { label: 'Rejected', color: '#dc2626', bg: 'rgba(220,38,38,0.08)', border: 'rgba(220,38,38,0.2)',  icon: <XCircle size={11} /> },
  }
  const s = map[status]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      fontSize: '0.68rem', fontWeight: 600, color: s.color,
      background: s.bg, border: `1px solid ${s.border}`,
      borderRadius: 99, padding: '0.15rem 0.55rem', letterSpacing: '0.02em',
    }}>
      {s.icon}{s.label}
    </span>
  )
}

function ActionButton({ label, icon, color, bg, border, onClick }: {
  label: string; icon: React.ReactNode; color: string; bg: string; border: string; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
        fontSize: '0.75rem', fontWeight: 500, color,
        background: bg, border: `1px solid ${border}`,
        borderRadius: 6, padding: '0.35rem 0.7rem',
        cursor: 'pointer', transition: 'opacity 0.15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
      onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
    >
      {icon}{label}
    </button>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div style={{
      background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 10,
      padding: '1.5rem', textAlign: 'center',
    }}>
      <p style={{ fontSize: '0.82rem', color: '#9ca3af' }}>{text}</p>
    </div>
  )
}

function initials(name: string) {
  return name.split(/[\s@]/).map(n => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
}

const AVATAR_COLORS = ['#7c3aed', '#2563eb', '#059669', '#d97706', '#dc2626']
function avatarColor(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % AVATAR_COLORS.length
  return AVATAR_COLORS[Math.abs(h)]
}
