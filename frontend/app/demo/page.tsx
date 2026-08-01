"use client";

import HolographicCard from "@/components/ui/holo-card";
import GradientButton from "@/components/ui/gradient-button";
import {
  ShoppingCart, Sparkles, ArrowRight, Star,
  Zap, Lock, Globe, ChevronRight
} from "lucide-react";
import { useState } from "react";

export default function HoloDemo() {
  const [loading, setLoading] = useState(false);

  const simulateLoad = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2200);
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "radial-gradient(ellipse at 20% 10%, #0d0820 0%, #050508 60%, #000000 100%)",
        padding: "80px 24px",
        fontFamily: "var(--font-body)",
      }}
    >
      {/* ── Hero header ──────────────────────────────────────────────────────── */}
      <div style={{ textAlign: "center", marginBottom: "72px" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          padding: "6px 16px", borderRadius: "999px",
          background: "rgba(212,168,83,0.08)",
          border: "1px solid rgba(212,168,83,0.2)",
          marginBottom: "20px",
        }}>
          <Sparkles size={12} style={{ color: "var(--color-gold)" }} />
          <span style={{ fontSize: "11px", letterSpacing: "0.1em", color: "var(--color-gold)", fontWeight: 600, textTransform: "uppercase" }}>
            Premium UI System
          </span>
        </div>

        <h1 style={{
          fontSize: "clamp(2.2rem, 5vw, 4rem)",
          fontFamily: "var(--font-heading)",
          fontWeight: 700,
          letterSpacing: "-0.02em",
          lineHeight: 1.1,
          marginBottom: "16px",
          background: "linear-gradient(135deg, #f5f0e8 0%, var(--color-gold-light) 40%, var(--color-gold) 70%, var(--color-text-secondary) 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}>
          Glass · Light · Depth
        </h1>

        <p style={{ color: "var(--color-text-secondary)", fontSize: "1.05rem", maxWidth: 480, margin: "0 auto", lineHeight: 1.7 }}>
          A holographic motion system built for premium products.<br />
          Hover everything — it reacts.
        </p>
      </div>

      {/* ── Section: Holographic Cards ───────────────────────────────────────── */}
      <section style={{ marginBottom: "80px" }}>
        <SectionLabel>Holographic Cards · 3D Tilt + Glow + Float</SectionLabel>

        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "32px", alignItems: "center" }}>

          {/* Card 1 — Cyan */}
          <HolographicCard
            imageUrl="https://images.unsplash.com/photo-1518779578993-ec3579fee39f?w=500&q=80"
            width="240px" height="340px"
            glowColor="rgba(0, 200, 255, 0.4)"
            holoColor1="rgba(0, 200, 255, 0.2)"
            holoColor2="rgba(60, 0, 255, 0.12)"
          />

          {/* Card 2 — Gold membership */}
          <HolographicCard
            width="240px" height="340px"
            glowColor="rgba(212, 168, 83, 0.55)"
            holoColor1="rgba(212, 168, 83, 0.18)"
            holoColor2="rgba(255, 100, 0, 0.12)"
          >
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", height: "100%", gap: "18px", padding: "28px 24px",
              background: "linear-gradient(160deg, #1a1408 0%, #0c0a06 100%)",
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: "50%",
                background: "linear-gradient(135deg, var(--color-gold-light), var(--color-gold-dark))",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.6rem", boxShadow: "0 0 32px rgba(212,168,83,0.5), 0 0 8px rgba(212,168,83,0.3) inset",
              }}>✦</div>

              <div style={{ textAlign: "center" }}>
                <p style={{
                  fontFamily: "var(--font-heading)", fontSize: "1.3rem", fontWeight: 700,
                  background: "linear-gradient(135deg, var(--color-gold-light), var(--color-gold))",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                  marginBottom: "4px",
                }}>Gold Tier</p>
                <p style={{ color: "var(--color-text-secondary)", fontSize: "0.78rem", letterSpacing: "0.06em" }}>EXCLUSIVE MEMBER</p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
                {["Priority access", "Early releases", "Free shipping"].map((f) => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Star size={10} style={{ color: "var(--color-gold)", flexShrink: 0 }} fill="currentColor" />
                    <span style={{ color: "var(--color-text-secondary)", fontSize: "0.75rem" }}>{f}</span>
                  </div>
                ))}
              </div>

              <div style={{
                marginTop: "4px", padding: "8px 20px", borderRadius: "8px",
                background: "linear-gradient(135deg, var(--color-gold), var(--color-gold-dark))",
                color: "#0a0a0a", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.08em",
                cursor: "pointer",
              }}>
                ACTIVATE
              </div>
            </div>
          </HolographicCard>

          {/* Card 3 — Pink/Purple */}
          <HolographicCard
            imageUrl="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&q=80"
            width="240px" height="340px"
            glowColor="rgba(255, 0, 180, 0.4)"
            holoColor1="rgba(255, 0, 180, 0.18)"
            holoColor2="rgba(100, 0, 255, 0.15)"
          />
        </div>
      </section>

      {/* ── Section: GradientButton ──────────────────────────────────────────── */}
      <section style={{ marginBottom: "80px" }}>
        <SectionLabel>Gradient Buttons · Glow + Shine + Micro-press</SectionLabel>

        {/* Variants */}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "16px", marginBottom: "32px" }}>
          <GradientButton variant="gold" iconLeft={ShoppingCart}>
            Add to Cart
          </GradientButton>

          <GradientButton variant="cyan" iconRight={ArrowRight}>
            Explore Now
          </GradientButton>

          <GradientButton variant="purple" iconLeft={Zap}>
            Upgrade Plan
          </GradientButton>

          <GradientButton variant="ghost" iconRight={ChevronRight}>
            Learn More
          </GradientButton>

          <GradientButton variant="danger">
            Delete Item
          </GradientButton>
        </div>

        {/* Sizes */}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "12px", marginBottom: "32px" }}>
          <GradientButton variant="gold" size="sm">Small</GradientButton>
          <GradientButton variant="gold" size="md">Medium</GradientButton>
          <GradientButton variant="gold" size="lg">Large</GradientButton>
        </div>

        {/* Loading state */}
        <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
          <GradientButton
            variant="gold"
            isLoading={loading}
            onClick={simulateLoad}
            iconLeft={Lock}
          >
            {loading ? "Processing…" : "Click to Load"}
          </GradientButton>

          <GradientButton variant="cyan" disabled iconLeft={Globe}>
            Disabled
          </GradientButton>
        </div>
      </section>

      {/* ── Section: Combined showcase ───────────────────────────────────────── */}
      <section>
        <SectionLabel>Product Card · Combined System</SectionLabel>

        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "28px" }}>
          {[
            {
              img:   "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80",
              name:  "Precision Watch",
              price: "$420",
              old:   "$580",
              glow:  "rgba(0,200,255,0.35)",
              h1:    "rgba(0,200,255,0.18)",
              h2:    "rgba(60,0,255,0.1)",
            },
            {
              img:   "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&q=80",
              name:  "Noir Fragrance",
              price: "$185",
              old:   "$230",
              glow:  "rgba(212,168,83,0.4)",
              h1:    "rgba(212,168,83,0.18)",
              h2:    "rgba(255,80,0,0.1)",
            },
          ].map((item) => (
            <HolographicCard
              key={item.name}
              width="220px" height="320px"
              glowColor={item.glow} holoColor1={item.h1} holoColor2={item.h2}
              tiltMax={12}
            >
              <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "var(--color-bg-card)" }}>
                {/* Image */}
                <div style={{ height: "55%", overflow: "hidden" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.img} alt={item.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    draggable={false}
                  />
                </div>

                {/* Info */}
                <div style={{ flex: 1, padding: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} size={9} fill="var(--color-gold)" style={{ color: "var(--color-gold)" }} />
                    ))}
                    <span style={{ fontSize: "10px", color: "var(--color-text-muted)", marginLeft: "4px" }}>48 reviews</span>
                  </div>

                  <p style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--color-text-primary)", lineHeight: 1.3 }}>
                    {item.name}
                  </p>

                  <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontSize: "10px", textDecoration: "line-through", color: "var(--color-text-muted)" }}>{item.old}</div>
                      <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--color-gold)" }}>{item.price}</div>
                    </div>
                    <GradientButton variant="gold" size="sm" iconLeft={ShoppingCart}>
                      Buy
                    </GradientButton>
                  </div>
                </div>
              </div>
            </HolographicCard>
          ))}
        </div>
      </section>

      {/* ── Footer hint ──────────────────────────────────────────────────────── */}
      <p style={{
        textAlign: "center", marginTop: "72px",
        color: "var(--color-text-muted)", fontSize: "0.72rem",
        letterSpacing: "0.1em", textTransform: "uppercase",
      }}>
        Hover · Click · Feel the depth
      </p>
    </main>
  );
}

// ── Helper ────────────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ textAlign: "center", marginBottom: "32px" }}>
      <span style={{
        fontSize: "10px", fontWeight: 700, letterSpacing: "0.14em",
        color: "var(--color-text-muted)", textTransform: "uppercase",
      }}>
        {children}
      </span>
      <div style={{ width: 40, height: 1, background: "var(--color-border-gold)", margin: "10px auto 0" }} />
    </div>
  );
}
