'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useAnimation } from 'framer-motion';
import { FaWhatsapp } from 'react-icons/fa';

interface LuxuryWhatsAppButtonProps {
  onClick?: () => void;
  text?: string;
  className?: string;
  fullWidth?: boolean;
}

export default function LuxuryWhatsAppButton({
  onClick,
  text = "Order via WhatsApp",
  className = "",
  fullWidth = true,
}: LuxuryWhatsAppButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // Interaction states
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [hasHoveredOnce, setHasHoveredOnce] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  
  const shineControls = useAnimation();

  useEffect(() => {
    setIsTouchDevice(!window.matchMedia('(hover: hover)').matches);
  }, []);

  // Framer motion values for magnetic effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Magnetic & Rotation Springs (Higher damping for smoothness, ±6px max)
  const springConfig = { stiffness: 120, damping: 25, mass: 0.1 };
  const magneticX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), springConfig);
  const magneticY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-6, 6]), springConfig);
  
  // Rotate based on cursor position (±4 degrees)
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [4, -4]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-4, 4]), springConfig);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (isTouchDevice || !buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const x = (e.clientX - centerX) / rect.width;
      const y = (e.clientY - centerY) / rect.height;
      
      mouseX.set(x);
      mouseY.set(y);
    },
    [mouseX, mouseY, isTouchDevice]
  );

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsPressed(false);
    if (!isTouchDevice) {
      mouseX.set(0);
      mouseY.set(0);
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (!hasHoveredOnce && !isTouchDevice) {
      setHasHoveredOnce(true);
      shineControls.start({
        x: ["-100%", "200%"],
        transition: { duration: 0.45, ease: "easeInOut" }
      });
    }
  };

  return (
    <motion.button
      ref={buttonRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      onTouchCancel={() => setIsPressed(false)}
      
      initial={{ scale: 1, filter: "brightness(1)" }}
      animate={{
        scale: isPressed ? 0.96 : 1,
        filter: isPressed ? "brightness(0.92)" : "brightness(1)",
        boxShadow: isPressed
          ? "0px 4px 12px rgba(0,0,0,0.3), inset 0px 2px 4px rgba(0,0,0,0.2)"
          : "0 12px 40px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.2)",
      }}
      transition={{ 
        type: "spring", 
        stiffness: 400, 
        damping: 30, // Highly damped for non-bouncy, expensive feel
      }}
      className={`
        relative overflow-hidden flex items-center justify-center gap-2.5 
        rounded-xl px-6 py-4 text-white
        bg-gradient-to-r from-[#d4a853] to-[#b8923f] 
        touch-manipulation select-none outline-none
        ${fullWidth ? 'w-full' : 'w-auto'} 
        ${className}
      `}
      style={{
        x: isTouchDevice ? 0 : magneticX,
        y: isTouchDevice ? 0 : magneticY,
        rotateX: isTouchDevice ? 0 : rotateX,
        rotateY: isTouchDevice ? 0 : rotateY,
        transformPerspective: 800,
      }}
    >
      {/* Subtle Noise Texture Overlay */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          opacity: 0.04,
        }}
      />

      {/* Smarter, Thinner Shine (Triggers once) */}
      <motion.div
        initial={{ x: "-100%" }}
        animate={shineControls}
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)",
          transform: "skewX(-20deg)",
          width: "30%", // Thinner shine
        }}
      />

      {/* Content */}
      <motion.div 
        className="relative z-20 flex items-center justify-center gap-2.5 transition-all duration-500"
        animate={{ scale: isHovered && !isTouchDevice ? 1.02 : 1 }}
        style={{ filter: isHovered && !isTouchDevice ? "brightness(1.08)" : "brightness(1)" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <FaWhatsapp 
          className="drop-shadow-sm" 
          style={{ fontSize: '1.15rem', opacity: 0.95, color: '#25D366' }} 
        />
        <span 
          className="font-serif font-medium tracking-wide text-[0.95rem]"
          style={{
            textShadow: "0px 1px 2px rgba(0,0,0,0.15)",
          }}
        >
          {text}
        </span>
      </motion.div>
    </motion.button>
  );
}
