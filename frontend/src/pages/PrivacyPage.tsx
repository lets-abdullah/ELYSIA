import React from 'react';
import { FadeInUp } from '../components/common/FadeInUp';
import { Shield, Lock, Eye, FileText, ArrowLeft, Mail } from 'lucide-react';

interface PrivacyPageProps {
  onNavigate?: (page: string) => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ onNavigate }) => {
  return (
    <div className="pt-28 pb-16 space-y-12">
      {/* Header Banner */}
      <FadeInUp duration={0.7} className="bg-[#1A1A1A] text-white py-16 border-b border-[#C5B358]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-white/10 border border-[#C5B358]/40 text-[#C5B358] text-xs uppercase tracking-[0.25em]">
            <Shield className="w-3.5 h-3.5" /> Legal & Governance
          </div>
          <h1 className="font-serif text-4xl sm:text-6xl font-light text-white">
            Privacy Policy
          </h1>
          <p className="text-[#DBDAD7] font-light text-base max-w-2xl mx-auto leading-relaxed">
            Commitment to guest confidentiality, personal data protection, and privacy standards at Elysia Luxury Hotel.
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
              <Lock className="w-5 h-5" />
              <h2 className="font-serif text-2xl text-[#1A1A1A] font-normal">1. Commitment to Guest Discretion</h2>
            </div>
            <p className="text-sm text-[#5F5E5E] font-light leading-relaxed">
              At Elysia Luxury Hotel, protecting the privacy and confidentiality of our esteemed guests is paramount. Whether you interact with our online concierge, reserve a private suite, or utilize our dining and spa amenities, we handle all personal information with extreme care, rigorous encryption, and absolute discretion.
            </p>
          </div>

          <hr className="border-[#E5E5E5]/60" />

          {/* Section 2 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[#C5B358]">
              <Eye className="w-5 h-5" />
              <h2 className="font-serif text-2xl text-[#1A1A1A] font-normal">2. Information Collection & Usage</h2>
            </div>
            <p className="text-sm text-[#5F5E5E] font-light leading-relaxed">
              We collect essential details strictly necessary to customize your residence experience and process transactions:
            </p>
            <ul className="list-disc list-inside text-sm text-[#5F5E5E] font-light space-y-2 pl-2">
              <li>Contact details (name, official title, email address, telephone number)</li>
              <li>Stay preferences (suite layout, dietary requirements, arrival schedule, chauffeur needs)</li>
              <li>Secure payment and transaction verification credentials</li>
              <li>Encrypted digital interaction logs for seamless concierge continuity</li>
            </ul>
          </div>

          <hr className="border-[#E5E5E5]/60" />

          {/* Section 3 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[#C5B358]">
              <Shield className="w-5 h-5" />
              <h2 className="font-serif text-2xl text-[#1A1A1A] font-normal">3. Non-Disclosure & Security Protocols</h2>
            </div>
            <p className="text-sm text-[#5F5E5E] font-light leading-relaxed">
              Elysia Luxury Hotel does not sell, rent, or trade guest personal data to third parties under any circumstances. Data transferred across our reservation systems and ERP integration layers utilizes bank-grade TLS 1.3 encryption. Private security protocols ensure high-profile guest identities remain strictly confidential.
            </p>
          </div>

          <hr className="border-[#E5E5E5]/60" />

          {/* Section 4 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[#C5B358]">
              <FileText className="w-5 h-5" />
              <h2 className="font-serif text-2xl text-[#1A1A1A] font-normal">4. Your Data Rights & Contact</h2>
            </div>
            <p className="text-sm text-[#5F5E5E] font-light leading-relaxed">
              Guests retain full control over their personal profile. You may request access to, correction of, or deletion of your historical stay records at any time by contacting our Data Governance Officer.
            </p>
            <div className="p-4 bg-[#FAF9F6] border border-[#E5E5E5] flex items-center justify-between text-xs text-[#1A1A1A]">
              <span className="font-light">Data Protection Office: privacy@elysialuxuryhotel.com</span>
              <span className="text-[#C5B358] font-mono">Cap d’Antibes, France</span>
            </div>
          </div>
        </FadeInUp>
      </div>
    </div>
  );
};
