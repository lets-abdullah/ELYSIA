import React, { useState } from 'react';
import { SectionTitle } from '../components/common/SectionTitle';
import { RESTAURANT_MENU } from '../data/restaurantData';
import { TableReservationModal } from '../components/sections/TableReservationModal';
import { Button } from '../components/common/Button';
import { Utensils, Star, Sparkles, Clock, Wine, ChefHat } from 'lucide-react';
import { FadeInUp, FadeInStaggerContainer, FadeInChild } from '../components/common/FadeInUp';

export const RestaurantPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'All' | 'Starters' | 'Main Courses' | 'Desserts' | 'Wines & Spirits'>('All');
  const [isReservationOpen, setIsReservationOpen] = useState(false);

  const categories: Array<'All' | 'Starters' | 'Main Courses' | 'Desserts' | 'Wines & Spirits'> = [
    'All',
    'Starters',
    'Main Courses',
    'Desserts',
    'Wines & Spirits'
  ];

  const menuItems = activeCategory === 'All'
    ? RESTAURANT_MENU
    : RESTAURANT_MENU.filter((m) => m.category === activeCategory);

  return (
    <div className="pt-28 pb-16 space-y-16">
      {/* Hero Header */}
      <FadeInUp duration={0.7} className="relative bg-[#1A1A1A] text-white py-24 overflow-hidden border-b border-[#C5B358]/30">
        <div className="absolute inset-0 z-0 opacity-40">
          <img
            src="https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1920&q=80"
            alt="L'Étoile Fine Dining Room"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-white/10 border border-[#C5B358]/50 text-[#C5B358] text-xs uppercase tracking-[0.25em] rounded-none">
            <Star className="w-3.5 h-3.5 fill-current" /> Michelin Star Gastronomy
          </div>
          <h1 className="font-serif text-4xl sm:text-7xl font-light text-white">
            L’Étoile Restaurant
          </h1>
          <p className="text-[#DBDAD7] font-light text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Contemporary French-Mediterranean culinary artistry led by Executive Chef Antoine Laurent, paired with rare grand cru vintages from our temperature-controlled glass cellar.
          </p>
          <div className="pt-2">
            <Button variant="gold" size="lg" onClick={() => setIsReservationOpen(true)}>
              Reserve A Table
            </Button>
          </div>
        </div>
      </FadeInUp>

      {/* Chef & Philosophy Story Section */}
      <FadeInUp className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-[#FAF9F6] border border-[#E5E5E5] p-8 sm:p-12 rounded-none">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <ChefHat className="w-5 h-5 text-[#C5B358]" />
              <span className="text-xs uppercase tracking-[0.2em] text-[#C5B358] font-semibold">
                Culinary Director
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-light text-[#1A1A1A]">
              Chef Antoine Laurent
            </h2>
            <p className="text-sm text-[#5F5E5E] font-light leading-relaxed">
              "To dine at L’Étoile is to embark on a sensory journey where every dish tells the story of the Mediterranean sun, wild Brittany tides, and ancestral French technique."
            </p>
            <p className="text-sm text-[#5F5E5E] font-light leading-relaxed">
              We source organic herbs from our hotel terrace garden, line-caught seafood from local fishermen, and A5 Wagyu directly from Miyazaki prefecture.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#E5E5E5] text-xs text-[#1A1A1A]">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#C5B358]" />
                <div>
                  <p className="font-semibold text-[#1A1A1A]">Service Hours</p>
                  <p className="text-[#5F5E5E]">18:30 – 23:00 (Tue-Sun)</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Wine className="w-4 h-4 text-[#C5B358]" />
                <div>
                  <p className="font-semibold text-[#1A1A1A]">Wine Vault</p>
                  <p className="text-[#5F5E5E]">2,400 Reference Bottles</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative aspect-[4/3] bg-[#F5F5F0] border border-[#E5E5E5] rounded-none overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=1200&q=80"
              alt="Executive Chef plating dish"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </FadeInUp>

      {/* Menu Showcase Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeInUp>
          <SectionTitle
            subtitle="À La Carte & Tasting"
            title="The Seasonal Culinary Menu"
            description="Explore our current seasonal creations. Available à la carte or as a 7-course Sommelier Tasting Experience ($290 per guest)."
          />
        </FadeInUp>

        {/* Menu Category Filter Tabs */}
        <FadeInUp delay={0.1} className="flex flex-wrap justify-center gap-2 mb-10 border-b border-[#E5E5E5] pb-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 text-xs uppercase tracking-[0.2em] font-semibold transition-all cursor-pointer rounded-none border ${
                activeCategory === cat
                  ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                  : 'bg-[#FAF9F6] text-[#1A1A1A] border-[#E5E5E5] hover:bg-[#1A1A1A]/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </FadeInUp>

        {/* Menu Items List */}
        <FadeInStaggerContainer className="space-y-6" staggerDelay={0.08}>
          {menuItems.map((item) => (
            <FadeInChild key={item.id}>
              <div className="bg-[#FAF9F6] p-6 border border-[#E5E5E5] rounded-none hover:border-[#1A1A1A] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-serif text-xl font-normal text-[#1A1A1A]">{item.name}</h3>
                    {item.isChefSpecial && (
                      <span className="bg-[#1A1A1A] text-[#C5B358] text-[10px] uppercase tracking-widest px-2.5 py-0.5 border border-[#C5B358]/30 font-semibold flex items-center gap-1 rounded-none">
                        <Sparkles className="w-3 h-3" /> Chef Signature
                      </span>
                    )}
                    {item.dietary?.map((d) => (
                      <span key={d} className="bg-[#F5F5F0] text-[#5F5E5E] text-[10px] uppercase tracking-wider px-2 py-0.5 border border-[#E5E5E5] rounded-none">
                        {d}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-[#5F5E5E] font-light leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <span className="font-serif text-2xl text-[#C5B358] font-normal">{item.price}</span>
                </div>
              </div>
            </FadeInChild>
          ))}
        </FadeInStaggerContainer>

        {/* Reservation CTA */}
        <FadeInUp className="mt-12 text-center p-8 bg-[#FAF9F6] border border-[#E5E5E5] rounded-none">
          <h4 className="font-serif text-2xl text-[#1A1A1A] font-light mb-2">Private Table & Chef’s Sanctuary</h4>
          <p className="text-xs text-[#5F5E5E] font-light max-w-lg mx-auto mb-6">
            For parties exceeding 6 guests or custom sommelier pairing requests, advance reservation is recommended.
          </p>
          <Button variant="gold" size="lg" onClick={() => setIsReservationOpen(true)}>
            Reserve A Table Online
          </Button>
        </FadeInUp>
      </section>

      {/* Table Reservation Modal */}
      <TableReservationModal
        isOpen={isReservationOpen}
        onClose={() => setIsReservationOpen(false)}
      />
    </div>
  );
};

