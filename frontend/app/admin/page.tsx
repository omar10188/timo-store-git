"use client";

import { useEffect } from "react";
import { useAdminStore } from "@/lib/store/adminStore";
import { DollarSign, ShoppingBag, Users, Activity } from "lucide-react";
import { motion } from "framer-motion";

import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';

export default function AdminDashboard() {
  const { stats, fetchStats, isLoading } = useAdminStore();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (isLoading || !stats) {
    return (
      <div className="flex items-center justify-center h-full">
        <div
          className="animate-spin rounded-full h-12 w-12"
          style={{ borderTop: '2px solid var(--color-gold)', borderBottom: '2px solid var(--color-gold)', borderLeft: '2px solid transparent', borderRight: '2px solid transparent' }}
        />
      </div>
    );
  }

  const statCards = [
    { title: "Total Revenue", value: `$${stats.totalRevenue?.toFixed(2) || '0.00'}`, icon: DollarSign },
    { title: "Total Orders", value: stats.totalOrders || 0, icon: ShoppingBag },
    { title: "Orders Today", value: stats.ordersToday ?? 0, icon: Activity },
    { title: "Total Users", value: stats.totalUsers || 0, icon: Users },
  ];

  // Chart colors adapt to current CSS vars via recharts props
  const chartGridColor = 'var(--color-border)';
  const chartAxisColor = 'var(--color-text-muted)';
  const tooltipBg = 'var(--color-bg-elevated)';
  const tooltipBorder = 'var(--color-border)';
  const tooltipText = 'var(--color-text-primary)';

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-heading)' }}
        >
          Dashboard Overview
        </h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Welcome back, Admin. Here&apos;s what&apos;s happening today.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-2xl relative overflow-hidden"
            style={{
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div
              className="absolute -right-4 -top-4"
              style={{ color: 'var(--color-gold-muted)' }}
            >
              <stat.icon size={100} />
            </div>
            <div className="relative z-10 flex flex-col gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{
                  background: 'var(--color-gold-muted)',
                  color: 'var(--color-gold)',
                  border: '1px solid var(--color-border-gold)',
                }}
              >
                <stat.icon size={24} />
              </div>
              <div>
                <p
                  className="text-sm font-medium"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {stat.title}
                </p>
                <h3
                  className="text-3xl font-bold mt-1"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {stat.value}
                </h3>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        
        {/* Sales Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-2xl"
          style={{
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
          }}
        >
          <h2
            className="text-xl font-bold mb-6"
            style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-heading)' }}
          >
            Revenue Over Time (30 Days)
          </h2>
          <div className="h-[300px] w-full">
            {stats.salesData && stats.salesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                  <XAxis dataKey="date" stroke={chartAxisColor} tick={{ fill: chartAxisColor }} />
                  <YAxis stroke={chartAxisColor} tick={{ fill: chartAxisColor }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: tooltipBg,
                      borderColor: tooltipBorder,
                      color: tooltipText,
                      borderRadius: '8px',
                    }}
                    itemStyle={{ color: 'var(--color-gold)' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--color-gold)"
                    strokeWidth={3}
                    dot={{ r: 4, fill: 'var(--color-gold)' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div
                className="flex items-center justify-center h-full"
                style={{ color: 'var(--color-text-muted)' }}
              >
                No sales data available.
              </div>
            )}
          </div>
        </motion.div>

        {/* Top Products Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-6 rounded-2xl"
          style={{
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
          }}
        >
          <h2
            className="text-xl font-bold mb-6"
            style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-heading)' }}
          >
            Top Selling Products (By Quantity)
          </h2>
          <div className="h-[300px] w-full">
            {stats.topProducts && stats.topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.topProducts}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                  <XAxis dataKey="name" stroke={chartAxisColor} tick={{ fill: chartAxisColor, fontSize: 12 }} />
                  <YAxis stroke={chartAxisColor} tick={{ fill: chartAxisColor }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: tooltipBg,
                      borderColor: tooltipBorder,
                      color: tooltipText,
                      borderRadius: '8px',
                    }}
                    itemStyle={{ color: 'var(--color-gold)' }}
                    cursor={{ fill: 'var(--color-gold-muted)' }}
                  />
                  <Bar dataKey="sold" fill="var(--color-gold)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div
                className="flex items-center justify-center h-full"
                style={{ color: 'var(--color-text-muted)' }}
              >
                No product data available.
              </div>
            )}
          </div>
        </motion.div>
        
      </div>
    </div>
  );
}
