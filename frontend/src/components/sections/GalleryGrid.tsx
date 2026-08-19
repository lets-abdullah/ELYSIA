import React, { useState } from 'react';
import { GALLERY_DATA } from '../../data/galleryData';
import { GalleryItem } from '../../types';
import { Maximize2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const GalleryGrid: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'All' | 'Suites' | 'Dining' | 'Spa' | 'Grounds'>('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const categories: Array<'All' | 'Suites' | 'Dining' | 'Spa' | 'Grounds'> = ['All', 'Suites', 'Dining', 'Spa', 'Grounds'];

  const filteredItems = activeCategory === 'All'
    ? GALLERY_DATA
    : GALLERY_DATA.filter((item) => item.category === activeCategory);

  // eslint-disable-next-line security/detect-object-injection -- reviewed, bound index
  const activeItem = lightboxIndex !== null && lightboxIndex >= 0 && lightboxIndex < filteredItems.length
    ? filteredItems[lightboxIndex]
    : null;

  const handlePrevLightbox = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex(lightboxIndex === 0 ? filteredItems.length - 1 : lightboxIndex - 1);
    }
  };

  const handleNextLightbox = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % filteredItems.length);
    }
  };

  return (
    <div className="space-y-8">
      {/* Category Filter Tabs */}
      <div className="flex flex-wrap justify-center gap-2 sm:gap-4 border-b border-[#E5E5E5] pb-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2 text-xs uppercase tracking-[0.2em] font-semibold transition-all cursor-pointer rounded-none border ${
              activeCategory === cat
                ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                : 'bg-[#FAF9F6] text-[#1A1A1A] hover:bg-[#1A1A1A]/10 border border-[#E5E5E5]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid Layout */}
      <motion.div
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <AnimatePresence>
          {filteredItems.map((item, index) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              key={item.id}
              onClick={() => setLightboxIndex(index)}
              className="group relative aspect-4/3 overflow-hidden bg-[#F5F5F0] border border-[#E5E5E5] cursor-pointer rounded-none"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 text-white">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#C5B358] font-semibold mb-1">
                  {item.category}
                </span>
                <h4 className="font-serif text-lg font-light leading-snug">{item.title}</h4>
                <p className="text-xs text-[#DBDAD7] font-light mt-1 line-clamp-2">{item.caption}</p>
                <div className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md rounded-none text-white">
                  <Maximize2 className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Lightbox Overlay */}
      <AnimatePresence>
        {activeItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 sm:p-8">
            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute top-6 right-6 p-3 text-white hover:text-[#C5B358] transition-colors cursor-pointer z-50"
              aria-label="Close Lightbox"
            >
              <X className="w-8 h-8" />
            </button>

            {/* Prev / Next Controls */}
            <button
              onClick={handlePrevLightbox}
              className="absolute left-4 sm:left-8 p-3 text-white hover:text-[#C5B358] transition-colors cursor-pointer z-50 bg-black/40 border border-white/20 rounded-none"
              aria-label="Previous Image"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <button
              onClick={handleNextLightbox}
              className="absolute right-4 sm:right-8 p-3 text-white hover:text-[#C5B358] transition-colors cursor-pointer z-50 bg-black/40 border border-white/20 rounded-none"
              aria-label="Next Image"
            >
              <ChevronRight className="w-8 h-8" />
            </button>

            {/* Lightbox Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-5xl w-full flex flex-col items-center space-y-4"
            >
              <div className="max-h-[75vh] overflow-hidden border border-[#E5E5E5] rounded-none">
                <img
                  src={activeItem.image}
                  alt={activeItem.title}
                  className="max-h-[75vh] w-auto object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="text-center text-white space-y-1">
                <span className="text-xs uppercase tracking-[0.25em] text-[#C5B358]">
                  {activeItem.category} • {lightboxIndex! + 1} of {filteredItems.length}
                </span>
                <h3 className="font-serif text-2xl font-light">{activeItem.title}</h3>
                <p className="text-sm text-[#DBDAD7] font-light max-w-xl">{activeItem.caption}</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
