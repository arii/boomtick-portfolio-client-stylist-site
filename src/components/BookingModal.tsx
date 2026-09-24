import React from "react";
import { Calendar, ExternalLink, X } from "lucide-react";
import { TOKENS } from "../styles/tokens";
import { SITE_CONFIG } from "../config/site";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventSlug?: string;
  calUsername?: string;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  eventSlug = SITE_CONFIG.calDefaultSlug,
  calUsername = SITE_CONFIG.calUsername,
}) => {
  if (!isOpen) return null;

  const calUrl = `https://cal.com/${calUsername}/${eventSlug}?embed=true&theme=light`;
  const directUrl = `https://cal.com/${calUsername}/${eventSlug}`;

  return (
    <div
      id="booking-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl p-6 max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-2xl font-serif font-bold text-stone-900">
              Book Your Appointment
            </h3>
            <p className="text-stone-500 text-xs sm:text-sm mt-1 font-sans">
              {SITE_CONFIG.logisticsNotice} Select your preferred slot below.
            </p>
          </div>
          <button
            id="close-booking-modal-btn"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-2 transition cursor-pointer rounded-lg hover:bg-stone-100"
            aria-label="Close booking modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 border border-stone-200 rounded-xl overflow-hidden bg-stone-50 relative min-h-[480px]">
          <iframe
            src={calUrl}
            title={`Book an appointment with ${SITE_CONFIG.stylistName}`}
            className="w-full h-full min-h-[480px] border-0"
            loading="lazy"
          />
        </div>

        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-stone-100 text-xs text-stone-500">
          <div className="flex items-center gap-1.5">
            <Calendar className={`w-3.5 h-3.5 ${TOKENS.accent.icon}`} />
            <span>
              On-location appointments in {SITE_CONFIG.locationDisplay}
            </span>
          </div>
          <a
            href={directUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-stone-900 font-semibold hover:underline"
          >
            <span>Open in new tab</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
