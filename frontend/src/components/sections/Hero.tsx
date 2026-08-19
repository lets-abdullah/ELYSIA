import React from 'react';
import { motion } from 'motion/react';


interface HeroProps {
  onNavigate: (page: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  return (
    <section className="relative w-full h-[85vh] min-h-[550px] flex items-center justify-center overflow-hidden bg-[#1A1A1A] text-white">
      {/* Background Video */}
      <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover z-0 opacity-60 brightness-90">
        <source src="/src/assets/hero-video.mp4" type="video/mp4" />
      </video>

      {/* Dark Subtle Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/60 z-10" />


      {/* Hero Minimal Content */}
      <div className="relative z-20 max-w-4xl mx-auto px-4 text-center space-y-6 pt-16">

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="font-serif text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-light text-white tracking-[0.2em] leading-tight uppercase"
        >
          ELYSIA
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xs sm:text-sm font-light text-[#DBDAD7] tracking-[0.35em] uppercase max-w-md mx-auto"
        >
          Luxury Hotel & Private Sanctuary
        </motion.p>


        {/* Book Now Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          onClick={() => {
            onNavigate('booking');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="
      pointer-events-auto
      mt-6
      px-10 py-4
      bg-[#C5B358]
      text-[#1A1A1A]
      text-xs
      uppercase
      tracking-[0.3em]
      font-semibold
      hover:bg-white
      transition-all
      duration-300
      cursor-pointer
    "
        >
          BOOK YOUR STAY
        </motion.button>

      </div>
    </section>
  );
};

