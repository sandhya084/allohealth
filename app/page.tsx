import React from 'react'
import DashboardLayout from './components/DashboardLayout'
import ProductCard from './components/ui/ProductCard'
import WarehouseCard from './components/ui/WarehouseCard'
import prisma from '../lib/prisma'

export default async function Page() {
  const productsData = await prisma.product.findMany({
    include: {
      inventories: {
        include: { warehouse: true }
      }
    }
  })

  const products = productsData.map((p) => ({
    id: p.id,
    sku: p.sku,
    name: p.name,
    description: p.description,
    inventories: p.inventories.map((i) => ({
      warehouseId: i.warehouseId,
      warehouseName: i.warehouse.name,
      totalUnits: i.totalUnits,
      reservedUnits: i.reservedUnits,
      available: i.totalUnits - i.reservedUnits
    }))
  }))

  const totalProducts = products.length
  const totalStock = products.reduce((s: number, p: any) => s + ((p.inventories || []).reduce((a: number, i: any) => a + (i.available ?? 0), 0)), 0)
  const activeReservations = await prisma.reservation.count({ where: { status: 'PENDING' } })

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <section className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/40 backdrop-blur">
          <div className="md:flex md:items-start md:justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center rounded-full bg-cyan-500/10 px-3 py-1 text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">
                Inventory pulse
              </div>
              <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Modern inventory reservation with premium clarity
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">
                Track stock levels, warehouse capacity, and reservation activity from a polished dashboard designed for fast decisions.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-950/90 px-6 py-5 text-right shadow-xl shadow-slate-950/20">
              <div className="text-xs uppercase tracking-[0.32em] text-slate-500">Snapshot</div>
              <div className="mt-4 text-4xl font-semibold text-white">{totalStock}</div>
              <p className="mt-1 text-sm text-slate-400">Across {totalProducts} products</p>
              <p className="mt-3 rounded-2xl bg-slate-900/70 px-4 py-3 text-sm text-slate-300">
                Latest update from the inventory engine. Export this report as CSV for downstream workflows.
              </p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-sm shadow-slate-950/30">
            <div className="text-sm text-cyan-300">Total products</div>
            <div className="mt-3 text-3xl font-semibold text-white">{totalProducts}</div>
            <p className="mt-2 text-sm text-slate-400">Products currently available in inventory.</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-sm shadow-slate-950/30">
            <div className="text-sm text-cyan-300">Total stock</div>
            <div className="mt-3 text-3xl font-semibold text-white">{totalStock}</div>
            <p className="mt-2 text-sm text-slate-400">Units on the shelf across all warehouses.</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-sm shadow-slate-950/30">
            <div className="text-sm text-cyan-300">Active reservations</div>
            <div className="mt-3 text-3xl font-semibold text-white">{activeReservations}</div>
            <p className="mt-2 text-sm text-slate-400">Open reservations waiting for fulfillment.</p>
          </div>
        </section>

        <section>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">Products</p>
              <h2 className="text-3xl font-semibold text-white">Inventory catalog</h2>
            </div>
            <p className="max-w-xl text-sm text-slate-400">Each product card shows current availability and the warehouse distribution for better capacity planning.</p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p: any) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>

        <section>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">Warehouses</p>
              <h2 className="text-3xl font-semibold text-white">Stock distribution</h2>
            </div>
            <p className="max-w-xl text-sm text-slate-400">Review available capacity at each warehouse with health-aware utilization metrics.</p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.flatMap((p: any) => p.inventories || []).map((w: any, idx: number) => (
              <WarehouseCard key={w.warehouseId + '-' + idx} warehouse={w} />
            ))}
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
}

