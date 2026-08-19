import React, { useState } from 'react';
import { Instagram, Facebook, Twitter, LayoutGrid, CheckCircle2 } from 'lucide-react';


interface FooterProps {
  onNavigate: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNav = (page: string) => {
    onNavigate(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-black text-white pt-16 pb-12 border-t border-neutral-900 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Main 3-Column Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-16 items-start">

          {/* Left Column: Brand Logo, Description & Social Icons */}
          <div className="md:col-span-5 space-y-5">
            {/* Logo with Square Grid Icon */}
            <button
              onClick={() => handleNav('home')}
              className="flex items-center gap-3 group text-left cursor-pointer focus:outline-none"
            >
              <div className="w-9 h-9 bg-white text-black flex items-center justify-center rounded-sm transition-transform group-hover:scale-105">
                <LayoutGrid className="w-5 h-5 text-black" />
              </div>
              <span className="font-serif text-2xl tracking-[0.25em] font-light text-white uppercase">
                ELYSIA
              </span>
            </button>

            {/* Description Text */}
            <p className="text-neutral-400 text-sm font-light leading-relaxed max-w-md">
              Elysia empowers travelers to discover and book the world’s most exclusive luxury stays with seamless precision and refined elegance.
            </p>

            {/* Social Media Buttons (Insta, FB, Twitter) */}
            <div className="flex items-center space-x-4 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white hover:border-[#C5B358] hover:bg-neutral-800 transition-all cursor-pointer"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white hover:border-[#C5B358] hover:bg-neutral-800 transition-all cursor-pointer"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter / X"
                className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white hover:border-[#C5B358] hover:bg-neutral-800 transition-all cursor-pointer"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Center Column: Quick Links (Positioned in Center of Footer) */}
          <div className="md:col-span-3 space-y-4 md:text-left flex flex-col md:items-start items-center">
            <h4 className="text-xs uppercase tracking-[0.25em] font-semibold text-white">
              QUICK LINKS
            </h4>
            <ul className="space-y-3 text-sm font-light text-neutral-400 md:text-left text-center">
              <li>
                <button
                  onClick={() => handleNav('rooms')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Rooms
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('about')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('gallery')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Gallery
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('contact')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Right Column: Stay Updated Form */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="text-xs uppercase tracking-[0.25em] font-semibold text-white">
              STAY UPDATED
            </h4>
            <p className="text-neutral-400 text-xs font-light leading-relaxed">
              Receive exclusive offers and news from Elysia.
            </p>

            {subscribed ? (
              <div className="flex items-center gap-2 p-3 bg-neutral-900 border border-[#C5B358]/40 text-[#C5B358] text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Thank you for subscribing to Elysia updates.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-4 pt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full bg-transparent border-b border-neutral-700 text-sm text-white placeholder-neutral-500 pb-2.5 outline-none focus:border-[#C5B358] transition-colors"
                />
                <button
                  type="submit"
                  className="w-full py-3.5 bg-white text-black hover:bg-[#C5B358] text-xs uppercase tracking-[0.25em] font-semibold transition-colors cursor-pointer"
                >
                  SUBSCRIBE
                </button>
              </form>
            )}
          </div>

        </div>

        {/* Bottom Legal & Copyright Bar */}
        <div className="pt-8 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-light text-neutral-400">
          <p>© {new Date().getFullYear()} Elysia. All rights reserved.</p>
          <div className="flex items-center space-x-6">
            <button
              onClick={() => handleNav('privacy')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => handleNav('terms')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
