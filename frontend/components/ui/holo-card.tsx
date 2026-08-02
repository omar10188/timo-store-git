"use client";

import React, { useRef, useCallback, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface HolographicCardProps {
  imageUrl?:    string;
  children?:    React.ReactNode;
  width?:       string;
  height?:      string;
  glowColor?:   string;
  holoColor1?:  string;
  holoColor2?:  string;
  className?:   string;
  /** Tilt intensity 0–30deg, default 14 */
  tiltMax?:     number;
  /** Show floating idle animation */
  floatIdle?:   boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

const HolographicCard: React.FC<HolographicCardProps> = ({
  imageUrl,
  children,
  width      = "250px",
  height     = "350px",
  glowColor  = "rgba(212, 168, 83, 0.32)",   // gold focal glow
  holoColor1 = "rgba(212, 168, 83, 0.14)",   // gold foil tone
  holoColor2 = "rgba(28, 43, 82, 0.20)",     // navy depth tone
  className  = "",
  tiltMax    = 12,          // reduced from 14 — more restrained, premium
  floatIdle  = true,
}) => {
  const cardRef   = useRef<HTMLDivElement>(null);
  const glowRef   = useRef<HTMLDivElement>(null);
  const edgeRef   = useRef<HTMLDivElement>(null);
  const rafRef    = useRef<number | null>(null);
  const hoveredRef = useRef(false);

  // ── Idle float animation via CSS variable injection ──────────────────────────
  useEffect(() => {
    if (!floatIdle || !cardRef.current) return;
    cardRef.current.style.animation = "holo-float 5s ease-in-out infinite";
    return () => {
      if (cardRef.current) cardRef.current.style.animation = "";
    };
  }, [floatIdle]);

  // ── Mouse move: tilt + glow + edge lighting ──────────────────────────────────
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current || !glowRef.current || !edgeRef.current) return;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      rafRef.current = requestAnimationFrame(() => {
        const card = cardRef.current!;
        const glow = glowRef.current!;
        const edge = edgeRef.current!;
        const rect = card.getBoundingClientRect();

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const xNorm = x / rect.width  - 0.5;   // -0.5 → 0.5
        const yNorm = y / rect.height - 0.5;

        const tiltX = -(yNorm * tiltMax);
        const tiltY =  xNorm * tiltMax;

        card.style.animation = "none";           // pause idle float while hovering
        card.style.transform =
          `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.03,1.03,1.03)`;

        const xPct = `${(x / rect.width)  * 100}%`;
        const yPct = `${(y / rect.height) * 100}%`;

        // Radial glow following cursor
        glow.style.setProperty("--x",            xPct);
        glow.style.setProperty("--y",            yPct);
        glow.style.setProperty("--color-glow",   glowColor);
        glow.style.setProperty("--color-holo-1", holoColor1);
        glow.style.setProperty("--color-holo-2", holoColor2);
        glow.style.opacity = "1";

        // Edge lighting — brighter edge closest to cursor
        const edgeX = xNorm > 0 ? `${100 + xNorm * 60}%` : `${xNorm * 60}%`;
        const edgeY = yNorm > 0 ? `${100 + yNorm * 60}%` : `${yNorm * 60}%`;
        edge.style.background =
          `radial-gradient(ellipse at ${edgeX} ${edgeY}, rgba(255,255,255,0.06) 0%, transparent 65%)`;
        edge.style.opacity = "1";
      });
    },
    [glowColor, holoColor1, holoColor2, tiltMax]
  );

  // ── Mouse leave: spring back ─────────────────────────────────────────────────
  const handleMouseLeave = useCallback(() => {
    hoveredRef.current = false;
    if (!cardRef.current || !glowRef.current || !edgeRef.current) return;

    cardRef.current.style.transition =
      "transform 0.55s cubic-bezier(0.34,1.56,0.64,1)";
    cardRef.current.style.transform =
      "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)";

    if (floatIdle) {
      setTimeout(() => {
        if (!hoveredRef.current && cardRef.current) {
          cardRef.current.style.animation = "holo-float 5s ease-in-out infinite";
        }
      }, 560);
    }

    glowRef.current.style.opacity = "0";
    edgeRef.current.style.opacity = "0";
  }, [floatIdle]);

  const handleMouseEnter = useCallback(() => {
    hoveredRef.current = true;
    if (cardRef.current) {
      cardRef.current.style.transition = "transform 0.08s ease";
    }
  }, []);

  return (
    <div
      ref={cardRef}
      className={`holographic-card ${className}`}
      style={
        {
          "--card-width":      width,
          "--card-height":     height,
          "--holo-glow-color": glowColor,   // drives the box-shadow ring colour
        } as React.CSSProperties
      }
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      role="img"
      tabIndex={0}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      {/* ── Content layer ── */}
      <div className="holo-content">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt="Holographic card visual"
            className="holo-image"
            draggable={false}
          />
        ) : (
          children
        )}
      </div>

      {/* ── Readability gradient (bottom fade) — only when image ── */}
      {imageUrl && (
        <div
          aria-hidden="true"
          style={{
            position:   "absolute",
            inset:      0,
            zIndex:     1,
            background: "linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 55%)",
            pointerEvents: "none",
            borderRadius: "inherit",
          }}
        />
      )}

      {/* ── Holographic glow (cursor-tracked radial + linear foil) ── */}
      <div
        ref={glowRef}
        className="holo-glow"
        aria-hidden="true"
        style={
          {
            "--x":            "50%",
            "--y":            "50%",
            "--color-glow":   glowColor,
            "--color-holo-1": holoColor1,
            "--color-holo-2": holoColor2,
            opacity:    0,
            transition: "opacity 0.35s ease",
          } as React.CSSProperties
        }
      />

      {/* ── Edge lighting layer ── */}
      <div
        ref={edgeRef}
        aria-hidden="true"
        style={{
          position:      "absolute",
          inset:         0,
          zIndex:        4,
          pointerEvents: "none",
          borderRadius:  "inherit",
          opacity:       0,
          transition:    "opacity 0.35s ease",
        }}
      />

      {/* ── Specular shimmer ── */}
      <div className="holo-shine" aria-hidden="true" />

      {/* ── Border shimmer (subtle rainbow edge) ── */}
      <div className="holo-border" aria-hidden="true" />
    </div>
  );
};

export default HolographicCard;
