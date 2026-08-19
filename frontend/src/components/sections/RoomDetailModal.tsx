import React, { useState } from 'react';
import { Room } from '../../types';
import { useBooking } from '../../contexts/BookingContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Users, Maximize2, Bed, Eye, CheckCircle2, ArrowRight, Lock } from 'lucide-react';

interface RoomDetailModalProps {
  room: Room | null;
  isOpen: boolean;
  onClose: () => void;
  onBookNow: (roomId: string) => void;
}

export const RoomDetailModal: React.FC<RoomDetailModalProps> = ({
  room,
  isOpen,
  onClose,
  onBookNow
}) => {
  if (!room) return null;

  const { showToast } = useBooking();
  const [activeImage, setActiveImage] = useState(room.image);

  const isReserved =
    room?.status?.toLowerCase() === 'reserved' ||
    room?.status?.toLowerCase() === 'occupied' ||
    (room as any)?.isReserved === true;

  const handleBookingClick = () => {
    if (isReserved) {
      showToast("This room is already reserved. Please try another one.");
    } else {
      onClose();
      onBookNow(room.id);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      subtitle={room.category}
      title={room.name}
      maxWidth="4xl"
    >
      <div className="flex flex-col space-y-6 text-[#1A1A1A] pb-2">
        {/* Main Image Frame & Thumbnails */}
        <div className="space-y-3">
          <div className="aspect-[16/9] w-full overflow-hidden bg-[#F5F5F0] border border-[#E5E5E5] rounded-none relative">
            <img
              src={activeImage}
              alt={room.name}
              className={`w-full h-full object-cover transition-all duration-300 ${isReserved ? 'grayscale-[30%]' : ''}`}
              referrerPolicy="no-referrer"
            />
            {isReserved && (
              <div className="absolute top-4 right-4 bg-rose-950/90 text-rose-300 border border-rose-500/50 text-xs uppercase tracking-[0.2em] px-4 py-1.5 font-bold flex items-center gap-1.5 backdrop-blur-xs">
                <Lock className="w-3.5 h-3.5 text-rose-400" />
                ROOM RESERVED
              </div>
            )}
          </div>

          {/* Gallery Thumbnails Horizontal Scroll */}
          {room.gallery && room.gallery.length > 1 && (
            <div className="flex space-x-2.5 overflow-x-auto pb-2 scrollbar-thin">
              {room.gallery.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(img)}
                  className={`relative w-20 sm:w-24 h-14 sm:h-16 shrink-0 border rounded-none overflow-hidden transition-all cursor-pointer ${
                    activeImage === img ? 'border-[#1A1A1A] opacity-100 scale-95' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Specifications Highlights Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F5F5F0] p-3.5 sm:p-5 border border-[#E5E5E5] rounded-none">
          <div className="flex items-center gap-2.5">
            <Users className="w-4 h-4 text-[#C5B358] shrink-0" />
            <div className="min-w-0">
              <p className="text-[9px] sm:text-[10px] uppercase text-[#5F5E5E] font-medium tracking-wider">Occupancy</p>
              <p className="text-xs sm:text-sm font-medium text-[#1A1A1A] truncate">{room.maxGuests} Guests Max</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Maximize2 className="w-4 h-4 text-[#C5B358] shrink-0" />
            <div className="min-w-0">
              <p className="text-[9px] sm:text-[10px] uppercase text-[#5F5E5E] font-medium tracking-wider">Residence Size</p>
              <p className="text-xs sm:text-sm font-medium text-[#1A1A1A] truncate">{room.sizeSqFt} Sq Ft</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Bed className="w-4 h-4 text-[#C5B358] shrink-0" />
            <div className="min-w-0">
              <p className="text-[9px] sm:text-[10px] uppercase text-[#5F5E5E] font-medium tracking-wider">Bed Setup</p>
              <p className="text-xs sm:text-sm font-medium text-[#1A1A1A] truncate">{room.bedType}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Eye className="w-4 h-4 text-[#C5B358] shrink-0" />
            <div className="min-w-0">
              <p className="text-[9px] sm:text-[10px] uppercase text-[#5F5E5E] font-medium tracking-wider">View Angle</p>
              <p className="text-xs sm:text-sm font-medium text-[#1A1A1A] truncate">{room.view}</p>
            </div>
          </div>
        </div>

        {/* Residence Narrative */}
        <div className="space-y-2">
          <h4 className="font-serif text-lg sm:text-xl font-light text-[#1A1A1A]">Residence Description</h4>
          <p className="text-xs sm:text-sm leading-relaxed text-[#5F5E5E] font-light">
            {room.description}
          </p>
        </div>

        {/* Inclusive Amenities */}
        <div className="space-y-3 pt-1">
          <h4 className="font-serif text-lg sm:text-xl font-light text-[#1A1A1A]">Exclusive Residence Inclusions</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#1A1A1A] font-light">
            {room.amenities.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2.5 p-2.5 bg-[#FAF9F6] border border-[#E5E5E5] rounded-none">
                <CheckCircle2 className="w-4 h-4 text-[#C5B358] shrink-0" />
                <span className="text-xs">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Booking Action - Mobile Responsive Flex */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-5 border-t border-[#E5E5E5]">
          <div className="flex items-baseline justify-between sm:justify-start gap-2">
            <span className="text-xs text-[#5F5E5E] uppercase tracking-wider">Nightly Rate:</span>
            <p className="font-serif text-2xl font-normal text-[#1A1A1A]">
              ${room.pricePerNight} <span className="text-xs font-sans text-[#5F5E5E]">/ night + tax</span>
            </p>
          </div>
          <Button
            variant="gold"
            size="lg"
            className={`w-full sm:w-auto justify-center cursor-pointer ${isReserved ? 'bg-rose-950 text-rose-200 border border-rose-800' : ''}`}
            onClick={handleBookingClick}
          >
            <span>{isReserved ? 'ROOM RESERVED' : 'Proceed to Booking'}</span>
            {!isReserved && <ArrowRight className="w-4 h-4 ml-1.5" />}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
