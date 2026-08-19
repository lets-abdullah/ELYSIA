import React from 'react';
import { Room } from '../../types';
import { useBooking } from '../../contexts/BookingContext';
import { Users, Maximize2, Bed, ArrowRight, Sparkles, Lock } from 'lucide-react';

interface RoomCardProps {
  room: Room;
  onSelectDetails: (room: Room) => void;
  onBookNow?: (roomId: string) => void;
}

export const RoomCard: React.FC<RoomCardProps> = ({ room, onSelectDetails, onBookNow }) => {
  const { showToast } = useBooking();

  const price = room?.pricePerNight ?? (room as unknown as { price?: number })?.price ?? 200;
  const maxGuests = room?.maxGuests ?? (room as unknown as { capacity?: number })?.capacity ?? 2;
  const sizeSqFt = room?.sizeSqFt ?? 500;
  const bedType = room?.bedType ?? (room as unknown as { bed_type?: string })?.bed_type ?? 'King Bed';
  const category = room?.category ?? (room as unknown as { type?: string })?.type ?? 'Deluxe';
  const view = room?.view ?? 'Scenic Ocean & Garden View';
  const image = room?.image || 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80';
  const name = room?.name || 'Luxury Hotel Bedroom';

  // Real-time Database Room Status Sync Check
  const isReserved =
    room?.status?.toLowerCase() === 'reserved' ||
    room?.status?.toLowerCase() === 'occupied' ||
    (room as any)?.isReserved === true;

  const handleCardClick = () => {
    if (isReserved) {
      showToast("This room is already reserved. Please try another one.");
    } else {
      onSelectDetails(room);
    }
  };

  const handleBookNowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isReserved) {
      showToast("This room is already reserved. Please try another one.");
    } else if (onBookNow) {
      onBookNow(room.id);
    } else {
      onSelectDetails(room);
    }
  };

  return (
    <article className="group bg-white border border-[#E5E5E5] hover:border-[#C5B358] transition-all duration-300 shadow-sm hover:shadow-md flex flex-col h-full overflow-hidden relative">
      {/* Room Image Container */}
      <div
        className="relative aspect-[16/10] overflow-hidden bg-[#F5F5F0] cursor-pointer"
        onClick={handleCardClick}
      >
        <img
          src={image}
          alt={name}
          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${
            isReserved ? 'grayscale-[40%] opacity-90' : ''
          }`}
          referrerPolicy="no-referrer"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

        {/* Category badge */}
        <div className="absolute top-3 left-3 bg-[#1A1A1A]/90 text-[#C5B358] border border-[#C5B358]/40 text-[10px] uppercase tracking-[0.2em] px-3 py-1 font-semibold flex items-center gap-1.5 backdrop-blur-xs">
          <Sparkles className="w-3 h-3 text-[#C5B358]" />
          {category}
        </div>

        {/* Reserved Status Overlay Badge */}
        {isReserved ? (
          <div className="absolute top-3 right-3 bg-rose-950/90 text-rose-300 border border-rose-500/50 text-[10px] uppercase tracking-[0.2em] px-3 py-1 font-extrabold flex items-center gap-1 backdrop-blur-xs">
            <Lock className="w-3 h-3 text-rose-400" />
            RESERVED
          </div>
        ) : (
          <div className="absolute bottom-3 right-3 bg-[#1A1A1A]/90 text-white px-3 py-1 text-xs font-serif tracking-wide border border-white/20">
            <span className="text-[#C5B358] font-semibold">${Number(price).toLocaleString()}</span>
            <span className="text-[10px] text-[#DBDAD7] font-sans uppercase tracking-wider"> / night</span>
          </div>
        )}
      </div>

      {/* Room Content */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Room Name */}
          <h3
            className="font-serif text-2xl font-light text-[#1A1A1A] group-hover:text-[#C5B358] transition-colors leading-tight cursor-pointer flex items-center justify-between"
            onClick={handleCardClick}
          >
            <span>{name}</span>
            {isReserved && (
              <span className="text-xs font-sans font-bold text-rose-600 uppercase tracking-widest bg-rose-50 px-2 py-0.5 border border-rose-200">
                Reserved
              </span>
            )}
          </h3>
          <p className="text-xs text-[#5F5E5E] font-light line-clamp-1">
            {view}
          </p>

          {/* Key Specs Icons Bar */}
          <div className="pt-2 grid grid-cols-3 gap-2 border-t border-[#F0F0F0] text-[11px] text-[#1A1A1A]">
            <div className="flex items-center gap-1.5" title="Max Guests">
              <Users className="w-3.5 h-3.5 text-[#C5B358] shrink-0" />
              <span className="truncate">{maxGuests} Guests</span>
            </div>
            <div className="flex items-center gap-1.5" title="Room Size">
              <Maximize2 className="w-3.5 h-3.5 text-[#C5B358] shrink-0" />
              <span className="truncate">{sizeSqFt} sq ft</span>
            </div>
            <div className="flex items-center gap-1.5" title="Bed Type">
              <Bed className="w-3.5 h-3.5 text-[#C5B358] shrink-0" />
              <span className="truncate">{bedType.split(' ')[0]} Bed</span>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-[#E5E5E5] flex items-center justify-between gap-3">
          <button
            onClick={() => onSelectDetails(room)}
            className="text-[11px] uppercase tracking-[0.18em] font-semibold text-[#1A1A1A] hover:text-[#C5B358] transition-colors cursor-pointer flex items-center gap-1 group/btn"
          >
            Room Details
            <ArrowRight className="w-3.5 h-3.5 text-[#C5B358] group-hover/btn:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={handleBookNowClick}
            className={`px-4 py-2 text-[10px] uppercase tracking-[0.18em] font-semibold transition-all duration-200 shrink-0 cursor-pointer ${
              isReserved
                ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                : 'bg-[#1A1A1A] text-white hover:bg-[#C5B358] hover:text-[#1A1A1A]'
            }`}
          >
            {isReserved ? 'RESERVED' : 'BOOK NOW'}
          </button>
        </div>
      </div>
    </article>
  );
};
