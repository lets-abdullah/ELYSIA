import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { InputField } from '../components/forms/InputField';
import { DatePicker } from '../components/forms/DatePicker';
import { SubmitButton } from '../components/forms/SubmitButton';
import { contactSchema } from '../utils/validationSchemas';
import { ContactFormData } from '../types';
import { useFormSubmit } from '../hooks/useFormSubmit';
import { MapPin, Phone, Mail, CheckCircle2, Navigation, Compass, Sparkles, ExternalLink } from 'lucide-react';
import { FadeInUp } from '../components/common/FadeInUp';

export const ContactPage: React.FC = () => {
  const { submit, isLoading, response, reset: resetSubmit } = useFormSubmit('/api/erp/contact');

  const {
    register,
    handleSubmit,
    reset: resetForm,
    formState: { errors }
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      subject: 'Inquiry Regarding Private Residence Stay'
    }
  });

  const onSubmit = async (data: ContactFormData) => {
    await submit(data as unknown as Record<string, unknown>);
  };

  const handleReset = () => {
    resetSubmit();
    resetForm();
  };

  return (
    <div className="pt-28 pb-16 space-y-12">
      {/* Header Banner */}
      <FadeInUp duration={0.7} className="bg-[#1A1A1A] text-white py-16 border-b border-[#C5B358]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-white/10 border border-[#C5B358]/40 text-[#C5B358] text-xs uppercase tracking-[0.25em] rounded-none">
            <Sparkles className="w-3.5 h-3.5" /> Clefs d’Or Concierge Service
          </div>
          <h1 className="font-serif text-4xl sm:text-6xl font-light text-white">
            Contact Elysia Concierge
          </h1>
          <p className="text-[#DBDAD7] font-light text-base max-w-2xl mx-auto leading-relaxed">
            Our dedicated guest relations team is at your service 24/7 to orchestrate your private retreat.
          </p>
        </div>
      </FadeInUp>

      {/* Split Layout: Contact Form + Real Map & Coordinates */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Column: Form */}
          <FadeInUp delay={0.1} className="bg-[#FAF9F6] p-8 sm:p-10 border border-[#E5E5E5] rounded-none space-y-6">
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-[0.2em] text-[#C5B358] font-semibold">
                Direct Inquiry
              </span>
              <h2 className="font-serif text-3xl font-light text-[#1A1A1A]">
                Send a Bespoke Message
              </h2>
            </div>

            {response ? (
              <div className="p-8 text-center space-y-4 bg-[#F5F5F0] border border-[#C5B358]/40 rounded-none">
                <div className="w-12 h-12 bg-[#1A1A1A] text-[#C5B358] border border-[#C5B358]/30 rounded-none flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-2xl font-light text-[#1A1A1A]">Inquiry Dispatched</h3>
                <p className="text-xs text-[#5F5E5E]">
                  Reference Tag: <span className="font-mono text-[#C5B358] font-semibold">{response.bookingReference}</span>
                </p>
                <p className="text-xs text-[#5F5E5E] font-light leading-relaxed">
                  Thank you, {response.erpPayload?.payload ? String((response.erpPayload.payload as Record<string, unknown>).name) : 'Guest'}. Your inquiry has been routed to our Head Concierge.
                </p>
                <button
                  onClick={handleReset}
                  className="px-6 py-2.5 bg-[#1A1A1A] text-white border border-[#1A1A1A] text-xs uppercase tracking-[0.15em] font-semibold hover:bg-[#C5B358] hover:border-[#C5B358] hover:text-[#1A1A1A] transition-colors cursor-pointer rounded-none"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    label="Full Name"
                    name="name"
                    placeholder="e.g. Eleanor Vance"
                    register={register('name')}
                    error={errors.name}
                    required
                  />
                  <InputField
                    label="Email Address"
                    type="email"
                    name="email"
                    placeholder="vance@example.com"
                    register={register('email')}
                    error={errors.email}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    label="Phone Number"
                    name="phone"
                    placeholder="+1 (555) 019-2831"
                    register={register('phone')}
                    error={errors.phone}
                  />
                  <DatePicker
                    label="Anticipated Arrival Date"
                    name="arrivalDate"
                    register={register('arrivalDate')}
                    error={errors.arrivalDate}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <InputField
                  label="Subject"
                  name="subject"
                  placeholder="e.g. Residence Booking & Helipad Transfers"
                  register={register('subject')}
                  error={errors.subject}
                  required
                />

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase tracking-wider text-[#1A1A1A] font-semibold">
                    Your Message / Custom Requirements <span className="text-[#C5B358]">*</span>
                  </label>
                  <textarea
                    {...register('message')}
                    rows={4}
                    placeholder="Please specify suite preferences, dietary notes, or chauffeur requirements..."
                    className={`w-full bg-[#FAF9F6] border text-sm text-[#1A1A1A] p-3 outline-none focus:border-[#C5B358] rounded-none ${errors.message ? 'border-red-500' : 'border-[#E5E5E5]'
                      }`}
                  />
                  {errors.message && (
                    <span className="text-xs text-red-600 font-light">{errors.message.message}</span>
                  )}
                </div>

                <SubmitButton label="Submit Inquiry To Concierge" isLoading={isLoading} />
              </form>
            )}
          </FadeInUp>

          {/* Right Column: Location & Real Map Interface */}
          <div className="space-y-6">
            <FadeInUp delay={0.2} className="bg-[#FAF9F6] p-8 border border-[#E5E5E5] rounded-none space-y-6">
              <h3 className="font-serif text-2xl font-light text-[#1A1A1A]">Elysia Hotel Location & Coordinates</h3>

              <div className="space-y-4 text-xs text-[#1A1A1A] font-light">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#C5B358] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-[#1A1A1A]">Physical Address</p>
                    <p className="text-[#5F5E5E]">100 Boulevard de la Garoupe, Cap d’Antibes, 06600 Antibes, French Riviera, France</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Navigation className="w-5 h-5 text-[#C5B358] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-[#1A1A1A]">GPS & Helipad Code</p>
                    <p className="text-[#5F5E5E]">Coordinates: 43.5513° N, 7.1264° E • Helipad Code: LFGA-ELY</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-[#C5B358] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-[#1A1A1A]">Telephone & VIP Concierge</p>
                    <p className="text-[#5F5E5E]">+33 (0) 4 92 90 00 00</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-[#C5B358] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-[#1A1A1A]">Direct Email</p>
                    <p className="text-[#5F5E5E]">concierge@elysialuxuryhotel.com</p>
                  </div>
                </div>
              </div>
            </FadeInUp>

            {/* Real Interactive Location Map */}
            <FadeInUp delay={0.3} className="bg-[#1A1A1A] border border-[#E5E5E5] rounded-none overflow-hidden space-y-0">
              <div className="p-4 bg-[#111111] flex justify-between items-center text-white border-b border-[#222222]">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[#C5B358]" />
                  <span className="text-xs uppercase tracking-widest text-white font-medium">Cap d’Antibes Peninsula</span>
                </div>
                <a
                  href="https://maps.google.com/?q=Cap+d'Antibes+France"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-[#C5B358] hover:text-white uppercase tracking-wider transition-colors"
                >
                  Open Google Maps <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Real Embedded Google Map */}
              <div className="relative w-full h-[320px] bg-neutral-900">
                <iframe
                  title="Elysia Luxury Hotel Location Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d11562.996160100788!2d7.118942!3d43.551322!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12cdd5871f3089d5%3A0xbcae0d29199d750d!2sCap%20d'Antibes!5e0!3m2!1sen!2sfr!4v1700000000000!5m2!1sen!2sfr"
                  className="w-full h-full border-0 filter grayscale contrast-125 opacity-90 hover:grayscale-0 transition-all duration-500"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              <div className="p-4 bg-[#111111] text-xs text-[#DBDAD7] font-light flex items-center justify-between">
                <span>25 min from Nice Côte d’Azur Airport (NCE)</span>
                <span className="text-[#C5B358] font-mono text-[10px]">Private Runway Transfer Available</span>
              </div>
            </FadeInUp>
          </div>
        </div>
      </section>
    </div>
  );
};
