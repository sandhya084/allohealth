"use client"
import MotionDiv from './MotionDiv'

export default function WarehouseCard({ warehouse }: { warehouse: any }) {
  const available = warehouse.available ?? 0
  const total = warehouse.totalUnits ?? 0
  const reserved = warehouse.reservedUnits ?? 0
  const pct = total > 0 ? Math.round((available / total) * 100) : 0

  const status = available === 0 ? 'critical' : available <= 5 ? 'low' : 'healthy'

  return (
    <MotionDiv whileHover={{ y: -4 }} className="p-4 bg-slate-800/60 rounded-lg border border-white/5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-gray-400">{warehouse.warehouseName}</div>
          <div className="text-2xl font-bold text-white">{available}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-400">Reserved</div>
          <div className="text-sm font-medium text-white">{reserved}</div>
        </div>
      </div>

      <div className="mt-3">
        <div className="w-full h-2 bg-slate-700 rounded overflow-hidden">
          <div className={`h-full ${status === 'healthy' ? 'bg-emerald-500' : status === 'low' ? 'bg-yellow-400' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-2 text-xs text-gray-400">Utilization: {pct}%</div>
      </div>
    </MotionDiv>
  )
}
