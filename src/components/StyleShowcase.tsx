import React, { useState, useMemo } from "react";
import { PORTFOLIO_CONTENT } from "../config/site";
import type { PortfolioItem } from "../types/content";

interface StyleShowcaseProps {
  images?: PortfolioItem[];
}

function PortfolioShowcaseCard({
  item,
  usedImageUrls = [],
}: {
  item: PortfolioItem;
  usedImageUrls?: string[];
}) {
  const photos = useMemo(() => {
    const originalPhotos = [
      ...new Set([item.image, ...(item.images || [])].filter(Boolean)),
    ];
    const available = originalPhotos.filter(
      (photo) => !usedImageUrls.includes(photo)
    );
    return available.length ? available : originalPhotos;
  }, [item.image, item.images, usedImageUrls]);
  const [activeIndex, setActiveIndex] = useState(0);
  const currentIndex = activeIndex % (photos.length || 1);

  if (photos.length === 0) return null;

  return (
    <figure className="min-w-0">
      <div className="relative overflow-hidden rounded-lg bg-stone-200 aspect-5/4 md:aspect-4/3">
        {photos.map((photo, index) => (
          <img
            key={photo}
            src={photo}
            alt={item.alt || item.title || "Portfolio Hair Style"}
            hidden={index !== currentIndex}
            className="absolute inset-0 w-full h-full object-cover object-top"
            loading="lazy"
          />
        ))}
      </div>
      <figcaption className="pt-4">
        <p className="text-sm text-stone-600 font-sans">{item.tag}</p>
        <h3 className="text-xl font-serif font-bold text-stone-900 mt-1">
          {item.title}
        </h3>
        {photos.length > 1 && (
          <div className="flex items-center gap-4 mt-2 text-sm font-sans text-stone-700">
            <button
              type="button"
              aria-label={`Previous photo: ${item.title}`}
              onClick={() =>
                setActiveIndex(
                  (currentIndex + photos.length - 1) % photos.length
                )
              }
              className="min-h-11 cursor-pointer underline underline-offset-4 hover:text-stone-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-stone-900"
            >
              Previous
            </button>
            <span role="status" aria-live="polite" aria-atomic="true">
              <span className="sr-only">{item.title}, photo </span>
              {currentIndex + 1} / {photos.length}
            </span>
            <button
              type="button"
              aria-label={`Next photo: ${item.title}`}
              onClick={() => setActiveIndex((currentIndex + 1) % photos.length)}
              className="min-h-11 cursor-pointer underline underline-offset-4 hover:text-stone-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-stone-900"
            >
              Next
            </button>
          </div>
        )}
      </figcaption>
    </figure>
  );
}

export const StyleShowcase: React.FC<StyleShowcaseProps> = ({
  images = PORTFOLIO_CONTENT,
}) => {
  const cards = useMemo(() => {
    const usedImageUrls: string[] = [];
    return images.map((item) => {
      const used = [...usedImageUrls];
      usedImageUrls.push(
        ...[item.image, ...(item.images || [])].filter(Boolean)
      );
      return { item, used };
    });
  }, [images]);

  return (
    <section
      id="portfolio"
      className="relative py-16 md:py-20 bg-stone-100/70 border-b border-stone-200 scroll-mt-16"
    >
      <span id="showcase" className="absolute -top-16" />
      <h2 className="sr-only">Portfolio &amp; Style Showcase</h2>
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {cards.map(({ item, used }, index) => (
            <PortfolioShowcaseCard
              key={item.id || `portfolio-${index}`}
              item={item}
              usedImageUrls={used}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
