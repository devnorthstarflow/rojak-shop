'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import Image from 'next/image'

export default function LoginPage() {
  const router = useRouter()
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, password }),
      })
      if (res.ok) {
        router.push('/')
        router.refresh()
      } else {
        setError('Identifiants incorrects. Réessayez.')
        setShake(true)
        setTimeout(() => setShake(false), 500)
        setLoading(false)
      }
    } catch {
      setError('Erreur réseau.')
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: '#0D2318' }}
    >
      {/* Background texture — subtle radial */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 30%, rgba(196,160,82,0.08) 0%, transparent 70%)',
        }}
      />

      {/* Mountains silhouette bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none"
        style={{
          background:
            'linear-gradient(to top, rgba(10,28,18,0.9) 0%, transparent 100%)',
        }}
      />

      {/* Gold line top */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5"
        style={{ background: 'var(--gold)' }}
      />

      {/* Main card */}
      <div
        className={`relative z-10 w-full max-w-sm mx-4 ${shake ? 'animate-shake' : ''}`}
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div
            className="relative w-64 h-72 drop-shadow-2xl"
          >
            <Image
              src="/logo-rojak.png"
              alt="Rojak Family Market"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Login form */}
        <div
          className="rounded-2xl overflow-hidden shadow-2xl"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(196,160,82,0.25)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {/* Card header */}
          <div
            className="px-6 py-4 text-center"
            style={{ borderBottom: '1px solid rgba(196,160,82,0.15)' }}
          >
            <p
              className="text-xs font-semibold tracking-[0.25em] uppercase"
              style={{ color: 'var(--gold)' }}
            >
              Accès privé — Boutique
            </p>
          </div>

          {/* Fields */}
          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
            {/* Login */}
            <div>
              <label
                className="block text-[10px] font-bold mb-1.5 tracking-[0.15em] uppercase"
                style={{ color: 'rgba(196,160,82,0.7)' }}
              >
                Identifiant
              </label>
              <input
                type="text"
                value={login}
                onChange={e => setLogin(e.target.value)}
                required
                autoComplete="username"
                placeholder="votre identifiant"
                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all placeholder-white/20"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(196,160,82,0.2)',
                  color: 'white',
                }}
                onFocus={e => (e.target.style.borderColor = 'var(--gold)')}
                onBlur={e =>
                  (e.target.style.borderColor = 'rgba(196,160,82,0.2)')
                }
              />
            </div>

            {/* Password */}
            <div>
              <label
                className="block text-[10px] font-bold mb-1.5 tracking-[0.15em] uppercase"
                style={{ color: 'rgba(196,160,82,0.7)' }}
              >
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 pr-10 rounded-lg text-sm outline-none transition-all placeholder-white/20"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(196,160,82,0.2)',
                    color: 'white',
                  }}
                  onFocus={e => (e.target.style.borderColor = 'var(--gold)')}
                  onBlur={e =>
                    (e.target.style.borderColor = 'rgba(196,160,82,0.2)')
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'rgba(196,160,82,0.5)' }}
                  onMouseEnter={e =>
                    ((e.currentTarget as HTMLElement).style.color = 'var(--gold)')
                  }
                  onMouseLeave={e =>
                    ((e.currentTarget as HTMLElement).style.color =
                      'rgba(196,160,82,0.5)')
                  }
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                className="px-3 py-2 rounded-lg text-xs"
                style={{
                  background: 'rgba(196,30,58,0.15)',
                  border: '1px solid rgba(196,30,58,0.3)',
                  color: '#F87171',
                }}
              >
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-bold tracking-[0.2em] uppercase transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              style={{
                background: 'var(--gold)',
                color: 'var(--green)',
                fontFamily: 'Syne, sans-serif',
                boxShadow: '0 4px 20px rgba(196,160,82,0.3)',
              }}
              onMouseEnter={e =>
                ((e.currentTarget as HTMLElement).style.boxShadow =
                  '0 6px 28px rgba(196,160,82,0.5)')
              }
              onMouseLeave={e =>
                ((e.currentTarget as HTMLElement).style.boxShadow =
                  '0 4px 20px rgba(196,160,82,0.3)')
              }
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {loading ? 'Connexion…' : 'Entrer'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p
          className="text-center mt-6 text-[10px] tracking-widest"
          style={{ color: 'rgba(196,160,82,0.3)' }}
        >
          EST. 2024 · PAYS DE GEX · GENÈVE
        </p>
      </div>

      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%       { transform: translateX(-8px); }
          40%       { transform: translateX(8px); }
          60%       { transform: translateX(-5px); }
          80%       { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.45s ease; }
      `}</style>
    </div>
  )
}
