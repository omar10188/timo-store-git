"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mail, CheckCircle, Truck, AlertCircle } from "lucide-react";
import { settingsAPI } from "@/lib/api";

// I'll build a custom switch inline to ensure it works without external dependencies if Shadcn isn't fully installed
const CustomSwitch = ({ checked, onChange, disabled = false }: { checked: boolean, onChange: (c: boolean) => void, disabled?: boolean }) => (
  <div 
    onClick={() => !disabled && onChange(!checked)}
    className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${checked ? "bg-[var(--color-gold)]" : "bg-[var(--color-border)]"}`}
  >
    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${checked ? "translate-x-6" : ""}`} />
  </div>
);

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    enabled: true,
    orderConfirmation: true,
    statusUpdates: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchSettings = async () => {
    try {
      const { data } = await settingsAPI.getEmailSettings();
      setSettings(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: boolean) => {
    try {
      setSaving(true);
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings); // Optimistic UI update

      await settingsAPI.updateEmailSettings({ [key]: value });
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
      // Revert on error
      fetchSettings();
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: 'var(--color-gold)' }} />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-heading)' }}>
          Email Settings
        </h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Control and manage all automated transactional emails sent to your customers.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-500 mb-8">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      <div className="flex flex-col gap-8 max-w-3xl">
        {/* Global Master Switch */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl flex items-center justify-between"
          style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'var(--color-gold-muted)', color: 'var(--color-gold)' }}>
              <Mail size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>Master Email Switch</h3>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                Enable or disable ALL transactional emails globally. If disabled, no emails will be sent.
              </p>
            </div>
          </div>
          <CustomSwitch 
            checked={settings.enabled} 
            onChange={(c) => updateSetting("enabled", c)} 
          />
        </motion.div>

        {/* Specific Email Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl overflow-hidden shadow-sm"
          style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
        >
          <div className="p-8 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <h3 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>Email Modules</h3>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
              Configure specific email triggers individually.
            </p>
          </div>

          <div className="p-8 flex items-center justify-between border-b" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-green-500/10 text-green-500 shrink-0">
                <CheckCircle size={24} />
              </div>
              <div>
                <h4 className="text-lg font-medium" style={{ color: 'var(--color-text-primary)' }}>Order Confirmation</h4>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                  Sent automatically when a customer completes checkout.
                </p>
              </div>
            </div>
            <CustomSwitch 
              checked={settings.orderConfirmation} 
              onChange={(c) => updateSetting("orderConfirmation", c)} 
              disabled={!settings.enabled}
            />
          </div>

          <div className="p-8 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-500/10 text-blue-500 shrink-0">
                <Truck size={24} />
              </div>
              <div>
                <h4 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Status Updates</h4>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                  Sent when you update an order to Shipped, Delivered, etc.
                </p>
              </div>
            </div>
            <CustomSwitch 
              checked={settings.statusUpdates} 
              onChange={(c) => updateSetting("statusUpdates", c)} 
              disabled={!settings.enabled}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
