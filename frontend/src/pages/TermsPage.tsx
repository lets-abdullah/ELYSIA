import React from 'react';
import { FadeInUp } from '../components/common/FadeInUp';
import { Scroll, Check, AlertCircle, Clock, ArrowLeft } from 'lucide-react';

interface TermsPageProps {
  onNavigate?: (page: string) => void;
}

export const TermsPage: React.FC<TermsPageProps> = ({ onNavigate }) => {
  return (
    <div className="pt-28 pb-16 space-y-12">
      {/* Header Banner */}
      <FadeInUp duration={0.7} className="relative bg-[#1A1A1A] text-white py-16 border-b border-[#C5B358]/30 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-white/10 border border-[#C5B358]/40 text-[#C5B358] text-xs uppercase tracking-[0.25em]">
            <Scroll className="w-3.5 h-3.5" /> Terms & Service Framework
          </div>
          <h1 className="font-serif text-4xl sm:text-6xl font-light text-white">
            Terms of Service
          </h1>
          <p className="text-[#DBDAD7] font-light text-base max-w-2xl mx-auto leading-relaxed">
            The governing terms, booking policies, and luxury guest agreement at Elysia Luxury Hotel.
          </p>
        </div>
      </FadeInUp>

      {/* Content Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {onNavigate && (
          <button
            onClick={() => {
              onNavigate('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-[#5F5E5E] hover:text-[#1A1A1A] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Overview
          </button>
        )}

        <FadeInUp delay={0.1} className="bg-white p-8 sm:p-12 border border-[#E5E5E5] space-y-8 shadow-sm">
          {/* Section 1 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[#C5B358]">
              <Check className="w-5 h-5" />
              <h2 className="font-serif text-2xl text-[#1A1A1A] font-normal">1. Reservation & Deposit Guarantee</h2>
            </div>
            <p className="text-sm text-[#5F5E5E] font-light leading-relaxed">
              All bookings at Elysia Luxury Hotel require valid guest details and credit card authorization at the time of reservation. A 50% initial deposit guarantees your suite or villa selection. Final balance is settled upon check-out along with any incidental or bespoke concierge additions.
            </p>
          </div>

          <hr className="border-[#E5E5E5]/60" />

          {/* Section 2 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[#C5B358]">
              <Clock className="w-5 h-5" />
              <h2 className="font-serif text-2xl text-[#1A1A1A] font-normal">2. Cancellation & Alteration Terms</h2>
            </div>
            <p className="text-sm text-[#5F5E5E] font-light leading-relaxed">
              We understand plans evolve. Direct bookings altered or cancelled up to 72 hours prior to arrival incur zero cancellation penalty. Cancellations made within 72 hours of scheduled arrival are subject to a fee equal to one night’s room rate plus tax.
            </p>
          </div>

          <hr className="border-[#E5E5E5]/60" />

          {/* Section 3 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[#C5B358]">
              <AlertCircle className="w-5 h-5" />
              <h2 className="font-serif text-2xl text-[#1A1A1A] font-normal">3. Guest Atmosphere & Property Standard</h2>
            </div>
            <p className="text-sm text-[#5F5E5E] font-light leading-relaxed">
              To preserve the tranquil, refined sanctuary environment for all patrons, guests are asked to observe hotel decorum, noise guidelines after 22:00, and designated non-smoking residence quarters. Elysia retains the right to refuse service to ensure overall safety and comfort.
            </p>
          </div>

          <hr className="border-[#E5E5E5]/60" />

          {/* Section 4 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[#C5B358]">
              <Scroll className="w-5 h-5" />
              <h2 className="font-serif text-2xl text-[#1A1A1A] font-normal">4. Chauffeur & Helipad Services</h2>
            </div>
            <p className="text-sm text-[#5F5E5E] font-light leading-relaxed">
              Helipad landing slots and private limousine transfers require advance coordination with our Head Concierge. Elysia ensures full licensed transport compliance and insurance coverage for all transfers within the French Riviera region.
            </p>
          </div>
        </FadeInUp>
      </div>
    </div>
  );
};
