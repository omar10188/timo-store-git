"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAdminStore } from "@/lib/store/adminStore";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { Search, Filter, RefreshCw, ChevronLeft, ChevronRight, Eye, Wifi } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "all", label: "All Orders", color: "#9ca3af" },
  { value: "pending", label: "Pending", color: "#F59E0B" },
  { value: "processing", label: "Processing", color: "#3B82F6" },
  { value: "shipped", label: "Shipped", color: "#8B5CF6" },
  { value: "delivered", label: "Delivered", color: "#10B981" },
  { value: "cancelled", label: "Cancelled", color: "#EF4444" },
];

const statusBadgeStyle = (status: string) => {
  const found = STATUS_OPTIONS.find((s) => s.value === status);
  const color = found?.color || "#9ca3af";
  return {
    background: `${color}22`,
    color,
    border: `1px solid ${color}55`,
  };
};

function SkeletonRow() {
  return (
    <tr className="border-b border-white/5">
      {[...Array(7)].map((_, i) => (
        <td key={i} className="p-4">
          <div
            className="h-4 rounded animate-pulse"
            style={{ background: "var(--color-bg-secondary, #1a1a1a)", width: i === 0 ? "60px" : "100%" }}
          />
        </td>
      ))}
    </tr>
  );
}

export default function AdminOrders() {
  const router = useRouter();
  const {
    orders,
    fetchOrders,
    updateOrderStatus,
    isLoading,
    searchQuery,
    statusFilter,
    setSearch,
    setStatusFilter,
    currentPage,
    totalPages,
    totalOrders,
  } = useAdminStore();

  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [isLive] = useState(true); // Socket.io is always active

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(localSearch);
    }, 400);
    return () => clearTimeout(timer);
  }, [localSearch, setSearch]);

  // Fetch on filter change
  useEffect(() => {
    fetchOrders({ search: searchQuery, status: statusFilter, page: currentPage });
  }, [searchQuery, statusFilter, currentPage, fetchOrders]);

  const handleStatusChange = async (id: string, newStatus: string, e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    try {
      await updateOrderStatus(id, newStatus);
      toast.success(`Status updated to ${newStatus}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    }
  };

  const handlePageChange = (p: number) => {
    fetchOrders({ page: p });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "var(--color-text-primary)" }}>
            Order Management
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
            {totalOrders} total orders
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Live indicator */}
          {isLive && (
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
              style={{ background: "#10B98122", color: "#10B981", border: "1px solid #10B98155" }}
            >
              <Wifi size={12} className="animate-pulse" />
              Live
            </div>
          )}
          <button
            onClick={() => fetchOrders()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105"
            style={{
              background: "var(--color-gold-muted, #2d2200)",
              color: "var(--color-gold, #D4AF37)",
              border: "1px solid var(--color-border-gold, #D4AF3755)",
            }}
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Search */}
        <div
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl flex-1 min-w-[200px]"
          style={{
            background: "var(--color-bg-card, #111)",
            border: "1px solid var(--color-border, #1e1e1e)",
          }}
        >
          <Search size={16} style={{ color: "var(--color-text-muted, #6b7280)" }} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="bg-transparent outline-none text-sm w-full"
            style={{ color: "var(--color-text-primary)" }}
            id="orders-search"
          />
        </div>

        {/* Status Filter Tabs */}
        <div
          className="flex items-center gap-1 p-1 rounded-xl overflow-x-auto"
          style={{ background: "var(--color-bg-card, #111)", border: "1px solid var(--color-border, #1e1e1e)" }}
        >
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s.value}
              onClick={() => setStatusFilter(s.value)}
              id={`filter-${s.value}`}
              className="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-150"
              style={
                statusFilter === s.value
                  ? { background: `${s.color}22`, color: s.color, border: `1px solid ${s.color}55` }
                  : { color: "var(--color-text-muted, #6b7280)", border: "1px solid transparent" }
              }
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "var(--color-bg-card, #111)",
          border: "1px solid var(--color-border, #1e1e1e)",
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead style={{ background: "var(--color-bg-secondary, #0d0d0d)", borderBottom: "1px solid var(--color-border, #1e1e1e)" }}>
              <tr>
                {["Order ID", "Customer", "Date", "Items", "Total", "Status", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="p-4 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "var(--color-text-muted, #6b7280)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
                : orders.map((order, i) => (
                    <motion.tr
                      key={order._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => router.push(`/admin/orders/${order._id}`)}
                      className="border-b cursor-pointer transition-colors duration-150 hover:brightness-125"
                      style={{ borderColor: "var(--color-border, #1e1e1e)" }}
                    >
                      <td className="p-4 text-sm font-mono" style={{ color: "var(--color-gold, #D4AF37)" }}>
                        #{String(order._id).slice(-8).toUpperCase()}
                      </td>
                      <td className="p-4">
                        <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                          {order.customerName || order.user?.name || "Guest"}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted, #6b7280)" }}>
                          {order.customerPhone || order.user?.phone || order.user?.email || ""}
                        </p>
                      </td>
                      <td className="p-4 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="p-4 text-sm text-center" style={{ color: "var(--color-text-secondary)" }}>
                        {order.items?.length || 0}
                      </td>
                      <td className="p-4 text-sm font-bold" style={{ color: "var(--color-gold, #D4AF37)" }}>
                        ${order.totalPrice?.toFixed(2)}
                      </td>
                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          id={`status-${order._id}`}
                          value={order.status}
                          onChange={(e) => handleStatusChange(order._id, e.target.value, e)}
                          className="text-xs font-semibold rounded-full px-3 py-1.5 outline-none cursor-pointer"
                          style={statusBadgeStyle(order.status)}
                        >
                          {STATUS_OPTIONS.filter((s) => s.value !== "all").map((s) => (
                            <option key={s.value} value={s.value} style={{ background: "#111", color: "#fff" }}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-4">
                        <button
                          id={`view-order-${order._id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/admin/orders/${order._id}`);
                          }}
                          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-150 hover:scale-105"
                          style={{
                            color: "var(--color-gold, #D4AF37)",
                            background: "var(--color-gold-muted, #2d2200)",
                            border: "1px solid var(--color-border-gold, #D4AF3755)",
                          }}
                        >
                          <Eye size={12} />
                          View
                        </button>
                      </td>
                    </motion.tr>
                  ))}
              {!isLoading && orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-16 text-center" style={{ color: "var(--color-text-muted, #6b7280)" }}>
                    <div className="flex flex-col items-center gap-3">
                      <span style={{ fontSize: "3rem" }}>📭</span>
                      <p className="font-medium">No orders found</p>
                      {(searchQuery || statusFilter !== "all") && (
                        <button
                          onClick={() => { setSearch(""); setLocalSearch(""); setStatusFilter("all"); }}
                          className="text-sm underline"
                          style={{ color: "var(--color-gold, #D4AF37)" }}
                        >
                          Clear filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{ borderTop: "1px solid var(--color-border, #1e1e1e)" }}
          >
            <p className="text-sm" style={{ color: "var(--color-text-muted, #6b7280)" }}>
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                id="pagination-prev"
                className="p-2 rounded-lg transition-all duration-150 disabled:opacity-30 hover:scale-105"
                style={{ background: "var(--color-bg-secondary, #0d0d0d)", color: "var(--color-text-primary)" }}
              >
                <ChevronLeft size={16} />
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(i + 1)}
                  id={`page-${i + 1}`}
                  className="w-8 h-8 rounded-lg text-sm font-medium transition-all duration-150"
                  style={
                    currentPage === i + 1
                      ? { background: "var(--color-gold, #D4AF37)", color: "#000", fontWeight: 700 }
                      : { background: "var(--color-bg-secondary, #0d0d0d)", color: "var(--color-text-secondary)" }
                  }
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                id="pagination-next"
                className="p-2 rounded-lg transition-all duration-150 disabled:opacity-30 hover:scale-105"
                style={{ background: "var(--color-bg-secondary, #0d0d0d)", color: "var(--color-text-primary)" }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
