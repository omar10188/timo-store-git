"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAdminStore } from "@/lib/store/adminStore";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Package,
  User,
  MapPin,
  CreditCard,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  ShoppingBag,
  AlertCircle,
} from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.FC<any> }> = {
  pending: { label: "Pending", color: "#F59E0B", icon: AlertCircle },
  processing: { label: "Processing", color: "#3B82F6", icon: Package },
  shipped: { label: "Shipped", color: "#8B5CF6", icon: Truck },
  delivered: { label: "Delivered", color: "#10B981", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "#EF4444", icon: XCircle },
};

const STATUS_ORDER = ["pending", "processing", "shipped", "delivered"];

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { selectedOrder, fetchOrderById, updateOrderStatus, isOrderLoading } = useAdminStore();
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");

  useEffect(() => {
    if (id) fetchOrderById(id);
  }, [id, fetchOrderById]);

  useEffect(() => {
    if (selectedOrder) setSelectedStatus(selectedOrder.status);
  }, [selectedOrder]);

  const handleStatusUpdate = async () => {
    if (!selectedOrder || selectedStatus === selectedOrder.status) return;
    setUpdatingStatus(true);
    try {
      await updateOrderStatus(selectedOrder._id, selectedStatus);
      toast.success(`Order status updated to ${selectedStatus}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (isOrderLoading || !selectedOrder) {
    return (
      <div className="flex items-center justify-center h-64">
        <div
          className="animate-spin rounded-full h-12 w-12"
          style={{
            borderTop: "2px solid var(--color-gold, #D4AF37)",
            borderBottom: "2px solid var(--color-gold, #D4AF37)",
            borderLeft: "2px solid transparent",
            borderRight: "2px solid transparent",
          }}
        />
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[selectedOrder.status] || STATUS_CONFIG.pending;
  const StatusIcon = statusCfg.icon;

  return (
    <div className="space-y-6 pb-10 max-w-5xl mx-auto">
      {/* Back + Header */}
      <div className="flex items-center gap-4">
        <button
          id="back-to-orders"
          onClick={() => router.push("/admin/orders")}
          className="flex items-center gap-2 text-sm px-3 py-2 rounded-xl transition-all hover:scale-105"
          style={{
            color: "var(--color-text-secondary)",
            background: "var(--color-bg-card, #111)",
            border: "1px solid var(--color-border, #1e1e1e)",
          }}
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>
            Order{" "}
            <span style={{ color: "var(--color-gold, #D4AF37)", fontFamily: "monospace" }}>
              #{String(selectedOrder._id).slice(-8).toUpperCase()}
            </span>
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--color-text-muted, #6b7280)" }}>
            Placed on{" "}
            {new Date(selectedOrder.createdAt).toLocaleString("en-US", {
              dateStyle: "long",
              timeStyle: "short",
            })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl overflow-hidden"
            style={{
              background: "var(--color-bg-card, #111)",
              border: "1px solid var(--color-border, #1e1e1e)",
            }}
          >
            <div
              className="px-6 py-4 flex items-center gap-2 border-b"
              style={{ borderColor: "var(--color-border, #1e1e1e)" }}
            >
              <ShoppingBag size={18} style={{ color: "var(--color-gold, #D4AF37)" }} />
              <h2 className="font-semibold" style={{ color: "var(--color-text-primary)" }}>
                Order Items ({selectedOrder.items.length})
              </h2>
            </div>
            <div className="divide-y" style={{ borderColor: "var(--color-border, #1e1e1e)" }}>
              {selectedOrder.items.map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-4">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 rounded-lg object-cover"
                      style={{ border: "1px solid var(--color-border, #1e1e1e)" }}
                    />
                  ) : (
                    <div
                      className="w-14 h-14 rounded-lg flex items-center justify-center"
                      style={{ background: "var(--color-bg-secondary, #0d0d0d)" }}
                    >
                      <Package size={24} style={{ color: "var(--color-text-muted)" }} />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-sm" style={{ color: "var(--color-text-primary)" }}>
                      {item.name}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted, #6b7280)" }}>
                      Qty: {item.quantity} × ${item.price.toFixed(2)}
                    </p>
                  </div>
                  <p className="font-bold text-sm" style={{ color: "var(--color-gold, #D4AF37)" }}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
            {/* Price summary */}
            <div
              className="px-6 py-4 space-y-2 border-t"
              style={{ borderColor: "var(--color-border, #1e1e1e)", background: "var(--color-bg-secondary, #0d0d0d)" }}
            >
              <div className="flex justify-between text-sm" style={{ color: "var(--color-text-secondary)" }}>
                <span>Subtotal</span>
                <span>${(selectedOrder.subtotal || selectedOrder.totalPrice).toFixed(2)}</span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="flex justify-between text-sm" style={{ color: "#10B981" }}>
                  <span>Discount {selectedOrder.coupon ? `(${selectedOrder.coupon})` : ""}</span>
                  <span>-${selectedOrder.discount.toFixed(2)}</span>
                </div>
              )}
              <div
                className="flex justify-between font-bold pt-2 border-t"
                style={{ borderColor: "var(--color-border, #1e1e1e)" }}
              >
                <span style={{ color: "var(--color-text-primary)" }}>Total</span>
                <span style={{ color: "var(--color-gold, #D4AF37)", fontSize: "1.125rem" }}>
                  ${selectedOrder.totalPrice.toFixed(2)}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Status History Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl"
            style={{
              background: "var(--color-bg-card, #111)",
              border: "1px solid var(--color-border, #1e1e1e)",
            }}
          >
            <div
              className="px-6 py-4 flex items-center gap-2 border-b"
              style={{ borderColor: "var(--color-border, #1e1e1e)" }}
            >
              <Clock size={18} style={{ color: "var(--color-gold, #D4AF37)" }} />
              <h2 className="font-semibold" style={{ color: "var(--color-text-primary)" }}>
                Status History
              </h2>
            </div>
            <div className="p-6">
              {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 ? (
                <div className="relative">
                  {/* Vertical line */}
                  <div
                    className="absolute left-4 top-0 bottom-0 w-px"
                    style={{ background: "var(--color-border, #1e1e1e)" }}
                  />
                  <div className="space-y-4">
                    {[...selectedOrder.statusHistory].reverse().map((entry, i) => {
                      const cfg = STATUS_CONFIG[entry.status] || STATUS_CONFIG.pending;
                      const Icon = cfg.icon;
                      return (
                        <div key={i} className="flex items-start gap-4 pl-2">
                          <div
                            className="relative z-10 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ background: `${cfg.color}22`, border: `2px solid ${cfg.color}` }}
                          >
                            <div className="w-2 h-2 rounded-full" style={{ background: cfg.color }} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span
                                className="text-sm font-semibold capitalize"
                                style={{ color: cfg.color }}
                              >
                                {entry.status}
                              </span>
                              {i === 0 && (
                                <span
                                  className="text-xs px-2 py-0.5 rounded-full"
                                  style={{ background: "#D4AF3722", color: "#D4AF37" }}
                                >
                                  Latest
                                </span>
                              )}
                            </div>
                            {entry.note && (
                              <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                                {entry.note}
                              </p>
                            )}
                            <p className="text-xs mt-1" style={{ color: "var(--color-text-muted, #6b7280)" }}>
                              {new Date(entry.changedAt).toLocaleString("en-US", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                  No status history available.
                </p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Current Status + Update */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-2xl p-6 space-y-4"
            style={{
              background: "var(--color-bg-card, #111)",
              border: "1px solid var(--color-border, #1e1e1e)",
            }}
          >
            <h3 className="font-semibold" style={{ color: "var(--color-text-primary)" }}>
              Update Status
            </h3>
            <div
              className="flex items-center gap-2 px-4 py-3 rounded-xl"
              style={{ background: `${statusCfg.color}11`, border: `1px solid ${statusCfg.color}44` }}
            >
              <StatusIcon size={18} style={{ color: statusCfg.color }} />
              <span className="font-semibold text-sm capitalize" style={{ color: statusCfg.color }}>
                {statusCfg.label}
              </span>
            </div>
            <select
              id="update-status-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
              style={{
                background: "var(--color-bg-secondary, #0d0d0d)",
                border: "1px solid var(--color-border, #1e1e1e)",
                color: "var(--color-text-primary)",
              }}
            >
              {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
                <option key={val} value={val} style={{ background: "#111" }}>
                  {cfg.label}
                </option>
              ))}
            </select>
            <button
              id="confirm-status-update"
              onClick={handleStatusUpdate}
              disabled={updatingStatus || selectedStatus === selectedOrder.status}
              className="w-full py-2.5 rounded-xl text-sm font-bold transition-all duration-150 disabled:opacity-40 hover:scale-105"
              style={{
                background: "linear-gradient(135deg, var(--color-gold, #D4AF37), #F0D060)",
                color: "#0a0a0a",
              }}
            >
              {updatingStatus ? "Updating..." : "Confirm Update"}
            </button>
          </motion.div>

          {/* Customer Info */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl p-6 space-y-4"
            style={{
              background: "var(--color-bg-card, #111)",
              border: "1px solid var(--color-border, #1e1e1e)",
            }}
          >
            <div className="flex items-center gap-2">
              <User size={16} style={{ color: "var(--color-gold, #D4AF37)" }} />
              <h3 className="font-semibold" style={{ color: "var(--color-text-primary)" }}>
                Customer
              </h3>
            </div>
            <div className="space-y-2 text-sm">
              <p style={{ color: "var(--color-text-primary)", fontWeight: 600 }}>
                {selectedOrder.customerName || selectedOrder.user?.name || "Guest Customer"}
              </p>
              <p style={{ color: "var(--color-gold, #D4AF37)", fontWeight: 500 }}>
                📞 {selectedOrder.customerPhone || selectedOrder.user?.phone || "No phone provided"}
              </p>
              {selectedOrder.user?.email && !selectedOrder.user.email.endsWith("@timo.local") && (
                <p style={{ color: "var(--color-text-muted)" }}>{selectedOrder.user.email}</p>
              )}
            </div>
          </motion.div>

          {/* Shipping Address */}
          {selectedOrder.shippingAddress && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-2xl p-6 space-y-4"
              style={{
                background: "var(--color-bg-card, #111)",
                border: "1px solid var(--color-border, #1e1e1e)",
              }}
            >
              <div className="flex items-center gap-2">
                <MapPin size={16} style={{ color: "var(--color-gold, #D4AF37)" }} />
                <h3 className="font-semibold" style={{ color: "var(--color-text-primary)" }}>
                  Shipping Address
                </h3>
              </div>
              <div className="text-sm space-y-1" style={{ color: "var(--color-text-secondary)" }}>
                <p>{selectedOrder.shippingAddress.street}</p>
                <p>
                  {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.country}
                </p>
                {selectedOrder.shippingAddress.postalCode && (
                  <p>{selectedOrder.shippingAddress.postalCode}</p>
                )}
              </div>
            </motion.div>
          )}

          {/* Payment Info */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl p-6 space-y-4"
            style={{
              background: "var(--color-bg-card, #111)",
              border: "1px solid var(--color-border, #1e1e1e)",
            }}
          >
            <div className="flex items-center gap-2">
              <CreditCard size={16} style={{ color: "var(--color-gold, #D4AF37)" }} />
              <h3 className="font-semibold" style={{ color: "var(--color-text-primary)" }}>
                Payment
              </h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span style={{ color: "var(--color-text-muted)" }}>Method</span>
                <span
                  className="capitalize font-medium"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {selectedOrder.paymentMethod?.replace(/_/g, " ")}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--color-text-muted)" }}>Status</span>
                <span
                  className="font-medium"
                  style={{ color: selectedOrder.isPaid ? "#10B981" : "#F59E0B" }}
                >
                  {selectedOrder.isPaid ? "Paid" : "Unpaid"}
                </span>
              </div>
              {selectedOrder.paidAt && (
                <div className="flex justify-between">
                  <span style={{ color: "var(--color-text-muted)" }}>Paid at</span>
                  <span style={{ color: "var(--color-text-secondary)" }}>
                    {new Date(selectedOrder.paidAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Notes */}
          {selectedOrder.notes && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="rounded-2xl p-6"
              style={{
                background: "var(--color-bg-card, #111)",
                border: "1px solid var(--color-border, #1e1e1e)",
              }}
            >
              <h3 className="font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>
                Notes
              </h3>
              <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                {selectedOrder.notes}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
