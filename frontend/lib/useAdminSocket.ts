"use client";

import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { connectAdminSocket, disconnectSocket } from "@/lib/socket";
import { useAdminStore } from "@/lib/store/adminStore";

/**
 * Custom hook that connects to Socket.io admin room and listens for real-time events.
 * Must be used inside an admin layout component.
 */
export const useAdminSocket = () => {
  const { addOrder, syncOrderStatus } = useAdminStore();

  useEffect(() => {
    const socket = connectAdminSocket();

    // Listen for new orders
    socket.on("new-order", (order: any) => {
      // Add to store
      addOrder(order);

      // Play notification sound (simple beep via AudioContext)
      try {
        const ctx = new AudioContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(880, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.5);
      } catch {
        // AudioContext may not be available — skip silently
      }

      // Show toast notification
      toast.success(
        `🔥 New Order! ${order.customerName} — $${Number(order.totalPrice).toFixed(2)}`,
        {
          duration: 6000,
          position: "top-right",
          style: {
            background: "#1a1400",
            color: "#D4AF37",
            border: "1px solid #D4AF37",
            fontWeight: 600,
          },
          icon: "🔥",
        }
      );
    });

    // Listen for order status updates
    socket.on("order-updated", (data: { _id: string; status: string; previousStatus: string }) => {
      syncOrderStatus(data._id, data.status);
      toast(`📦 Order #${String(data._id).slice(-6)} → ${data.status}`, {
        duration: 4000,
        position: "top-right",
      });
    });

    socket.on("connect_error", (err: Error) => {
      console.warn("Socket connection error:", err.message);
    });

    return () => {
      socket.off("new-order");
      socket.off("order-updated");
      socket.off("connect_error");
      disconnectSocket();
    };
  }, [addOrder, syncOrderStatus]);
};
