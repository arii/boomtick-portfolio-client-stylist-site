import React from "react";
import { PORTFOLIO_CONTENT } from "../config/site";
import { TOKENS } from "../styles/tokens";
import type { PortfolioItem } from "../types/content";

interface StyleShowcaseProps {
  images?: PortfolioItem[];
}

export const StyleShowcase: React.FC<StyleShowcaseProps> = ({
  images = PORTFOLIO_CONTENT,
}) => {
  return (
    <section
      id="showcase"
      className="py-14 md:py-18 bg-stone-100/70 border-b border-stone-200"
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {images.map((item) => (
            <div key={item.id} id={item.id} className={TOKENS.card.showcase}>
              <img
                src={item.image}
                alt={item.alt}
                width={800}
                height={600}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover object-top transition duration-300 group-hover:scale-102"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
