import React, { useState, useEffect, useMemo } from "react";
import { PORTFOLIO_CONTENT } from "../config/site";
import { TOKENS } from "../styles/tokens";
import type { PortfolioItem } from "../types/content";

interface StyleShowcaseProps {
  images?: PortfolioItem[];
}

function PortfolioShowcaseCard({
  item,
  index = 0,
  usedImageUrls = [],
}: {
  item: PortfolioItem;
  index: number;
  usedImageUrls?: string[];
}) {
  const [isHovered, setIsHovered] = useState(false);

  // 1. Deduplicate internally and exclude images already displayed on prior cards
  const photos = useMemo(() => {
    const seen = new Set<string>();
    const originalPhotos = [item.image, ...(item.images || [])].filter(Boolean);

    // First pass: unique to this card and not already claimed by previous columns/rows
    const available = originalPhotos.filter((img) => {
      if (seen.has(img) || usedImageUrls.includes(img)) {
        return false;
      }
      seen.add(img);
      return true;
    });

    // Fallback: if over-filtering leaves the card empty, allow internal uniques only
    if (available.length === 0) {
      const fallbackSeen = new Set<string>();
      return originalPhotos.filter((img) => {
        if (fallbackSeen.has(img)) return false;
        fallbackSeen.add(img);
        return true;
      });
    }

    return available;
  }, [item.image, item.images, usedImageUrls]);

  // 2. Stagger starting frame so different rows don't show the identical first image
  const initialIndex = photos.length > 0 ? index % photos.length : 0;
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  // 3. Staggered rotation cadence: keep the staggered offset of 1.2s * index
  useEffect(() => {
    if (photos.length <= 1) return;

    const initialDelayMs = (index * 1200) % 5000;
    let intervalId: NodeJS.Timeout;

    const timer = setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % photos.length);

      intervalId = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % photos.length);
      }, 5500);
    }, initialDelayMs);

    return () => {
      clearTimeout(timer);
      if (intervalId) clearInterval(intervalId);
    };
  }, [photos.length, index]);

  // Desktop hover previews next available unique example
  useEffect(() => {
    if (photos.length > 1 && isHovered) {
      const hoverTimer = setTimeout(() => {
        setActiveIndex((initialIndex + 1) % photos.length);
      }, 50);
      return () => clearTimeout(hoverTimer);
    }
  }, [isHovered, photos.length, initialIndex]);

  if (photos.length === 0) return null;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`${TOKENS.card.showcase} relative group cursor-pointer overflow-hidden rounded-2xl border border-stone-200 shadow-2xs aspect-5/4 md:aspect-4/3`}
    >
      {photos.map((photo, idx) => (
        <div
          key={photo + idx}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === activeIndex
              ? "opacity-100 z-10"
              : "opacity-0 z-0 pointer-events-none"
          }`}
        >
          <img
            src={photo}
            alt={item.alt || item.title || "Portfolio Hair Style"}
            className="w-full h-full object-cover object-top transition-transform duration-[4000ms] ease-out select-none"
            style={{
              transform:
                isHovered && idx === activeIndex ? "scale(1.04)" : "scale(1)",
            }}
            loading="lazy"
          />
        </div>
      ))}

      {/* Modern, high-end content overlay with title & tag */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5 pt-12 z-20 transition-opacity duration-300">
        <span className="text-[10px] font-bold uppercase tracking-widest text-rose-400 block font-sans">
          {item.tag}
        </span>
        <h3 className="text-lg md:text-xl font-serif font-bold text-white tracking-wide mt-1">
          {item.title}
        </h3>
      </div>

      {/* Tiny indicator dots if more than one image exists */}
      {photos.length > 1 && (
        <div className="absolute top-4 right-4 flex space-x-1.5 z-20 bg-black/35 backdrop-blur-[4px] px-2.5 py-1.5 rounded-full border border-white/10 shadow-xs">
          {photos.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === activeIndex ? "w-3 bg-white" : "w-1.5 bg-white/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export const StyleShowcase: React.FC<StyleShowcaseProps> = ({
  images = PORTFOLIO_CONTENT,
}) => {
  return (
    <section
      id="portfolio"
      className="relative py-16 md:py-20 bg-stone-100/70 border-b border-stone-200 scroll-mt-16"
    >
      <span id="showcase" className="absolute -top-16" />
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {(() => {
            const renderedImageUrls: string[] = [];
            return images.map((item, index) => {
              const currentUsed = [...renderedImageUrls];
              const primaryImage = item.image;
              if (primaryImage) {
                renderedImageUrls.push(primaryImage);
              }
              if (item.images) {
                item.images.forEach((img) => {
                  if (img) renderedImageUrls.push(img);
                });
              }

              return (
                <PortfolioShowcaseCard
                  key={item.id || `portfolio-${index}`}
                  item={item}
                  index={index}
                  usedImageUrls={currentUsed}
                />
              );
            });
          })()}
        </div>
      </div>
    </section>
  );
};
