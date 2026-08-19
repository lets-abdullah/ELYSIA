import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronRight, User, LogIn } from 'lucide-react';
import { useScrollEffect } from '../../hooks/useScrollEffect';
import { useAuth } from '../../contexts/AuthContext';

interface NavbarProps {
  activePage: string;
  onNavigate: (page: string, roomId?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activePage, onNavigate }) => {
  const isScrolled = useScrollEffect(40);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, openAuthModal, openProfileModal } = useAuth();

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const handleLinkClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'rooms', label: 'Rooms' },
    { id: 'about', label: 'About Us' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'contact', label: 'Contact' },
  ];

  const isActive = (id: string) =>
    activePage === id || (id === 'rooms' && activePage === 'room-detail');

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-[#E5E5E5] py-3 shadow-sm'
          : 'bg-white/90 backdrop-blur-sm border-b border-[#E5E5E5]/60 py-3.5'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* ELYSIA Logo */}
          <button
            onClick={() => handleLinkClick('home')}
            className="text-left cursor-pointer focus:outline-none shrink-0"
          >
            <span className="font-serif text-xl sm:text-2xl lg:text-3xl font-light tracking-[0.25em] text-[#1A1A1A] uppercase leading-none">
              ELYSIA
            </span>
          </button>

          {/* Center Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-10">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                className={`text-xs uppercase tracking-[0.18em] transition-colors relative py-1 cursor-pointer font-sans whitespace-nowrap ${isActive(link.id)
                  ? 'text-[#1A1A1A] font-semibold border-b-2 border-[#1A1A1A]'
                  : 'text-[#5F5E5E] hover:text-[#1A1A1A]'
                  }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right: Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-3 shrink-0">
            {isAuthenticated && user ? (
              <button
                onClick={() => handleLinkClick('profile')}
                className={`px-4 py-2 border text-[11px] uppercase tracking-[0.15em] font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                  activePage === 'profile'
                    ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                    : 'bg-[#FAF9F6] border-[#C5B358]/60 text-[#1A1A1A] hover:bg-[#C5B358] hover:text-[#1A1A1A]'
                }`}
              >
                <User className="w-3.5 h-3.5 text-[#C5B358]" />
                <span>My Profile</span>
              </button>
            ) : (
              <button
                onClick={() => handleLinkClick('auth')}
                className={`px-4 py-2 border text-[11px] uppercase tracking-[0.15em] font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activePage === 'auth' || activePage === 'login' || activePage === 'register'
                    ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                    : 'border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            <button
              onClick={() => handleLinkClick('booking')}
              className="px-5 py-2.5 bg-[#1A1A1A] text-white text-[11px] uppercase tracking-[0.2em] font-semibold hover:bg-[#C5B358] hover:text-[#1A1A1A] transition-colors cursor-pointer whitespace-nowrap"
            >
              BOOK NOW
            </button>
          </div>

          {/* Mobile Controls */}
          <div className="flex items-center gap-2 lg:hidden">
            {isAuthenticated ? (
              <button
                onClick={openProfileModal}
                className="px-2.5 py-1.5 border border-[#C5B358] text-[#1A1A1A] text-[10px] uppercase font-semibold flex items-center gap-1"
              >
                <User className="w-3 h-3 text-[#C5B358]" /> Profile
              </button>
            ) : (
              <button
                onClick={() => openAuthModal('login')}
                className="px-2.5 py-1.5 border border-[#1A1A1A] text-[#1A1A1A] text-[10px] uppercase font-semibold flex items-center gap-1"
              >
                <LogIn className="w-3 h-3" /> Sign In
              </button>
            )}
            <button
              onClick={() => handleLinkClick('booking')}
              className="px-3 py-1.5 bg-[#1A1A1A] text-white text-[10px] uppercase tracking-[0.15em] font-semibold hover:bg-[#C5B358] hover:text-[#1A1A1A] transition-colors whitespace-nowrap"
            >
              BOOK NOW
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-9 h-9 flex items-center justify-center text-[#1A1A1A] border border-[#E5E5E5] hover:bg-[#F5F5F0] transition-colors cursor-pointer"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-all duration-300 ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/40"
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Slide-in Panel */}
        <div
          className={`absolute top-0 right-0 h-full w-[280px] sm:w-[320px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
        >
          {/* Panel Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E5E5]">
            <span className="font-serif text-lg tracking-[0.25em] text-[#1A1A1A] uppercase">ELYSIA</span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="w-8 h-8 flex items-center justify-center text-[#1A1A1A] hover:bg-[#F5F5F0] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 overflow-y-auto py-4">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                className={`w-full flex items-center justify-between px-6 py-4 text-left text-sm font-sans tracking-wider border-b border-[#F0F0F0] transition-colors ${isActive(link.id)
                  ? 'text-[#C5B358] font-semibold bg-[#FAF9F6]'
                  : 'text-[#1A1A1A] hover:bg-[#FAF9F6]'
                  }`}
              >
                <span className="uppercase text-xs tracking-[0.2em]">{link.label}</span>
                <ChevronRight className="w-4 h-4 text-[#AAAAAA]" />
              </button>
            ))}
          </nav>

          {/* Bottom actions */}
          <div className="p-5 border-t border-[#E5E5E5] space-y-3">
            {isAuthenticated ? (
              <button
                onClick={() => handleLinkClick('profile')}
                className="w-full py-3 border border-[#C5B358] text-[#1A1A1A] text-xs uppercase tracking-[0.2em] font-semibold text-center hover:bg-[#C5B358] transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <User className="w-4 h-4 text-[#C5B358]" /> MY PROFILE & BOOKINGS
              </button>
            ) : (
              <button
                onClick={() => handleLinkClick('auth')}
                className="w-full py-3 border border-[#1A1A1A] text-[#1A1A1A] text-xs uppercase tracking-[0.2em] font-semibold text-center hover:bg-[#1A1A1A] hover:text-white transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" /> SIGN IN / REGISTER
              </button>
            )}

            <button
              onClick={() => handleLinkClick('booking')}
              className="w-full py-3.5 bg-[#1A1A1A] text-white text-xs uppercase tracking-[0.2em] font-semibold text-center hover:bg-[#C5B358] hover:text-[#1A1A1A] transition-colors"
            >
              BOOK NOW
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
