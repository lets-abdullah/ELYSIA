import React from 'react';
import { SectionTitle } from '../components/common/SectionTitle';
import { SERVICES_DATA } from '../data/servicesData';
import { Button } from '../components/common/Button';
import { Sparkles, CheckCircle2, Clock, PhoneCall } from 'lucide-react';
import { FadeInUp } from '../components/common/FadeInUp';

interface ServicesPageProps {
  onNavigate: (page: string) => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ onNavigate }) => {
  return (
    <div className="pt-28 pb-16 space-y-16">
      {/* Header Banner */}
      <FadeInUp duration={0.7} className="relative bg-[#1A1A1A] text-white py-16 border-b border-[#C5B358]/30 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-white/10 border border-[#C5B358]/40 text-[#C5B358] text-xs uppercase tracking-[0.25em] rounded-none">
            <Sparkles className="w-3.5 h-3.5" /> Bespoke Hospitality
          </div>
          <h1 className="font-serif text-4xl sm:text-6xl font-light text-white">
            Spa, Concierge & Curated Services
          </h1>
          <p className="text-[#DBDAD7] font-light text-base max-w-2xl mx-auto leading-relaxed">
            From hydrotherapy mineral rituals at Aurum Spa to Rolls-Royce chauffeur transfers and 75ft Ferretti yacht charters.
          </p>
        </div>
      </FadeInUp>

      {/* Services List Blocks */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {SERVICES_DATA.map((service, index) => {
          const isEven = index % 2 === 0;
          return (
            <FadeInUp
              key={service.id}
              duration={0.65}
              className="bg-[#FAF9F6] border border-[#E5E5E5] rounded-none grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 p-8 sm:p-12 items-center overflow-hidden"
            >
              {/* Image Side */}
              <div className={`aspect-[4/3] bg-[#F5F5F0] border border-[#E5E5E5] rounded-none overflow-hidden ${isEven ? 'lg:order-1' : 'lg:order-2'}`}>
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Text Content */}
              <div className={`space-y-6 ${isEven ? 'lg:order-2' : 'lg:order-1'}`}>
                <div className="space-y-1">
                  <span className="text-xs uppercase tracking-[0.25em] text-[#C5B358] font-semibold">
                    {service.category} Sanctuary
                  </span>
                  <h2 className="font-serif text-3xl font-light text-[#1A1A1A]">{service.title}</h2>
                  <p className="text-xs italic text-[#C5B358] font-serif">{service.subtitle}</p>
                </div>

                <p className="text-sm text-[#5F5E5E] font-light leading-relaxed">
                  {service.description}
                </p>

                {/* Features Checklist */}
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs uppercase tracking-wider text-[#1A1A1A] font-semibold">Inclusions & Capabilities</h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#1A1A1A] font-light">
                    {service.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#C5B358] shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {service.hours && (
                  <div className="flex items-center gap-2 text-xs text-[#5F5E5E] pt-2">
                    <Clock className="w-4 h-4 text-[#C5B358]" />
                    <span>Availability: {service.hours}</span>
                  </div>
                )}

                <div className="pt-4">
                  <Button
                    variant="gold"
                    size="md"
                    onClick={() => {
                      onNavigate('contact');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    Inquire With Concierge
                  </Button>
                </div>
              </div>
            </FadeInUp>
          );
        })}
      </section>

      {/* Direct Concierge Banner */}
      <FadeInUp className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-[#1A1A1A] text-white p-10 sm:p-12 border border-[#C5B358]/40 rounded-none flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left overflow-hidden">

          <div className="relative z-[2] space-y-2">
            <h3 className="font-serif text-2xl font-light">Have a Bespoke Custom Request?</h3>
            <p className="text-xs text-[#DBDAD7] font-light">
              Our Clefs d'Or concierges fulfill private aviation, rare event ticketing, and tailored itineraries 24/7.
            </p>
          </div>
          <div className="relative z-[2] flex items-center gap-3 shrink-0">
            <PhoneCall className="w-5 h-5 text-[#C5B358]" />
            <span className="font-serif text-xl text-[#C5B358]">+33 (0) 4 92 90 00 00</span>
          </div>
        </div>
      </FadeInUp>
    </div>
  );
};

