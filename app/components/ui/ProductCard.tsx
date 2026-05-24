"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingCart, BarChart3 } from 'lucide-react'
import MotionDiv from './MotionDiv'

export default function ProductCard({ product }: { product: any }) {
  const router = useRouter()
  const [qty, setQty] = useState(1)
  const [loading, setLoading] = useState(false)

  const totalAvailable = (product.inventories || []).reduce((s: number, it: any) => s + (it.available ?? 0), 0)

  async function handleReserve() {
    setLoading(true)
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, warehouseId: product.inventories?.[0]?.warehouseId, quantity: Number(qty) })
      })
      if (res.status === 201) {
        const j = await res.json()
        router.push(`/reservation/${j.reservationId}`)
        return
      }

      if (res.status === 409) {
        alert('Insufficient stock')
        return
      }

      const j = await res.json().catch(() => ({}))
      alert(j.error || 'Failed to reserve')
    } catch (e) {
      alert('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <MotionDiv whileHover={{ y: -6 }} className="relative group bg-gradient-to-br from-slate-800/70 to-slate-900/70 rounded-2xl border border-white/8 overflow-hidden">
      <div className="p-6 flex flex-col h-full">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-white text-2xl font-bold shadow-md">{(product.name||'P').slice(0,1)}</div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">{product.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-400">SKU: {product.sku}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-300">Available</div>
            <div className="text-2xl font-bold text-white">{totalAvailable}</div>
          </div>
        </div>

        <p className="mt-4 text-sm text-gray-400 line-clamp-3">{product.description}</p>

        <div className="mt-4 flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-800/50 rounded px-3 py-2">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="text-gray-300">−</button>
            <input value={qty} onChange={(e) => setQty(Number(e.target.value || 1))} className="w-12 bg-transparent text-center outline-none" />
            <button onClick={() => setQty((q) => q + 1)} className="text-gray-300">+</button>
          </div>

          <button onClick={handleReserve} disabled={loading || totalAvailable === 0} className="ml-auto inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold disabled:opacity-50">
            <ShoppingCart className="w-4 h-4" />
            {loading ? 'Reserving…' : 'Reserve'}
          </button>

          <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/40 text-gray-200">
            <BarChart3 className="w-4 h-4" />
            Details
          </button>
        </div>

        <div className="mt-4 flex items-center gap-2 flex-wrap">
          {(product.inventories || []).map((inv: any) => (
            <span key={inv.warehouseId} className="px-2 py-1 bg-white/3 rounded-full text-xs text-gray-200">{inv.warehouseName}: {inv.available}</span>
          ))}
        </div>
      </div>
    </MotionDiv>
  )
}
