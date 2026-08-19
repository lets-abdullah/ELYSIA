import React, { useState } from 'react';
import { Hero } from '../components/sections/Hero';
import { ROOMS_DATA } from '../data/roomsData';
import { Room } from '../types';
import { FadeInUp } from '../components/common/FadeInUp';

import {
  Sparkles, Award, ShieldCheck, Anchor, Compass, Flame, Coffee,
  ChevronDown, ChevronUp, Star, PhoneCall, ArrowRight, Utensils
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: string, roomId?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const roomsList = ROOMS_DATA;
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleOpenDetails = (room: Room) => {
    onNavigate('room-detail', room.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const faqs = [
    {
      q: 'What are the check-in and check-out times at Elysia?',
      a: 'Standard check-in begins at 3:00 PM and check-out is at 12:00 PM noon. Guaranteed early check-in and late departure can be arranged seamlessly by your dedicated private butler.'
    },
    {
      q: 'Are airport chauffeur transfers included with room reservations?',
      a: 'Yes, complimentary Rolls-Royce airport transfers to and from Nice Côte d’Azur Airport (NCE) or the private helipad are included for all Suite, Villa, and Penthouse bookings.'
    },
    {
      q: 'How does the 24/7 Dedicated Butler Service operate?',
      a: 'Upon confirmation, you are assigned a certified Clefs d’Or Butler who assists with unpacking, custom dining arrangements, private yacht charters, and in-suite spa rituals throughout your stay.'
    },
    {
      q: 'Can private dining or custom chef menus be requested in advance?',
      a: 'Absolutely. Executive Chef Antoine Laurent and our sommelier team curate bespoke multi-course menus tailored to dietary preferences, private terrace events, or wine cellar tastings.'
    }
  ];

  return (
    <div className="bg-[#FAF9F6] text-[#1A1A1A] space-y-12 lg:space-y-16 pb-20">
      {/* 1. Hero Section */}
      <Hero onNavigate={onNavigate} />

      {/* 3. Accommodations - Featured Residences */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <FadeInUp className="text-center space-y-2">
          <span className="text-[11px] uppercase tracking-[0.3em] text-[#5F5E5E] font-medium">
            ACCOMMODATIONS
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#1A1A1A]">
            Featured Hotel Bedrooms
          </h2>
          <div className="pt-3">
            <button
              onClick={() => { onNavigate('rooms'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="text-[10px] uppercase tracking-[0.25em] font-medium text-[#5F5E5E] border-b border-[#5F5E5E] pb-0.5 hover:text-[#1A1A1A] hover:border-[#1A1A1A] transition-colors cursor-pointer"
            >
              View All {ROOMS_DATA.length} Bedrooms
            </button>
          </div>
        </FadeInUp>

        {/* 4 Cards Featured Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
          {/* Card 1: Ocean Suite */}
          <FadeInUp className="lg:col-span-7 group cursor-pointer" onClick={() => handleOpenDetails(roomsList[0])}>
            <div className="space-y-4">
              <div className="aspect-[16/10] overflow-hidden bg-[#E9E8E5] border border-[#E5E5E5]">
                <img
                  src={roomsList[0]?.image}
                  alt={roomsList[0]?.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="space-y-2 pt-1">
                <h3 className="font-serif text-2xl font-light text-[#1A1A1A] group-hover:text-[#C5B358] transition-colors">
                  {roomsList[0]?.name}
                </h3>
                <p className="text-xs text-[#5F5E5E] font-light max-w-lg leading-relaxed">
                  {roomsList[0]?.description}
                </p>
                <button
                  onClick={(e) => { e.stopPropagation(); handleOpenDetails(roomsList[0]); }}
                  className="mt-2 px-5 py-2.5 bg-[#1A1A1A] text-white text-[10px] uppercase tracking-[0.2em] font-semibold hover:bg-[#C5B358] hover:text-[#1A1A1A] transition-colors cursor-pointer inline-flex items-center gap-2"
                >
                  BOOK NOW & VIEW DETAILS <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </FadeInUp>

          {/* Card 2: Sanctuary Villa */}
          <FadeInUp delay={0.1} className="lg:col-span-5 group cursor-pointer" onClick={() => handleOpenDetails(roomsList[1])}>
            <div className="space-y-4">
              <div className="aspect-[4/3] overflow-hidden bg-[#E9E8E5] border border-[#E5E5E5]">
                <img
                  src={roomsList[1]?.image}
                  alt={roomsList[1]?.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="space-y-2 pt-1">
                <h3 className="font-serif text-2xl font-light text-[#1A1A1A] group-hover:text-[#C5B358] transition-colors">
                  {roomsList[1]?.name}
                </h3>
                <p className="text-xs text-[#5F5E5E] font-light leading-relaxed">
                  {roomsList[1]?.description}
                </p>
                <button
                  onClick={(e) => { e.stopPropagation(); handleOpenDetails(roomsList[1]); }}
                  className="mt-2 px-5 py-2.5 bg-[#1A1A1A] text-white text-[10px] uppercase tracking-[0.2em] font-semibold hover:bg-[#C5B358] hover:text-[#1A1A1A] transition-colors cursor-pointer inline-flex items-center gap-2"
                >
                  BOOK NOW & VIEW DETAILS <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </FadeInUp>

          {/* Card 3: The Ritual Room */}
          <FadeInUp delay={0.2} className="lg:col-span-5 group cursor-pointer" onClick={() => handleOpenDetails(roomsList[2])}>
            <div className="space-y-4">
              <div className="aspect-[4/3] overflow-hidden bg-[#E9E8E5] border border-[#E5E5E5]">
                <img
                  src={roomsList[2]?.image}
                  alt={roomsList[2]?.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="space-y-2 pt-1">
                <h3 className="font-serif text-2xl font-light text-[#1A1A1A] group-hover:text-[#C5B358] transition-colors">
                  {roomsList[2]?.name}
                </h3>
                <p className="text-xs text-[#5F5E5E] font-light leading-relaxed">
                  {roomsList[2]?.description}
                </p>
                <button
                  onClick={(e) => { e.stopPropagation(); handleOpenDetails(roomsList[2]); }}
                  className="mt-2 px-5 py-2.5 bg-[#1A1A1A] text-white text-[10px] uppercase tracking-[0.2em] font-semibold hover:bg-[#C5B358] hover:text-[#1A1A1A] transition-colors cursor-pointer inline-flex items-center gap-2"
                >
                  BOOK NOW & VIEW DETAILS <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </FadeInUp>

          {/* Card 4: Skyward Penthouse */}
          <FadeInUp delay={0.3} className="lg:col-span-7 group cursor-pointer" onClick={() => handleOpenDetails(roomsList[3])}>
            <div className="space-y-4">
              <div className="aspect-[16/10] overflow-hidden bg-[#E9E8E5] border border-[#E5E5E5]">
                <img
                  src={roomsList[3]?.image}
                  alt={roomsList[3]?.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="space-y-2 pt-1">
                <h3 className="font-serif text-2xl font-light text-[#1A1A1A] group-hover:text-[#C5B358] transition-colors">
                  {roomsList[3]?.name}
                </h3>
                <p className="text-xs text-[#5F5E5E] font-light max-w-lg leading-relaxed">
                  {roomsList[3]?.description}
                </p>
                <button
                  onClick={(e) => { e.stopPropagation(); handleOpenDetails(roomsList[3]); }}
                  className="mt-2 px-5 py-2.5 bg-[#1A1A1A] text-white text-[10px] uppercase tracking-[0.2em] font-semibold hover:bg-[#C5B358] hover:text-[#1A1A1A] transition-colors cursor-pointer inline-flex items-center gap-2"
                >
                  BOOK NOW & VIEW DETAILS <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </FadeInUp>
        </div>
      </section>

      {/* 4. NEW SECTION: Bespoke Hotel Privileges Grid */}
      <section className="relative bg-[#1A1A1A] text-white py-16 sm:py-24 border-y border-[#C5B358]/30 overflow-hidden">
        <div className="relative z-[2] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <FadeInUp className="text-center space-y-3">
            <span className="text-[11px] uppercase tracking-[0.3em] text-[#C5B358] font-semibold">
              UNRIVALED HOSPITALITY
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-light text-white">
              Signature Pillars of Elysia
            </h2>
            <p className="text-[#DBDAD7] font-light text-xs sm:text-sm max-w-xl mx-auto">
              Every moment of your stay is curated by world-class concierges and master artisans.
            </p>
          </FadeInUp>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <FadeInUp delay={0.1} className="bg-[#242424] p-8 border border-white/10 space-y-3">
              <Sparkles className="w-6 h-6 text-[#C5B358]" />
              <h3 className="font-serif text-xl font-light text-white">Clefs d'Or Butler</h3>
              <p className="text-xs text-[#DBDAD7] font-light leading-relaxed">
                24/7 dedicated liaison for packing, private reservations, helicopter transfers, and custom in-suite dining.
              </p>
            </FadeInUp>

            <FadeInUp delay={0.2} className="bg-[#242424] p-8 border border-white/10 space-y-3">
              <Anchor className="w-6 h-6 text-[#C5B358]" />
              <h3 className="font-serif text-xl font-light text-white">Yacht & Aviation</h3>
              <p className="text-xs text-[#DBDAD7] font-light leading-relaxed">
                Private Ferretti yacht charters, helipad clearance, and complimentary Rolls-Royce airport chauffeur transfers.
              </p>
            </FadeInUp>

            <FadeInUp delay={0.3} className="bg-[#242424] p-8 border border-white/10 space-y-3">
              <Utensils className="w-6 h-6 text-[#C5B358]" />
              <h3 className="font-serif text-xl font-light text-white">Michelin Gastronomy</h3>
              <p className="text-xs text-[#DBDAD7] font-light leading-relaxed">
                Three Michelin-starred dining at L'Étoile, private wine cellar sommelier tastings, and organic terrace breakfasts.
              </p>
            </FadeInUp>

            <FadeInUp delay={0.4} className="bg-[#242424] p-8 border border-white/10 space-y-3">
              <Flame className="w-6 h-6 text-[#C5B358]" />
              <h3 className="font-serif text-xl font-light text-white">Aurum Thermal Spa</h3>
              <p className="text-xs text-[#DBDAD7] font-light leading-relaxed">
                Unlimited daily access to hydrotherapy pools, infrared saunas, and holistic mineral stone therapy.
              </p>
            </FadeInUp>
          </div>
        </div>
      </section>

      {/* 5. The Experience Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <FadeInUp className="space-y-6">
            <span className="text-[11px] uppercase tracking-[0.3em] text-[#5F5E5E] font-medium">
              THE EXPERIENCE
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#1A1A1A] leading-tight">
              Effortless Artistry in Every Detail.
            </h2>
            <p className="text-sm text-[#5F5E5E] font-light leading-relaxed max-w-md">
              From the curated scent of citrus and cedarwood in our lobbies to the hand-woven linens of your master suite, ELYSIA is an orchestration of subtle masterstrokes designed to soothe the soul.
            </p>
            <div className="pt-2">
              <button
                onClick={() => {
                  onNavigate('gallery');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-8 py-3.5 border border-[#1A1A1A] text-[#1A1A1A] text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#1A1A1A] hover:text-white transition-colors cursor-pointer"
              >
                EXPLORE THE GALLERY
              </button>
            </div>
          </FadeInUp>

          <FadeInUp delay={0.2} className="relative">
            <div className="aspect-[4/3] overflow-hidden bg-[#E9E8E5] border border-[#E5E5E5]">
              <img
                src="https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80"
                alt="Elysia Luxury Suite Interior"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </FadeInUp>
        </div>
      </section>

      {/* 6. NEW SECTION: Awards & Global Accolades Bar */}
      <section className="bg-[#FAF9F6] border-y border-[#E5E5E5] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInUp className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center items-center">
            <div className="space-y-1">
              <Award className="w-5 h-5 text-[#C5B358] mx-auto mb-2" />
              <p className="font-serif text-lg font-light text-[#1A1A1A]">Forbes 5-Star 2026</p>
              <p className="text-[10px] uppercase tracking-widest text-[#5F5E5E]">Verified Highest Rating</p>
            </div>
            <div className="space-y-1 border-l border-[#E5E5E5]">
              <Star className="w-5 h-5 text-[#C5B358] mx-auto mb-2 fill-[#C5B358]" />
              <p className="font-serif text-lg font-light text-[#1A1A1A]">Michelin Guide 3 Stars</p>
              <p className="text-[10px] uppercase tracking-widest text-[#5F5E5E]">L’Étoile Dining Room</p>
            </div>
            <div className="space-y-1 border-l border-[#E5E5E5]">
              <ShieldCheck className="w-5 h-5 text-[#C5B358] mx-auto mb-2" />
              <p className="font-serif text-lg font-light text-[#1A1A1A]">Clefs d’Or Certified</p>
              <p className="text-[10px] uppercase tracking-widest text-[#5F5E5E]">Global Concierge Excellence</p>
            </div>
            <div className="space-y-1 border-l border-[#E5E5E5]">
              <Sparkles className="w-5 h-5 text-[#C5B358] mx-auto mb-2" />
              <p className="font-serif text-lg font-light text-[#1A1A1A]">Gold Luxury Travel 2025</p>
              <p className="text-[10px] uppercase tracking-widest text-[#5F5E5E]">Best Private Sanctuary</p>
            </div>
          </FadeInUp>
        </div>
      </section>

      {/* 7. NEW SECTION: Frequently Asked Questions Accordion */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <FadeInUp className="text-center space-y-3">
          <span className="text-[11px] uppercase tracking-[0.3em] text-[#5F5E5E] font-medium">
            GUEST ESSENTIALS
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-light text-[#1A1A1A]">
            Frequently Asked Questions
          </h2>
        </FadeInUp>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <FadeInUp key={idx} delay={idx * 0.05} className="bg-white border border-[#E5E5E5]">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-serif text-lg font-light text-[#1A1A1A] hover:text-[#C5B358] transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="w-5 h-5 text-[#C5B358] shrink-0" /> : <ChevronDown className="w-5 h-5 text-[#5F5E5E] shrink-0" />}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-[#5F5E5E] font-light leading-relaxed border-t border-[#F0F0F0] pt-3">
                    {faq.a}
                  </div>
                )}
              </FadeInUp>
            );
          })}
        </div>
      </section>

      {/* 8. Call to Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeInUp className="relative bg-[#1A1A1A] text-white p-10 sm:p-16 text-center space-y-6 border border-[#C5B358]/30 overflow-hidden">

          <div className="relative z-[2]">
            <span className="text-[11px] uppercase tracking-[0.3em] text-[#C5B358] font-semibold">
              BEGIN YOUR RETREAT
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-light text-white mt-2">
              Experience the Pinnacle of Luxury
            </h2>
            <p className="text-[#DBDAD7] font-light text-xs sm:text-sm max-w-xl mx-auto mt-4">
              Reserve your stay today and unlock complimentary Rolls-Royce transfers, 24/7 private butler service, and daily spa access.
            </p>
            <div className="pt-6">
              <button
                onClick={() => { onNavigate('booking'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="px-8 py-4 bg-[#C5B358] text-[#1A1A1A] text-xs uppercase tracking-[0.25em] font-semibold hover:bg-white transition-colors cursor-pointer inline-flex items-center gap-2"
              >
                BOOK YOUR SANCTUARY NOW <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </FadeInUp>
      </section>
    </div>
  );
};
