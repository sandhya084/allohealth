"use client"
import React, { useState } from 'react'

export default function InventoryCard({ product, inventory }: { product: any; inventory: any }) {
  const [quantity] = useState<number>(1)

  const stockPercentage = inventory.totalUnits ? (inventory.available / inventory.totalUnits) * 100 : 0
  const stockStatus = inventory.available === 0 ? 'danger' : stockPercentage < 25 ? 'warning' : 'success'
  const statusColor =
    stockStatus === 'danger'
      ? 'from-red-500 to-red-600'
      : stockStatus === 'warning'
      ? 'from-yellow-500 to-yellow-600'
      : 'from-green-500 to-green-600'

  return (
    <div className="p-4 rounded-lg bg-slate-900/50 border border-white/5 hover:border-white/10 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">🏭</span>
          <span className="font-semibold text-white">{inventory.warehouseName}</span>
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded bg-gradient-to-r ${statusColor} text-white`}>
          {inventory.available > 0 ? 'In Stock' : 'Out of Stock'}
        </span>
      </div>

      <div className="mb-2">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-400">Available Units</span>
          <span className="text-sm font-bold text-white">{inventory.available}/{inventory.totalUnits}</span>
        </div>
        <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
          <div className={`h-full bg-gradient-to-r ${statusColor} transition-all duration-300`} style={{ width: `${stockPercentage}%` }} />
        </div>
      </div>

      <form action="/api/reservations" method="post" className="mt-4">
        <input type="hidden" name="productId" value={product.id} />
        <input type="hidden" name="warehouseId" value={inventory.warehouseId} />

        <div className="flex gap-2">
          <input
            name="quantity"
            defaultValue={1}
            type="number"
            min={1}
            max={inventory.available}
            disabled={inventory.available === 0}
            className="flex-1 px-3 py-2 rounded-lg bg-slate-700 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          />
          <button
            type="submit"
            disabled={inventory.available === 0}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none hover:scale-105 active:scale-95"
          >
            Reserve
          </button>
        </div>
      </form>
    </div>
  )
}
