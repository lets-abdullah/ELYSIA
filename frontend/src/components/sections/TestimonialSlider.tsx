import React, { useState, useEffect } from 'react';
import { TESTIMONIALS_DATA } from '../../data/testimonialsData';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const TestimonialSlider: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS_DATA.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? TESTIMONIALS_DATA.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS_DATA.length);
  };

  // eslint-disable-next-line security/detect-object-injection -- reviewed, bound carousel index
  const item = TESTIMONIALS_DATA[currentIndex] || TESTIMONIALS_DATA[0];

  return (
    <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="relative bg-[#FAF9F6] border border-[#E5E5E5] p-8 sm:p-12 text-center rounded-none">
        {/* Quote Icon Ornament */}
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-[#F5F5F0] text-[#C5B358] border border-[#E5E5E5] rounded-none">
            <Quote className="w-8 h-8" />
          </div>
        </div>

        {/* Rating */}
        <div className="flex justify-center space-x-1 mb-6 text-[#C5B358]">
          {[...Array(item.rating)].map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-current" />
          ))}
        </div>

        {/* Dynamic Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            <p className="font-serif text-lg sm:text-2xl text-[#1A1A1A] font-light italic leading-relaxed max-w-3xl mx-auto">
              "{item.quote}"
            </p>

            <div className="flex flex-col items-center justify-center pt-4">
              <img
                src={item.avatar}
                alt={item.guestName}
                className="w-14 h-14 object-cover border border-[#C5B358] mb-3 rounded-none"
                referrerPolicy="no-referrer"
              />
              <h4 className="font-serif text-lg font-normal text-[#1A1A1A]">
                {item.guestName}
              </h4>
              <p className="text-xs text-[#C5B358] uppercase tracking-wider font-medium">
                {item.title} • <span className="text-[#5F5E5E] font-normal">{item.location}</span>
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Carousel Navigation Buttons */}
        <div className="flex items-center justify-between absolute left-4 right-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <button
            onClick={handlePrev}
            className="pointer-events-auto p-2 bg-[#FAF9F6] border border-[#E5E5E5] text-[#1A1A1A] hover:text-[#C5B358] hover:border-[#C5B358] transition-all cursor-pointer rounded-none"
            aria-label="Previous review"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="pointer-events-auto p-2 bg-[#FAF9F6] border border-[#E5E5E5] text-[#1A1A1A] hover:text-[#C5B358] hover:border-[#C5B358] transition-all cursor-pointer rounded-none"
            aria-label="Next review"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Dots */}
        <div className="flex justify-center space-x-2 mt-8">
          {TESTIMONIALS_DATA.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-1.5 transition-all duration-300 cursor-pointer ${
                currentIndex === i ? 'w-8 bg-[#C5B358]' : 'w-2 bg-[#E5E5E5] hover:bg-stone-400'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
