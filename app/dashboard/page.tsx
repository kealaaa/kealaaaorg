'use client'

import { ArrowUpRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const ALL_CARDS = [
  {
    key: 'CRM & Workflow',
    href: 'https://ops.keala.io',
    title: 'CRM & Workflow',
    description: 'Manage contacts, deals, tasks, and operational workflows.',
    tag: 'ops.keala.io',
  },
  {
    key: 'Research Database',
    href: 'https://research.keala.io',
    title: 'Research Database',
    description: 'Investment research, analysis, and data repository.',
    tag: 'research.keala.io',
  },
  {
    key: 'Questionnaire',
    href: 'https://questionnaire.keala.io',
    title: 'Questionnaire',
    description: 'Client onboarding and risk profiling questionnaires.',
    tag: 'questionnaire.keala.io',
  },
]

export default function DashboardPage() {
  const [name, setName] = useState('there')
  const [approvedCards, setApprovedCards] = useState(ALL_CARDS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const display = user.user_metadata?.username || user.email?.split('@')[0] || 'there'
        setName(display)

        // Admins see everything
        if (user.app_metadata?.role === 'admin') {
          setLoading(false)
          return
        }
      }

      // Fetch approved projects for this user
      fetch('/api/me/projects')
        .then(r => r.json())
        .then(({ projects }: { projects: string[] }) => {
          if (Array.isArray(projects) && projects.length > 0) {
            setApprovedCards(ALL_CARDS.filter(c => projects.includes(c.key)))
          } else {
            setApprovedCards([])
          }
        })
        .finally(() => setLoading(false))
    })
  }, [])

  return (
    <div className="dashboard-content" style={{ padding: '2.5rem 2rem', maxWidth: 1100 }}>

      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <p style={{
          fontSize: '0.75rem', color: '#9ca3af',
          letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.4rem',
        }}>
          Internal Portal
        </p>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 600, color: '#111827', lineHeight: 1.2 }}>
          Welcome back, {name}
        </h1>
      </div>

      {loading ? (
        <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Loading…</div>
      ) : approvedCards.length === 0 ? (
        <div style={{
          background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 12,
          padding: '2rem', maxWidth: 420,
        }}>
          <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>
            Access pending
          </p>
          <p style={{ fontSize: '0.83rem', color: '#6b7280', lineHeight: 1.6 }}>
            Your account is awaiting admin approval. You'll see your apps here once access is granted.
          </p>
        </div>
      ) : (
        <div
          className="dashboard-grid"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}
        >
          {approvedCards.map(card => (
            <PlatformCard key={card.key} href={card.href} title={card.title} description={card.description} tag={card.tag} />
          ))}
        </div>
      )}

    </div>
  )
}

function PlatformCard({
  href, title, description, tag,
}: {
  href: string
  title: string
  description: string
  tag: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      referrerPolicy="unsafe-url"
      style={{
        display: 'block',
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: 12,
        padding: '1.5rem',
        textDecoration: 'none',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        cursor: 'pointer',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = '#d1d5db'
        el.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = '#e5e7eb'
        el.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#111827' }}>{title}</h2>
        <ArrowUpRight size={16} color="#9ca3af" />
      </div>
      <p style={{ fontSize: '0.85rem', color: '#6b7280', lineHeight: 1.6, marginBottom: '1.25rem' }}>
        {description}
      </p>
      <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.7rem', color: '#9ca3af', letterSpacing: '0.03em' }}>
        {tag}
      </span>
    </a>
  )
}
