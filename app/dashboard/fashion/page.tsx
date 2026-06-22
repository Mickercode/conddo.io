"use client";

import Link from "next/link";
import { Package, ShoppingCart, TrendingUp, Users, ArrowRight, AlertTriangle } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/Button";
import { naira } from "@/lib/format";

// Mock data for fashion brand dashboard
const dashboardStats = {
  totalOrders: 156,
  pendingOrders: 23,
  totalRevenue: 2450000,
  monthRevenue: 425000,
  totalCustomers: 89,
  activeCustomers: 34,
  totalInventory: 1245,
  lowStockItems: 8,
  topSellingShoes: [
    { name: "Classic Leather Oxford", sales: 45, revenue: 2025000 },
    { name: "Urban Canvas Sneaker", sales: 38, revenue: 950000 },
    { name: "Comfort Loafer", sales: 28, revenue: 980000 },
  ],
  recentOrders: [
    { id: "ORD-156", customer: "John Doe", amount: 45000, status: "Processing", date: "2024-06-22" },
    { id: "ORD-155", customer: "Jane Smith", amount: 50000, status: "Production", date: "2024-06-21" },
    { id: "ORD-154", customer: "Mike Johnson", amount: 35000, status: "Ready", date: "2024-06-21" },
    { id: "ORD-153", customer: "Sarah Wilson", amount: 75000, status: "Shipped", date: "2024-06-20" },
    { id: "ORD-152", customer: "David Brown", amount: 45000, status: "Delivered", date: "2024-06-19" },
  ],
};

const statusColors = {
  Processing: "bg-blue-500/20 text-blue-300",
  Production: "bg-amber-500/20 text-amber-300",
  Ready: "bg-green-500/20 text-green-300",
  Shipped: "bg-indigo-500/20 text-indigo-300",
  Delivered: "bg-gray-500/20 text-gray-300",
};

export default function FashionDashboardPage() {
  return (
    <AppShell title="Fashion Dashboard" subtitle="Overview of your shoe brand operations">
      {/* KPI Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/orders/fashion"
          className="rounded-xl border border-white/[0.06] bg-cinema-elev p-5 transition-colors hover:border-primary-light"
        >
          <div className="mb-3 flex items-center justify-between">
            <ShoppingCart size={20} className="text-white/45" />
            <span className="text-[12px] text-white/45">This month</span>
          </div>
          <p className="mb-1 font-mono text-[28px] font-semibold leading-none text-white">
            {dashboardStats.monthRevenue}
          </p>
          <p className="text-[12px] text-white/65">Revenue (₦)</p>
        </Link>

        <Link
          href="/orders/fashion"
          className="rounded-xl border border-white/[0.06] bg-cinema-elev p-5 transition-colors hover:border-primary-light"
        >
          <div className="mb-3 flex items-center justify-between">
            <Package size={20} className="text-white/45" />
            <span className="text-[12px] text-white/45">{dashboardStats.pendingOrders} pending</span>
          </div>
          <p className="mb-1 font-mono text-[28px] font-semibold leading-none text-white">
            {dashboardStats.totalOrders}
          </p>
          <p className="text-[12px] text-white/65">Total orders</p>
        </Link>

        <Link
          href="/customers"
          className="rounded-xl border border-white/[0.06] bg-cinema-elev p-5 transition-colors hover:border-primary-light"
        >
          <div className="mb-3 flex items-center justify-between">
            <Users size={20} className="text-white/45" />
            <span className="text-[12px] text-white/45">{dashboardStats.activeCustomers} active</span>
          </div>
          <p className="mb-1 font-mono text-[28px] font-semibold leading-none text-white">
            {dashboardStats.totalCustomers}
          </p>
          <p className="text-[12px] text-white/65">Customers</p>
        </Link>

        <Link
          href="/inventory/fashion"
          className="rounded-xl border border-white/[0.06] bg-cinema-elev p-5 transition-colors hover:border-primary-light"
        >
          <div className="mb-3 flex items-center justify-between">
            <TrendingUp size={20} className="text-white/45" />
            {dashboardStats.lowStockItems > 0 && (
              <span className="flex items-center gap-1 text-[12px] text-amber-300">
                <AlertTriangle size={12} />
                {dashboardStats.lowStockItems} low
              </span>
            )}
          </div>
          <p className="mb-1 font-mono text-[28px] font-semibold leading-none text-white">
            {dashboardStats.totalInventory}
          </p>
          <p className="text-[12px] text-white/65">Pairs in stock</p>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Selling Shoes */}
        <div className="rounded-xl border border-white/[0.06] bg-cinema-elev p-5">
          <h2 className="mb-4 text-[15px] font-semibold text-white">Top Selling Shoes</h2>
          <div className="space-y-3">
            {dashboardStats.topSellingShoes.map((shoe, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] p-4"
              >
                <div>
                  <p className="text-[14px] font-medium text-white">{shoe.name}</p>
                  <p className="text-[12px] text-white/45">{shoe.sales} pairs sold</p>
                </div>
                <p className="font-mono text-[14px] text-white">{naira(shoe.revenue)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="rounded-xl border border-white/[0.06] bg-cinema-elev p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-white">Recent Orders</h2>
            <Link href="/orders/fashion" className="text-[12px] font-medium text-primary hover:underline">
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {dashboardStats.recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] p-4"
              >
                <div>
                  <p className="text-[14px] font-medium text-white">{order.customer}</p>
                  <p className="text-[12px] text-white/45">{order.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-[14px] text-white">{naira(order.amount)}</p>
                  <span className={`inline-block rounded px-2 py-0.5 text-[11px] ${statusColors[order.status as keyof typeof statusColors]}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6">
        <h2 className="mb-4 text-[15px] font-semibold text-white">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/orders/fashion">
            <Button variant="secondary" size="md" className="w-full">
              <ShoppingCart size={17} />
              New Order
            </Button>
          </Link>
          <Link href="/shoes">
            <Button variant="secondary" size="md" className="w-full">
              <Package size={17} />
              Add Shoe
            </Button>
          </Link>
          <Link href="/inventory/fashion">
            <Button variant="secondary" size="md" className="w-full">
              <TrendingUp size={17} />
              Check Stock
            </Button>
          </Link>
          <Link href="/customers">
            <Button variant="secondary" size="md" className="w-full">
              <Users size={17} />
              Add Customer
            </Button>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
