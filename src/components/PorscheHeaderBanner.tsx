import React, { useState } from 'react';
import { CarFront } from 'lucide-react';
import { CurrencyCode } from '../data/porscheSales';
import bannerLineupImg from '../assets/images/porsche_banner_lineup_1794859236864.jpg';
import banner911Img from '../assets/images/porsche_911_studio_1794859237352.jpg';
import bannerTaycanCayenneImg from '../assets/images/porsche_taycan_cayenne_1794859237415.jpg';

export interface BannerSlide {
  id: string;
  label: string;
  caption: string;
  src: string;
  alt: string;
}

const BANNER_SLIDES: BannerSlide[] = [
  {
    id: 'lineup',
    label: 'Showroom Stuttgart',
    caption: '911 Carrera · Cayenne · Taycan',
    src: bannerLineupImg,
    alt: 'Linha Porsche 911 Carrera, Cayenne e Taycan em showroom arquitetônico em Stuttgart',
  },
  {
    id: 'gt3',
    label: '911 GT3 Studio',
    caption: 'Engenharia de Performance · Zuffenhausen',
    src: banner911Img,
    alt: 'Porsche 911 GT3 metálico em estúdio escuro com pinças de freio vermelhas',
  },
  {
    id: 'taycan-cayenne',
    label: 'Taycan & Cayenne',
    caption: 'Mobilidade Elétrica & SUVs · Leipzig & Bratislava',
    src: bannerTaycanCayenneImg,
    alt: 'Porsche Taycan Cross Turismo e Porsche Cayenne estacionados ao entardecer junto a pavilhão envidraçado',
  },
];

interface PorscheHeaderBannerProps {
  sectionLabel: string;
  title: string;
  subtitle: string;
  currency: CurrencyCode;
  onCurrencyChange: (currency: CurrencyCode) => void;
}

export const PorscheHeaderBanner: React.FC<PorscheHeaderBannerProps> = ({
  sectionLabel,
  title,
  subtitle,
  currency,
  onCurrencyChange,
}) => {
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
  const [failedSlides, setFailedSlides] = useState<Record<string, boolean>>({});

  const currentSlide = BANNER_SLIDES[activeSlideIdx];
  const hasImageError = Boolean(failedSlides[currentSlide.id]);

  return (
    <header className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-[#121720] mb-6 min-h-[220px] sm:min-h-[250px] flex flex-col justify-between">
      {/* Background Photography Layer */}
      {!hasImageError ? (
        <img
          src={currentSlide.src}
          alt={currentSlide.alt}
          referrerPolicy="no-referrer"
          onError={() =>
            setFailedSlides((prev) => ({
              ...prev,
              [currentSlide.id]: true,
            }))
          }
          className="absolute inset-0 w-full h-full object-cover object-[center_45%] transition-opacity duration-300"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#121720] via-[#0E131B] to-[#1C1218] flex items-center justify-end pr-12">
          <div className="flex flex-col items-center text-[#93A0B2]/40">
            <CarFront className="w-16 h-16 stroke-[1.2]" />
            <span className="text-xs mt-2">{currentSlide.label}</span>
          </div>
        </div>
      )}

      {/* Measured Contrast Scrims for WCAG AA Legibility */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-[#0B0E14] via-[#0B0E14]/82 to-[#0B0E14]/25"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-[#0B0E14]/90 via-transparent to-[#0B0E14]/45"
      />

      {/* Top Row: Breadcrumb & Currency Selector */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 px-5 sm:px-7 pt-5">
        <div className="text-xs text-[#C4CDD9]">
          Porsche Analytics <span aria-hidden="true">/</span>{' '}
          <span className="text-[#FF4D64] font-medium">{sectionLabel}</span>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 no-print">
          <label htmlFor="global-currency" className="sr-only">
            Moeda de exibição
          </label>
          <select
            id="global-currency"
            value={currency}
            onChange={(e) => onCurrencyChange(e.target.value as CurrencyCode)}
            className="bg-[#0B0E14]/85 backdrop-blur-sm text-[#F2F4F8] border border-white/15 rounded-md px-3 py-1.5 text-xs focus:outline-none focus:border-[#D5001C] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <option value="BRL">Real (R$)</option>
            <option value="EUR">Euro (€)</option>
            <option value="USD">Dólar (US$)</option>
          </select>
        </div>
      </div>

      {/* Bottom Row: Headline + Gallery Switcher */}
      <div className="relative z-10 flex flex-wrap items-end justify-between gap-4 px-5 sm:px-7 pb-5 pt-10">
        <div className="max-w-2xl">
          <h1 className="font-display text-2xl sm:text-3xl lg:text-[34px] font-semibold text-white tracking-tight leading-tight">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-[#D0D7E2] mt-1.5">{subtitle}</p>
        </div>

        {/* Scene Switcher Controls */}
        <div className="flex flex-col items-start sm:items-end gap-1.5 no-print shrink-0">
          <div className="text-[11px] text-[#C4CDD9]">{currentSlide.caption}</div>
          <div
            role="tablist"
            aria-label="Cenas do cabeçalho Porsche"
            className="inline-flex items-center gap-1 bg-[#0B0E14]/85 backdrop-blur-sm border border-white/15 rounded-lg p-1"
          >
            {BANNER_SLIDES.map((slide, idx) => {
              const isSelected = idx === activeSlideIdx;
              return (
                <button
                  key={slide.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setActiveSlideIdx(idx)}
                  className={`px-2.5 py-1 text-[11px] rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-[#D5001C] text-white font-medium'
                      : 'text-[#C4CDD9] hover:text-white'
                  }`}
                >
                  {slide.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};
