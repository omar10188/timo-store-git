"use client";

import React, { useRef, useCallback } from "react";
import { Loader2, LucideIcon } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ButtonVariant = "gold" | "navy" | "ghost" | "danger";
type ButtonSize    = "sm" | "md" | "lg";

interface GradientButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:    ButtonVariant;
  size?:       ButtonSize;
  isLoading?:  boolean;
  iconLeft?:   LucideIcon;
  iconRight?:  LucideIcon;
  fullWidth?:  boolean;
  children:    React.ReactNode;
}

// ─── Variant palettes ─────────────────────────────────────────────────────────

const VARIANTS: Record<
  ButtonVariant,
  { grad: string; glow: string; text: string; border: string }
> = {
  gold: {
    grad:   "linear-gradient(135deg, #e8c97a 0%, #d4a853 45%, #b8892f 100%)",
    glow:   "rgba(212, 168, 83, 0.42)",
    text:   "#0a0b10",
    border: "rgba(232, 201, 122, 0.38)",
  },
  navy: {
    grad:   "linear-gradient(135deg, #2f3e7a 0%, #1c2b52 50%, #16213f 100%)",
    glow:   "rgba(28, 43, 82, 0.55)",
    text:   "rgba(200, 196, 188, 0.90)",
    border: "rgba(47, 62, 122, 0.45)",
  },
  ghost: {
    grad:   "transparent",
    glow:   "rgba(212, 168, 83, 0.18)",
    text:   "var(--color-gold)",
    border: "var(--color-border-gold)",
  },
  danger: {
    grad:   "linear-gradient(135deg, #ff6b6b 0%, #e05c5c 40%, #b83232 100%)",
    glow:   "rgba(224, 92, 92, 0.42)",
    text:   "#ffffff",
    border: "rgba(255, 107, 107, 0.32)",
  },
};

const SIZES: Record<ButtonSize, { padding: string; font: string; iconSize: number; radius: string }> = {
  sm: { padding: "0.45rem 1rem",    font: "0.75rem", iconSize: 14, radius: "10px" },
  md: { padding: "0.65rem 1.4rem",  font: "0.85rem", iconSize: 16, radius: "12px" },
  lg: { padding: "0.85rem 1.9rem",  font: "0.95rem", iconSize: 18, radius: "14px" },
};

// ─── Component ────────────────────────────────────────────────────────────────

const GradientButton: React.FC<GradientButtonProps> = ({
  variant   = "gold",
  size      = "md",
  isLoading = false,
  iconLeft:  IconLeft,
  iconRight: IconRight,
  fullWidth = false,
  children,
  disabled,
  className = "",
  style,
  onMouseEnter,
  onMouseLeave,
  onMouseDown,
  onMouseUp,
  onFocus,
  onBlur,
  ...rest
}) => {
  const btnRef  = useRef<HTMLButtonElement>(null);
  const shineRef = useRef<HTMLSpanElement>(null);
  const rafRef  = useRef<number | null>(null);

  const v = VARIANTS[variant];
  const s = SIZES[size];
  const isDisabled = disabled || isLoading;

  // ── Cursor-tracking shine ──
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (isDisabled || !shineRef.current || !btnRef.current) return;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const rect = btnRef.current!.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        shineRef.current!.style.background =
          `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.18) 0%, transparent 65%)`;
      });
    },
    [isDisabled]
  );

  // ── Hover: scale up + glow ──
  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!isDisabled && btnRef.current) {
        btnRef.current.style.transform = "scale(1.035) translateY(-1px)";
        btnRef.current.style.boxShadow = `0 8px 28px ${v.glow}, 0 0 0 1px ${v.border} inset`;
      }
      onMouseEnter?.(e);
    },
    [isDisabled, v.glow, v.border, onMouseEnter]
  );

  const handleMouseLeave = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (btnRef.current) {
        btnRef.current.style.transform = "scale(1) translateY(0)";
        btnRef.current.style.boxShadow = `0 2px 12px ${v.glow.replace("0.45", "0.2")}, 0 0 0 1px ${v.border} inset`;
        if (shineRef.current) shineRef.current.style.background = "none";
      }
      onMouseLeave?.(e);
    },
    [v.glow, v.border, onMouseLeave]
  );

  // ── Click: micro-press ──
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!isDisabled && btnRef.current) {
        btnRef.current.style.transform = "scale(0.968) translateY(1px)";
        btnRef.current.style.boxShadow = `0 2px 10px ${v.glow.replace("0.45", "0.25")}`;
      }
      onMouseDown?.(e);
    },
    [isDisabled, v.glow, onMouseDown]
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!isDisabled && btnRef.current) {
        btnRef.current.style.transform = "scale(1.035) translateY(-1px)";
        btnRef.current.style.boxShadow = `0 8px 28px ${v.glow}, 0 0 0 1px ${v.border} inset`;
      }
      onMouseUp?.(e);
    },
    [isDisabled, v.glow, v.border, onMouseUp]
  );

  // ── Focus ring — navy-tinted, not gold ──
  const handleFocus = useCallback(
    (e: React.FocusEvent<HTMLButtonElement>) => {
      if (btnRef.current) {
        // Navy focus ring for accessibility — gold is reserved for interactions
        btnRef.current.style.outline = `2px solid rgba(47,62,122,0.85)`;
        btnRef.current.style.outlineOffset = "3px";
      }
      onFocus?.(e);
    },
    [onFocus]
  );

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLButtonElement>) => {
      if (btnRef.current) {
        btnRef.current.style.outline = "none";
      }
      onBlur?.(e);
    },
    [onBlur]
  );

  const baseBoxShadow =
    variant === "ghost"
      ? `0 0 0 1px ${v.border} inset`
      : `0 2px 12px ${v.glow.replace("0.45", "0.2")}, 0 0 0 1px ${v.border} inset`;

  return (
    <button
      ref={btnRef}
      disabled={isDisabled}
      className={`gb-root ${className}`}
      style={{
        /* layout */
        display:        "inline-flex",
        alignItems:     "center",
        justifyContent: "center",
        gap:            "0.5rem",
        width:          fullWidth ? "100%" : undefined,
        padding:        s.padding,
        borderRadius:   s.radius,
        border:         "none",
        /* typography */
        fontFamily:     "var(--font-body)",
        fontSize:       s.font,
        fontWeight:     600,
        letterSpacing:  "0.04em",
        color:          v.text,
        whiteSpace:     "nowrap",
        /* background + animation */
        background:     v.grad,
        backgroundSize: variant === "ghost" ? undefined : "200% 200%",
        /* shadows */
        boxShadow:      baseBoxShadow,
        /* motion */
        transition:     "transform 0.38s cubic-bezier(0.16,1,0.3,1), box-shadow 0.38s cubic-bezier(0.16,1,0.3,1), opacity 0.25s ease",
        willChange:     "transform, box-shadow",
        /* misc */
        cursor:         isDisabled ? "not-allowed" : "pointer",
        opacity:        isDisabled ? 0.5 : 1,
        userSelect:     "none",
        position:       "relative",
        overflow:       "hidden",
        isolation:      "isolate",
        ...style,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...rest}
    >
      {/* Animated gradient shift layer */}
      {variant !== "ghost" && (
        <span
          aria-hidden="true"
          style={{
            position:   "absolute",
            inset:      0,
            background: v.grad,
            backgroundSize: "300% 300%",
            animation:  "gb-grad-shift 4s ease infinite",
            opacity:    0.6,
            zIndex:     0,
            mixBlendMode: "overlay",
          }}
        />
      )}

      {/* Inner glass highlight (top edge) */}
      <span
        aria-hidden="true"
        style={{
          position:     "absolute",
          top:          0,
          left:         "8%",
          right:        "8%",
          height:       "1px",
          background:   "rgba(255,255,255,0.35)",
          borderRadius: "0 0 4px 4px",
          zIndex:       2,
        }}
      />

      {/* Cursor-tracking shine */}
      <span
        ref={shineRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          inset:    0,
          zIndex:   3,
          transition: "background 0.1s ease",
          pointerEvents: "none",
        }}
      />

      {/* Content */}
      <span style={{ position: "relative", zIndex: 4, display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
        {isLoading ? (
          <Loader2 size={s.iconSize} style={{ animation: "gb-spin 0.9s linear infinite" }} />
        ) : (
          IconLeft && <IconLeft size={s.iconSize} />
        )}
        {children}
        {!isLoading && IconRight && <IconRight size={s.iconSize} />}
      </span>
    </button>
  );
};

export default GradientButton;
