'use client'

import { ArrowUpRight, Users2, BarChart3, ClipboardList, Clock } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const ALL_CARDS = [
  {
    key: 'CRM & Workflow',
    href: 'https://ops.keala.io',
    title: 'CRM & Workflow',
    description: 'Manage contacts, deals, tasks, and operational workflows across the advisory team.',
    tag: 'ops.keala.io',
    gradient: 'linear-gradient(135deg, #1d4ed8 0%, #4f46e5 100%)',
    glowColor: 'rgba(79,70,229,0.25)',
    icon: <Users2 size={32} color="rgba(255,255,255,0.9)" strokeWidth={1.5} />,
    patternColor: 'rgba(255,255,255,0.06)',
    accentColor: '#4f46e5',
  },
  {
    key: 'Research Database',
    href: 'https://research.keala.io',
    title: 'Research Database',
    description: 'Access investment research, market analysis, and the firm\'s data repository.',
    tag: 'research.keala.io',
    gradient: 'linear-gradient(135deg, #047857 0%, #0f766e 100%)',
    glowColor: 'rgba(15,118,110,0.25)',
    icon: <BarChart3 size={32} color="rgba(255,255,255,0.9)" strokeWidth={1.5} />,
    patternColor: 'rgba(255,255,255,0.06)',
    accentColor: '#0f766e',
  },
  {
    key: 'Questionnaire',
    href: 'https://questionnaire.keala.io',
    title: 'Questionnaire',
    description: 'Client onboarding, risk profiling, and financial planning questionnaires.',
    tag: 'questionnaire.keala.io',
    gradient: 'linear-gradient(135deg, #6d28d9 0%, #a21caf 100%)',
    glowColor: 'rgba(162,28,175,0.25)',
    icon: <ClipboardList size={32} color="rgba(255,255,255,0.9)" strokeWidth={1.5} />,
    patternColor: 'rgba(255,255,255,0.06)',
    accentColor: '#7c3aed',
  },
]

type Card = typeof ALL_CARDS[number]

export default function DashboardPage() {
  const [name, setName] = useState('there')
  const [approvedCards, setApprovedCards] = useState<Card[]>(ALL_CARDS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const display = user.user_metadata?.username || user.email?.split('@')[0] || 'there'
        setName(display)

        if (user.app_metadata?.role === 'admin') {
          setLoading(false)
          return
        }
      }

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

      <div style={{ marginBottom: '2.5rem' }}>
        <p style={{
          fontSize: '0.72rem', color: '#9ca3af',
          letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.4rem',
        }}>
          Internal Portal
        </p>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#111827', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
          Welcome back, {name}
        </h1>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#9ca3af', fontSize: '0.875rem' }}>
          <span style={{
            display: 'inline-block', width: 14, height: 14,
            border: '2px solid #e5e7eb', borderTopColor: '#9ca3af',
            borderRadius: '50%', animation: 'spin 0.8s linear infinite',
          }} />
          Loading your workspace…
        </div>
      ) : approvedCards.length === 0 ? (
        <PendingState />
      ) : (
        <div
          className="dashboard-grid"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}
        >
          {approvedCards.map(card => (
            <PlatformCard key={card.key} card={card} />
          ))}
        </div>
      )}

    </div>
  )
}

function PlatformCard({ card }: { card: Card }) {
  const [hovered, setHovered] = useState(false)

  return (
    <a
      href={card.href}
      target="_blank"
      rel="noopener"
      referrerPolicy="unsafe-url"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: 16,
        textDecoration: 'none',
        overflow: 'hidden',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered
          ? `0 16px 40px ${card.glowColor}, 0 4px 12px rgba(0,0,0,0.08)`
          : '0 1px 4px rgba(0,0,0,0.06)',
        borderColor: hovered ? 'transparent' : '#e5e7eb',
        cursor: 'pointer',
      }}
    >
      {/* Gradient header */}
      <div style={{
        background: card.gradient,
        padding: '2rem 1.75rem 1.75rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Dot grid pattern */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `radial-gradient(${card.patternColor} 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
          pointerEvents: 'none',
        }} />

        {/* Glow circle */}
        <div style={{
          position: 'absolute',
          bottom: '-40%', right: '-10%',
          width: 160, height: 160,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.07)',
          pointerEvents: 'none',
        }} />

        {/* Icon container */}
        <div style={{
          position: 'relative', zIndex: 1,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 60, height: 60,
          borderRadius: 14,
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.2)',
          marginBottom: '1.25rem',
          transition: 'transform 0.2s ease',
          transform: hovered ? 'scale(1.08)' : 'scale(1)',
        }}>
          {card.icon}
        </div>

        {/* Open arrow */}
        <div style={{
          position: 'absolute', zIndex: 1,
          top: '1.25rem', right: '1.25rem',
          width: 28, height: 28,
          borderRadius: 8,
          background: 'rgba(255,255,255,0.15)',
          border: '1px solid rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.15s',
        }}>
          <ArrowUpRight size={13} color="rgba(255,255,255,0.85)" />
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding: '1.4rem 1.5rem 1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h2 style={{
          fontSize: '1rem',
          fontWeight: 700,
          color: '#111827',
          letterSpacing: '-0.01em',
          marginBottom: '0.5rem',
        }}>
          {card.title}
        </h2>
        <p style={{
          fontSize: '0.82rem',
          color: '#6b7280',
          lineHeight: 1.65,
          flex: 1,
          marginBottom: '1.25rem',
        }}>
          {card.description}
        </p>

        {/* Footer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '1rem',
          borderTop: '1px solid #f3f4f6',
        }}>
          <span style={{
            fontFamily: 'DM Mono, monospace',
            fontSize: '0.68rem',
            color: '#9ca3af',
            letterSpacing: '0.03em',
          }}>
            {card.tag}
          </span>
          <span style={{
            fontSize: '0.72rem',
            fontWeight: 600,
            color: card.accentColor,
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
          }}>
            Open <ArrowUpRight size={11} />
          </span>
        </div>
      </div>
    </a>
  )
}

function PendingState() {
  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: 16,
      padding: '2.5rem',
      maxWidth: 440,
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    }}>
      <div style={{
        width: 44, height: 44,
        borderRadius: 12,
        background: 'rgba(217,119,6,0.08)',
        border: '1px solid rgba(217,119,6,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '1.1rem',
      }}>
        <Clock size={20} color="#d97706" />
      </div>
      <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111827', marginBottom: '0.5rem', letterSpacing: '-0.01em' }}>
        Access pending approval
      </p>
      <p style={{ fontSize: '0.83rem', color: '#6b7280', lineHeight: 1.65 }}>
        Your account is awaiting admin review. You'll see your approved apps here once access is granted.
      </p>
    </div>
  )
}
