import React from 'react';
import { FadeInUp } from '../components/common/FadeInUp';
import { DOME_GALLERY_IMAGES } from '../data/galleryData';
import DomeGallery from '../component/DomeGallery';

export const GalleryPage: React.FC = () => {
  return (
    <div className="pt-28 pb-20 bg-[#FAF9F6] text-[#1A1A1A] space-y-12 min-h-screen">

      {/* Header Banner */}
      <FadeInUp
        duration={0.7}
        className="max-w-4xl mx-auto px-4 text-center space-y-4 pt-6"
      >
        <span className="text-[11px] uppercase tracking-[0.3em] text-[#5F5E5E] font-medium">
          VISUAL PORTFOLIO
        </span>

        <h1 className="font-serif text-4xl sm:text-6xl font-light text-[#1A1A1A]">
          The Gallery of Elysia
        </h1>

        <p className="text-[#5F5E5E] font-light text-sm max-w-xl mx-auto leading-relaxed">
          Explore architectural photography capturing our minimalist suites, hydrotherapy pools, dining spaces, and coastal grounds.
        </p>
      </FadeInUp>


      {/* Dome Gallery Animation */}
      <FadeInUp
        delay={0.15}
        className="w-full"
      >
        <div className="h-[750px] w-full overflow-hidden">
          <DomeGallery
            images={DOME_GALLERY_IMAGES}
          />
        </div>
      </FadeInUp>

    </div>
  );
};
