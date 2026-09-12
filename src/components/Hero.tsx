import React from "react";
import { ArrowRight, Calendar, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import { TOKENS } from "../styles/tokens";
import { CLIENT_BIO } from "../data/services";

interface HeroProps {
  onBookAppointment: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onBookAppointment }) => {
  return (
    <section
      id="hero"
      className="relative min-h-[80vh] flex items-center bg-stone-50 py-16 md:py-24 border-b border-stone-200"
    >
      <div className="max-w-6xl mx-auto px-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="lg:col-span-7 space-y-6 text-left"
          >
            {/* Credentials Badge */}
            <div className={TOKENS.badge.credentials}>
              <ShieldCheck
                className={`w-4 h-4 ${TOKENS.accent.icon} shrink-0`}
              />
              <span>{CLIENT_BIO.credentials}</span>
            </div>

            {/* Primary Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-stone-900 tracking-tight leading-[1.12]">
              {CLIENT_BIO.heroHeading}
            </h1>

            {/* Subtext */}
            <p className="text-base md:text-lg text-stone-600 font-sans leading-relaxed max-w-xl">
              {CLIENT_BIO.heroSubtext}
            </p>

            {/* Primary CTA */}
            <div className="pt-2 flex items-center">
              <button
                id="hero-book-btn"
                onClick={onBookAppointment}
                className={TOKENS.button.primary}
              >
                <span>Book Appointment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Scheduling Availability Note */}
            <div className="pt-1 flex items-center gap-1.5 text-xs text-stone-500 font-sans">
              <Calendar className={`w-3.5 h-3.5 ${TOKENS.accent.icon}`} />
              <span>{CLIENT_BIO.logisticsNotice}</span>
            </div>
          </motion.div>

          {/* Minimalist Visual Column (High-Priority LCP Element) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="lg:col-span-5"
          >
            <div className="relative mx-auto max-w-[400px]">
              <div className="relative rounded-2xl overflow-hidden bg-stone-200 border border-stone-200/80 shadow-md aspect-[4/5]">
                <img
                  id="hero-lcp-image"
                  src={CLIENT_BIO.heroImage}
                  alt={`${CLIENT_BIO.studioName} styling portfolio`}
                  width={480}
                  height={600}
                  fetchPriority="high"
                  loading="eager"
                  decoding="async"
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
