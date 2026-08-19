import React from 'react';
import { motion } from 'motion/react';


interface HeroProps {
  onNavigate: (page: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  return (
    <section className="relative w-full h-[88vh] min-h-145 max-h-270 flex items-center justify-center overflow-hidden bg-[#0F0F0F] text-white">
      {/* ── Background Video with Fallback Poster ── */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1920&q=80"
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-95 scale-105 transition-transform duration-1000 ease-out pointer-events-none"
      >
        <source src="/hero-video.mp4" type="video/mp4" />
        <source src="/src/assets/hero-video.mp4" type="video/mp4" />
      </video>

      {/* ── Multi-Layer Luxury Dark & Gold Vignette Overlay ── */}
      <div className="absolute inset-0 bg-linear-to-b from-black/70 via-black/45 to-black/80 z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)] z-10" />

      {/* ── Hero Content (Centered & Legible) ── */}
      <div className="relative z-20 max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6 pt-12 sm:pt-16">

        {/* Subtle Luxury Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 border border-[#C5B358]/40 backdrop-blur-md text-[10px] uppercase tracking-[0.28em] text-[#E5D580] font-medium shadow-lg"
        >
          <span>Private Sanctuary & Bespoke Suites</span>
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-serif text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-light text-white tracking-[0.22em] leading-tight uppercase drop-shadow-2xl"
        >
          ELYSIA
        </motion.h1>

        {/* Hero Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="text-xs sm:text-sm md:text-base font-light text-stone-200 tracking-[0.32em] uppercase max-w-lg mx-auto drop-shadow-md"
        >
          Luxury Hotel & Private Sanctuary
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={() => {
              onNavigate('booking');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="w-full sm:w-auto px-9 py-4 bg-[#C5B358] text-[#1A1A1A] text-xs uppercase tracking-[0.25em] font-bold hover:bg-white hover:text-black transition-all duration-300 shadow-xl cursor-pointer"
          >
            Book Your Stay
          </button>
          <button
            onClick={() => {
              onNavigate('rooms');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="w-full sm:w-auto px-8 py-4 bg-black/40 border border-white/30 text-white text-xs uppercase tracking-[0.25em] font-semibold hover:bg-white/10 hover:border-white transition-all duration-300 backdrop-blur-sm cursor-pointer"
          >
            Explore Residences
          </button>
        </motion.div>

      </div>
    </section>
  );
};

