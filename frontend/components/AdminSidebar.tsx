"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingBag, Tags, Users, Package } from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Coupons", href: "/admin/coupons", icon: Tags },
  { name: "Users", href: "/admin/users", icon: Users },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div
      className="w-64 min-h-screen p-6 flex flex-col gap-8 hidden md:flex"
      style={{
        background: 'var(--color-bg-secondary)',
        borderRight: '1px solid var(--color-border-gold)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, var(--color-gold), var(--color-gold-light))' }}
        >
          <span style={{ color: 'var(--color-bg)', fontWeight: 700, fontSize: '1.25rem' }}>T</span>
        </div>
        <h1
          className="text-2xl font-bold bg-clip-text text-transparent"
          style={{ backgroundImage: 'linear-gradient(135deg, var(--color-gold), var(--color-gold-light))' }}
        >
          Admin
        </h1>
      </div>

      <nav className="flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link key={item.name} href={item.href}>
              <motion.div
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300"
                style={isActive ? {
                  background: 'var(--color-gold-muted)',
                  color: 'var(--color-gold)',
                  border: '1px solid var(--color-border-gold)',
                  boxShadow: 'var(--shadow-gold)',
                } : {
                  color: 'var(--color-text-secondary)',
                  border: '1px solid transparent',
                }}
              >
                <item.icon
                  size={20}
                  style={{ color: isActive ? 'var(--color-gold)' : 'var(--color-text-muted)' }}
                />
                <span className="font-medium">{item.name}</span>
              </motion.div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
