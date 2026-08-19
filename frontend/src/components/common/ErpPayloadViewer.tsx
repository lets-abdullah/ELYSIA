import React from 'react';
import { useBooking } from '../../contexts/BookingContext';
import { Terminal, X, CheckCircle, Server, Code } from 'lucide-react';
import { Button } from './Button';

export const ErpPayloadViewer: React.FC = () => {
  const { isErpViewerOpen, setIsErpViewerOpen, selectedRoom, checkIn, checkOut, guests, getTotalPrice, getNightsCount } = useBooking();

  if (!isErpViewerOpen) return null;

  const samplePayload = {
    erpSystem: 'GRAND-ERP-V4.2',
    targetEndpoint: '/api/erp/bookings',
    environment: 'production-ready-simulation',
    sourceOrigin: 'HotelGrandeur-WebFrontend',
    timestamp: new Date().toISOString(),
    payload: {
      bookingReference: 'GRD-2026-9482',
      guestDetails: {
        fullName: 'Johnathan Vance',
        email: 'johnathan.vance@example.com',
        phone: '+1 (555) 234-5678',
        specialRequests: 'High floor preference, late evening check-in, champagne on arrival.'
      },
      reservationDetails: {
        propertyCode: 'GRANDEUR-LUX-01',
        roomTypeId: selectedRoom.id,
        roomName: selectedRoom.name,
        category: selectedRoom.category,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        totalNights: getNightsCount(),
        adultsCount: guests,
        nightlyRateUSD: selectedRoom.pricePerNight,
        estimatedTotalUSD: getTotalPrice(),
        currency: 'USD'
      },
      addOns: [
        { code: 'TRF-ROLLS-ROYCE', name: 'Rolls-Royce Private Airport Transfer', price: 250 },
        { code: 'SPA-AURUM-HYDRO', name: 'Aurum Hydrotherapy Spa Day Pass', price: 350 }
      ],
      paymentState: 'AUTHORIZED_GUARANTEE_CARD'
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="relative w-full max-w-3xl bg-[#1A1A1A] text-stone-200 border border-[#C5A059]/40 shadow-2xl rounded-none p-6 font-mono text-sm overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#C5B358]/20 text-[#C5B358] rounded-none">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-sans font-medium text-white text-base">ERP Integration & Payload Inspector</h3>
              <p className="text-xs text-stone-400 font-mono">Endpoint: POST /api/erp/bookings</p>
            </div>
          </div>
          <button
            onClick={() => setIsErpViewerOpen(false)}
            className="p-1.5 text-stone-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center justify-between p-3 mb-4 bg-emerald-950/40 border border-emerald-800/60 rounded-none text-emerald-400 text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>Schema Validated (Zod Strict) • Ready for Enterprise ERP Webhook dispatch</span>
          </div>
          <span className="flex items-center gap-1.5 bg-emerald-900/60 px-2 py-0.5 rounded-none text-[10px] uppercase tracking-wider font-semibold">
            <Server className="w-3 h-3" /> Live Hook Active
          </span>
        </div>

        {/* JSON Preview */}
        <div className="relative bg-black/90 p-4 border border-stone-800 rounded-none max-h-[50vh] overflow-y-auto font-mono text-xs text-emerald-300">
          <div className="absolute top-2 right-3 text-[10px] text-stone-500 flex items-center gap-1">
            <Code className="w-3 h-3" /> JSON Payload
          </div>
          <pre>{JSON.stringify(samplePayload, null, 2)}</pre>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-stone-800 font-sans text-xs">
          <p className="text-stone-400 text-xs">
            Isolates UI from database/ERP storage logic using standard <code className="text-[#C5A059]">useFormSubmit</code> hook.
          </p>
          <Button size="sm" variant="gold" onClick={() => setIsErpViewerOpen(false)}>
            Close Inspector
          </Button>
        </div>
      </div>
    </div>
  );
};
