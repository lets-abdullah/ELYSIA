
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SectionTitle } from '../components/common/SectionTitle';
import { RoomCard } from '../components/sections/RoomCard';
import { useBooking } from '../contexts/BookingContext';
import { ROOMS_DATA } from '../data/roomsData';
import { Room } from '../types';
import { Sparkles } from 'lucide-react';
import { FadeInUp } from '../components/common/FadeInUp';

interface RoomsPageProps {
  onNavigate: (page: string, roomId?: string) => void;
}

export const RoomsPage: React.FC<RoomsPageProps> = ({ onNavigate }) => {
  const { rooms } = useBooking();
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');

  const roomList = (rooms && rooms.length > 0) ? rooms : ROOMS_DATA;
  let filteredRooms = [...roomList];

  if (sortBy === 'price-asc') {
    filteredRooms.sort((a, b) => (a.pricePerNight || (a as unknown as { price: number }).price) - (b.pricePerNight || (b as unknown as { price: number }).price));
  } else if (sortBy === 'price-desc') {
    filteredRooms.sort((a, b) => (b.pricePerNight || (b as unknown as { price: number }).price) - (a.pricePerNight || (a as unknown as { price: number }).price));
  }

  const handleOpenDetails = (room: Room) => {
    onNavigate('room-detail', room.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookNow = (roomId: string) => {
    onNavigate('room-detail', roomId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="pt-28 pb-16 space-y-12">
      {/* Page Header Banner */}
      <FadeInUp className="relative bg-[#1A1A1A] text-white py-16 border-b border-[#C5B358]/30 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-white/10 border border-[#C5B358]/40 text-[#C5B358] text-xs uppercase tracking-[0.25em] rounded-none">
            <Sparkles className="w-3.5 h-3.5" /> Accommodations Directory
          </div>
          <h1 className="font-serif text-4xl sm:text-6xl font-light text-white">
            Luxury Hotel Bedrooms & Rooms
          </h1>
          <p className="text-[#DBDAD7] font-light text-base max-w-2xl mx-auto leading-relaxed">
            Every bedroom offers scenic ocean or garden views, plush custom mattresses, marble bath, and 24/7 dedicated room service.
          </p>
        </div>
      </FadeInUp>

      {/* Sorting Control Bar (Filter buttons removed as requested) */}
      <FadeInUp className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#FAF9F6] border border-[#E5E5E5] p-4 sm:p-6 flex items-center justify-between gap-4 rounded-none">
          <div className="text-xs uppercase tracking-wider text-[#1A1A1A] font-semibold">
            Showing All {filteredRooms.length} Bedrooms
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-[#5F5E5E] font-semibold">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'featured' | 'price-asc' | 'price-desc')}
              className="bg-[#F5F5F0] border border-[#E5E5E5] text-xs text-[#1A1A1A] px-3 py-1.5 outline-none cursor-pointer focus:border-[#C5B358] rounded-none"
            >
              <option value="featured">Featured First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </FadeInUp>

      {/* Room Grid with Motion Animations */}
      <FadeInUp className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1 }
            }
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filteredRooms.map((room) => (
            <motion.div
              key={room.id}
              variants={{
                hidden: { opacity: 0, y: 25 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
              }}
            >
              <RoomCard
                room={room}
                onSelectDetails={handleOpenDetails}
                onBookNow={handleBookNow}
              />
            </motion.div>
          ))}
        </motion.div>
      </FadeInUp>

      {/* Inclusions Feature Callout */}
      <FadeInUp className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="bg-[#FAF9F6] border border-[#E5E5E5] p-8 sm:p-12 text-center space-y-6 rounded-none">
          <SectionTitle
            subtitle="Standard Inclusions"
            title="Every Bedroom Stay Includes Uncompromising Amenities"
            description="Regardless of bedroom selection, your reservation includes the full suite of Hotel Grandeur privileges."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left max-w-5xl mx-auto text-xs text-[#1A1A1A] font-light">
            <div className="p-4 bg-[#FAF9F6] border border-[#E5E5E5] rounded-none">
              <p className="font-serif text-base text-[#1A1A1A] font-normal mb-1">24/7 Room Service</p>
              <p className="text-[#5F5E5E]">Dedicated liaison for dining, housekeeping, and custom requests.</p>
            </div>
            <div className="p-4 bg-[#FAF9F6] border border-[#E5E5E5] rounded-none">
              <p className="font-serif text-base text-[#1A1A1A] font-normal mb-1">Artisanal Breakfast</p>
              <p className="text-[#5F5E5E]">Daily organic breakfast served in-room or on your balcony.</p>
            </div>
            <div className="p-4 bg-[#FAF9F6] border border-[#E5E5E5] rounded-none">
              <p className="font-serif text-base text-[#1A1A1A] font-normal mb-1">Airport Transfer</p>
              <p className="text-[#5F5E5E]">Complimentary airport transfer for all premium bedrooms.</p>
            </div>
            <div className="p-4 bg-[#FAF9F6] border border-[#E5E5E5] rounded-none">
              <p className="font-serif text-base text-[#1A1A1A] font-normal mb-1">Spa & Fitness Pass</p>
              <p className="text-[#5F5E5E]">Unlimited daily access to hydrotherapy pool & wellness center.</p>
            </div>
          </div>
        </div>
      </FadeInUp>
    </div>
  );
};
