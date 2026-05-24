"use client"
import { useState } from 'react'
import Link from 'next/link'
import { Home, Box, ClipboardList, MapPin, BarChart2, Settings } from 'lucide-react'

const items = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/products', label: 'Products', icon: Box },
  { href: '/reservations', label: 'Reservations', icon: ClipboardList },
  { href: '/warehouses', label: 'Warehouses', icon: MapPin },
  { href: '/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar({ compact = false }: { compact?: boolean }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside className={`flex flex-col h-full ${collapsed ? 'w-20' : 'w-64'} transition-all bg-slate-900/60 border-r border-white/5` }>
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center text-white font-bold shadow">IH</div>
          {!collapsed && <div>
            <div className="text-white font-semibold">InventoryHub</div>
            <div className="text-xs text-gray-400">Admin</div>
          </div>}
        </div>
        <button aria-label="Toggle sidebar" onClick={() => setCollapsed((s) => !s)} className="text-gray-400 hover:text-white">
          {collapsed ? '→' : '←'}
        </button>
      </div>

      <nav className="flex-1 p-2 mt-4">
        <ul className="space-y-1">
          {items.map((it) => {
            const Icon = it.icon
            return (
              <li key={it.href}>
                <Link href={it.href} className={`flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors ${collapsed ? 'justify-center' : ''}`}>
                  <Icon className="w-4 h-4 text-gray-300" />
                  {!collapsed && <span className="text-sm text-gray-200">{it.label}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="p-4">
        <button className="w-full px-3 py-2 rounded-md bg-slate-800/60 text-sm text-gray-200">New Reservation</button>
      </div>
    </aside>
  )
}
