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
  fullWidth = false,
}: LuxuryWhatsAppButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  
  const shineControls = useAnimation();

  useEffect(() => {
    setIsTouchDevice(!window.matchMedia('(hover: hover)').matches);
  }, []);

  // Periodic shimmer light sweep every 3.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      shineControls.start({
        x: ["-100%", "250%"],
        transition: { duration: 1.2, ease: "easeInOut" }
      });
    }, 3500);
    return () => clearInterval(interval);
  }, [shineControls]);

  // Framer motion values for magnetic 3D tilt effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 140, damping: 22, mass: 0.1 };
  const magneticX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), springConfig);
  const magneticY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-8, 8]), springConfig);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), springConfig);

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
    shineControls.start({
      x: ["-100%", "250%"],
      transition: { duration: 0.8, ease: "easeInOut" }
    });
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
      
      initial={{ scale: 1 }}
      animate={{
        scale: isPressed ? 0.95 : isHovered ? 1.05 : 1,
        boxShadow: isHovered
          ? "0 0 35px rgba(212, 168, 83, 0.5), inset 0 0 15px rgba(212, 168, 83, 0.2)"
          : "0 0 20px rgba(212, 168, 83, 0.3), inset 0 0 10px rgba(255, 255, 255, 0.05)",
      }}
      transition={{ 
        type: "spring", 
        stiffness: 350, 
        damping: 25,
      }}
      className={`
        relative overflow-hidden flex items-center justify-center gap-3 
        rounded-full px-7 py-3.5 
        bg-gradient-to-r from-[#0d0e12] via-[#181920] to-[#0d0e12]
        border border-[rgba(212,168,83,0.45)]
        touch-manipulation select-none outline-none cursor-pointer
        backdrop-blur-md shadow-2xl transition-all duration-300
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
          opacity: 0.05,
        }}
      />

      {/* Shimmer Light Sweep */}
      <motion.div
        initial={{ x: "-100%" }}
        animate={shineControls}
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(212,168,83,0.35), transparent)",
          transform: "skewX(-20deg)",
          width: "40%",
        }}
      />

      {/* Content */}
      <div className="relative z-20 flex items-center justify-center gap-2.5">
        {/* Toned-down luxury green WhatsApp icon */}
        <div className="w-7 h-7 rounded-full bg-[rgba(37,211,102,0.15)] border border-[rgba(37,211,102,0.3)] flex items-center justify-center shrink-0">
          <FaWhatsapp 
            className="drop-shadow-sm" 
            style={{ fontSize: '1.15rem', color: '#25D366' }} 
          />
        </div>

        {/* Elegant typography with subtle gold gradient */}
        <span 
          className="font-serif font-bold tracking-wide text-sm sm:text-base bg-clip-text text-transparent bg-gradient-to-r from-white via-[#f0ece4] to-[#D4AF37]"
          style={{
            textShadow: "0 2px 10px rgba(0,0,0,0.5)",
          }}
        >
          {text}
        </span>
      </div>
    </motion.button>
  );
}
