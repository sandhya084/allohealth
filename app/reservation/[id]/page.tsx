"use client"
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

async function fetchReservation(id: string) {
  const res = await fetch(`/api/reservations/${id}`)
  if (!res.ok) throw new Error('Not found')
  return res.json()
}

function formatTime(ms: number) {
  if (ms <= 0) return '00:00'
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export default function ReservationPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  const [reservation, setReservation] = useState<any>(null)
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setError(null)
    fetchReservation(id)
      .then((r) => {
        if (!mounted) return
        setReservation(r)
        setTimeLeft(new Date(r.expiresAt).getTime() - Date.now())
      })
      .catch((e) => {
        if (!mounted) return
        setError('Reservation not found')
      })

    const t = setInterval(() => setTimeLeft((s) => s - 1000), 1000)
    return () => {
      mounted = false
      clearInterval(t)
    }
  }, [id])

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-slate-900">
        <div className="max-w-xl w-full bg-slate-800/60 rounded-xl p-8 text-center border border-white/5">
          <h2 className="text-2xl font-bold text-white mb-2">Reservation not found</h2>
          <p className="text-gray-400 mb-6">We couldn't find that reservation. It may have been released or expired.</p>
          <div className="flex justify-center gap-3">
            <Link href="/" className="px-4 py-2 bg-blue-600 text-white rounded">Back to Products</Link>
          </div>
        </div>
      </main>
    )
  }

  if (!reservation) return <div className="p-8 text-gray-300">Loading reservation...</div>

  const expired = timeLeft <= 0

  async function handleConfirm() {
    setLoading(true)
    try {
      const res = await fetch(`/api/reservations/${id}/confirm`, { method: 'POST' })
      if (res.status === 410) {
        setError('Reservation expired')
      } else if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        setError(j.error || 'Failed to confirm')
      } else {
        setReservation({ ...reservation, status: 'CONFIRMED' })
      }
    } catch (e) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  async function handleRelease() {
    setLoading(true)
    try {
      const res = await fetch(`/api/reservations/${id}/release`, { method: 'POST' })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        setError(j.error || 'Failed to release')
      } else {
        setReservation({ ...reservation, status: 'RELEASED' })
        // navigate back to products after short delay
        setTimeout(() => router.push('/'), 800)
      }
    } catch (e) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  const progress = Math.max(0, Math.min(100, Math.floor((timeLeft / (1000 * 60)) * 100)))

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Reservation Snapshot</h1>
            <p className="text-sm text-gray-400">Reservation ID: <span className="font-mono text-xs text-gray-300">{reservation.id}</span></p>
          </div>
          <Link href="/" className="text-sm text-gray-300 hover:text-white">← Back to Products</Link>
        </div>

        <section className="bg-gradient-to-tr from-slate-800/60 to-slate-900/60 rounded-2xl p-6 border border-white/5 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white text-3xl font-bold">{(reservation.productName||'P').slice(0,1)}</div>
                <div>
                  <h2 className="text-2xl font-semibold text-white leading-tight">{reservation.productName || reservation.productId}</h2>
                  <p className="text-sm text-gray-400">SKU: <span className="text-gray-300">{reservation.productSku ?? '—'}</span></p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm text-gray-300">
                <div className="p-3 bg-slate-800/40 rounded-lg">Warehouse: <div className="font-medium text-white mt-1">{reservation.warehouseName || reservation.warehouseId}</div></div>
                <div className="p-3 bg-slate-800/40 rounded-lg">Quantity: <div className="font-medium text-white mt-1">{reservation.quantity}</div></div>
                <div className="p-3 bg-slate-800/40 rounded-lg">Reserved At: <div className="font-medium text-white mt-1">{new Date(reservation.createdAt).toLocaleString()}</div></div>
                <div className="p-3 bg-slate-800/40 rounded-lg">Status: <div className={`font-semibold mt-1 ${reservation.status === 'PENDING' ? 'text-yellow-300' : reservation.status === 'CONFIRMED' ? 'text-green-300' : 'text-red-300'}`}>{reservation.status}</div></div>
              </div>

              <div className="mt-4 text-sm text-gray-400 leading-relaxed">{reservation.productDescription ?? 'No description available for this product.'}</div>
            </div>

            <aside className="flex flex-col items-center">
              <div className="relative w-40 h-40 mb-4">
                <svg className="w-40 h-40" viewBox="0 0 100 100">
                  <defs>
                    <linearGradient id="g1" x1="0%" x2="100%">
                      <stop offset="0%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#ef4444" />
                    </linearGradient>
                  </defs>
                  <circle cx="50" cy="50" r="36" stroke="#0f172a" strokeWidth="8" fill="none" />
                  <circle cx="50" cy="50" r="36" stroke="url(#g1)" strokeWidth="8" strokeLinecap="round" fill="none"
                    strokeDasharray={String(2 * Math.PI * 36)}
                    strokeDashoffset={String((1 - Math.max(0, Math.min(100, progress)) / 100) * 2 * Math.PI * 36)}
                    style={{ transition: 'stroke-dashoffset 400ms ease' }}
                  />
                  <text x="50" y="52" textAnchor="middle" fontSize="12" fill="#fff" fontWeight={700}>{formatTime(timeLeft)}</text>
                </svg>
              </div>

              <div className="w-full">
                <div className="w-full h-3 bg-slate-700 rounded overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-yellow-400 to-red-500 transition-all" style={{ width: `${expired ? 0 : Math.max(8, progress)}%` }} />
                </div>
                <div className="mt-2 text-xs text-gray-400 text-center">Expires in {formatTime(timeLeft)}</div>
              </div>

              {error && <div className="mt-3 text-sm text-red-400">{error}</div>}

              <div className="mt-6 w-full flex flex-col gap-3">
                <button
                  onClick={handleConfirm}
                  disabled={loading || expired || reservation.status !== 'PENDING'}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold hover:scale-[1.02] disabled:opacity-50"
                >
                  {loading ? 'Processing…' : 'Confirm Reservation'}
                </button>

                <button
                  onClick={handleRelease}
                  disabled={loading || reservation.status !== 'PENDING'}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-transparent border border-white/10 text-white font-semibold hover:bg-white/5 disabled:opacity-50"
                >
                  Cancel Reservation
                </button>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  )
}
