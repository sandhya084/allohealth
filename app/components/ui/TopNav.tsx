"use client"
import { Bell, Sun, Moon } from 'lucide-react'
import Image from 'next/image'

export default function TopNav() {
  return (
    <header className="w-full sticky top-0 z-40 backdrop-blur bg-white/5 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="px-3 py-2 rounded-md bg-slate-800/40 text-sm text-gray-200">Live Inventory</div>
          <div className="hidden md:block text-sm text-gray-400">Overview</div>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-2 rounded-md hover:bg-white/5"><Bell className="w-5 h-5 text-gray-300" /></button>
          <button className="p-2 rounded-md hover:bg-white/5"><Sun className="w-5 h-5 text-gray-300" /></button>
          <button className="p-2 rounded-md hover:bg-white/5"><Moon className="w-5 h-5 text-gray-300" /></button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-indigo-500 flex items-center justify-center text-white text-sm font-semibold">YG</div>
        </div>
      </div>
    </header>
  )
}
