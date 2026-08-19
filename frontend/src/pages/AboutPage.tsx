import React from 'react';
import { SectionTitle } from '../components/common/SectionTitle';
import { Sparkles, Award, ShieldCheck, Compass, Heart, Leaf } from 'lucide-react';
import { FadeInUp, FadeInStaggerContainer, FadeInChild } from '../components/common/FadeInUp';


export const AboutPage: React.FC = () => {
  return (
    <div className="pt-28 pb-16 space-y-16">
      {/* Header Banner */}
      <FadeInUp duration={0.7} className="relative bg-[#1A1A1A] text-white py-20 border-b border-[#C5B358]/30 overflow-hidden">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-white/10 border border-[#C5B358]/40 text-[#C5B358] text-xs uppercase tracking-[0.25em] rounded-none">
            <Sparkles className="w-3.5 h-3.5" /> Our Story
          </div>
          <h1 className="font-serif text-4xl sm:text-7xl font-light text-white">
            The Philosophy of Grandeur
          </h1>
          <p className="text-[#DBDAD7] font-light text-base sm:text-lg max-w-3xl mx-auto leading-relaxed">
            Founded on the conviction that true luxury is defined by peace of mind, acoustic purity, and seamless attention to detail.
          </p>
        </div>
      </FadeInUp>

      {/* Main Architectural Narrative */}
      <FadeInUp className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs uppercase tracking-[0.25em] text-[#C5B358] font-semibold">
              Architectural Concept
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-light text-[#1A1A1A]">
              Built in Harmony With Sea & Sky
            </h2>
            <p className="text-sm text-[#5F5E5E] font-light leading-relaxed">
              Designed by renowned Scandinavian minimalist architect Lars Lindqvist in collaboration with French interior artisan Hélène de Saint-Germain, Hotel Grandeur replaces visual noise with clean geometry, natural limestone, and uninhibited light.
            </p>
            <p className="text-sm text-[#5F5E5E] font-light leading-relaxed">
              Every suite is strategically angled to capture maximum natural daylight during golden hour while preserving absolute acoustic and visual privacy for our high-profile guests.
            </p>
          </div>

          <div className="aspect-[4/3] bg-[#F5F5F0] border border-[#E5E5E5] rounded-none overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80"
              alt="Architectural details of Hotel Grandeur"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </FadeInUp>

      {/* Core Values / Sustainability Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeInUp>
          <SectionTitle
            subtitle="Pillars"
            title="Our Commitment to Discretion & Earth"
            description="We operate with zero single-use plastics, 100% solar auxiliary energy, and local community empowerment."
          />
        </FadeInUp>

        <FadeInStaggerContainer className="grid grid-cols-1 sm:grid-cols-3 gap-8" staggerDelay={0.15}>
          <FadeInChild>
            <div className="bg-[#FAF9F6] p-8 border border-[#E5E5E5] rounded-none space-y-4 hover:border-[#1A1A1A] transition-all h-full">
              <div className="w-12 h-12 bg-[#F5F5F0] text-[#C5B358] flex items-center justify-center border border-[#E5E5E5] rounded-none">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl text-[#1A1A1A] font-normal">Discretion First</h3>
              <p className="text-xs text-[#5F5E5E] font-light leading-relaxed">
                Private underground arrival lanes and encrypted guest communications guarantee total privacy for dignitaries and public figures.
              </p>
            </div>
          </FadeInChild>

          <FadeInChild>
            <div className="bg-[#FAF9F6] p-8 border border-[#E5E5E5] rounded-none space-y-4 hover:border-[#1A1A1A] transition-all h-full">
              <div className="w-12 h-12 bg-[#F5F5F0] text-[#C5B358] flex items-center justify-center border border-[#E5E5E5] rounded-none">
                <Leaf className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl text-[#1A1A1A] font-normal">Ecological Respect</h3>
              <p className="text-xs text-[#5F5E5E] font-light leading-relaxed">
                Desalination water recycling systems, rooftop organic botanical gardens, and zero-waste kitchen practices.
              </p>
            </div>
          </FadeInChild>

          <FadeInChild>
            <div className="bg-[#FAF9F6] p-8 border border-[#E5E5E5] rounded-none space-y-4 hover:border-[#1A1A1A] transition-all h-full">
              <div className="w-12 h-12 bg-[#F5F5F0] text-[#C5B358] flex items-center justify-center border border-[#E5E5E5] rounded-none">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl text-[#1A1A1A] font-normal">Warm Human Connection</h3>
              <p className="text-xs text-[#5F5E5E] font-light leading-relaxed">
                Our staff-to-guest ratio of 3:1 ensures every nuance of your preference is recognized and anticipated with genuine warmth.
              </p>
            </div>
          </FadeInChild>
        </FadeInStaggerContainer>
      </section>

      {/* Accolades & Badges */}
      <FadeInUp className="max-w-5xl mx-auto px-4 text-center py-12 border-t border-b border-[#E5E5E5]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-[#C5B358]">
          <div className="space-y-1">
            <Award className="w-8 h-8 mx-auto" />
            <p className="font-serif text-xl text-[#1A1A1A]">Forbes 5-Star</p>
            <p className="text-[10px] uppercase text-[#5F5E5E] font-semibold tracking-wider">2022 - 2026 Consecutive</p>
          </div>
          <div className="space-y-1">
            <ShieldCheck className="w-8 h-8 mx-auto" />
            <p className="font-serif text-xl text-[#1A1A1A]">Leading Hotels</p>
            <p className="text-[10px] uppercase text-[#5F5E5E] font-semibold tracking-wider">World Designation</p>
          </div>
          <div className="space-y-1">
            <Sparkles className="w-8 h-8 mx-auto" />
            <p className="font-serif text-xl text-[#1A1A1A]">Michelin Star</p>
            <p className="text-[10px] uppercase text-[#5F5E5E] font-semibold tracking-wider">L’Étoile Dining</p>
          </div>
          <div className="space-y-1">
            <Leaf className="w-8 h-8 mx-auto" />
            <p className="font-serif text-xl text-[#1A1A1A]">Green Key Gold</p>
            <p className="text-[10px] uppercase text-[#5F5E5E] font-semibold tracking-wider">Eco-Luxury Verified</p>
          </div>
        </div>
      </FadeInUp>
    </div>
  );
};

