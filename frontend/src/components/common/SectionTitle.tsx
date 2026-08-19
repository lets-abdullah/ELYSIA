import React from 'react';

interface SectionTitleProps {
  subtitle?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center' | 'right';
  light?: boolean;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({
  subtitle,
  title,
  description,
  align = 'center',
  light = false
}) => {
  const alignClasses = {
    left: 'text-left items-start',
    center: 'text-center items-center mx-auto',
    right: 'text-right items-end ml-auto'
  };

  return (
    // eslint-disable-next-line security/detect-object-injection -- reviewed, typed align prop
    <div className={`flex flex-col max-w-3xl mb-12 sm:mb-16 ${alignClasses[align] || alignClasses.center}`}>
      {subtitle && (
        <div className="flex items-center gap-3 mb-3">
          <span className="w-8 h-px bg-[#C5B358]" />
          <span className="text-xs uppercase tracking-[0.25em] text-[#C5B358] font-semibold">
            {subtitle}
          </span>
          {align === 'center' && <span className="w-8 h-px bg-[#C5B358]" />}
        </div>
      )}
      <h2
        className={`font-serif text-3xl sm:text-4xl md:text-5xl font-light tracking-wide leading-tight ${
          light ? 'text-white' : 'text-[#1A1A1A]'
        }`}
      >
        {title}
      </h2>
      {description && (
        <p
          className={`mt-4 text-base sm:text-lg leading-relaxed font-light ${
            light ? 'text-stone-300' : 'text-[#5F5E5E]'
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
};
