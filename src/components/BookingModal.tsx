import React from "react";
import { Calendar, ExternalLink, X, Phone, MessageSquare } from "lucide-react";
import { TOKENS } from "../styles/tokens";
import { SITE_CONFIG } from "../config/site";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventSlug?: string;
  calUsername?: string;
  logisticsNotice?: string;
  locationDisplay?: string;
  stylistName?: string;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  eventSlug = SITE_CONFIG.calDefaultSlug,
  calUsername = SITE_CONFIG.calUsername,
  logisticsNotice = SITE_CONFIG.logisticsNotice,
  locationDisplay = SITE_CONFIG.locationDisplay,
  stylistName = SITE_CONFIG.stylistName,
}) => {
  if (!isOpen) return null;

  const calUrl = `https://cal.com/${calUsername}/${eventSlug}?embed=true&theme=light`;
  const directUrl = `https://cal.com/${calUsername}/${eventSlug}`;

  const cleanPhoneDigits = SITE_CONFIG.phone.replace(/[^0-9]/g, "");

  return (
    <div
      id="booking-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl p-6 max-h-[95vh] flex flex-col overflow-hidden">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-2xl font-serif font-bold text-stone-900">
              Book Your Appointment
            </h3>
            <p className="text-stone-500 text-xs sm:text-sm mt-1 font-sans">
              {logisticsNotice}
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

        {/* Priority CTA: Call or Text Consultation for New Clients */}
        <div className="mb-4 bg-rose-50/80 border border-rose-100 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-widest text-rose-700 font-sans">
              New Client Priority
            </span>
            <p className="text-stone-800 text-xs font-sans leading-relaxed">
              April highly recommends a quick text or call before booking to
              align on your hair density, curl pattern, or event details.
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <a
              href={`tel:${cleanPhoneDigits}`}
              className="px-3.5 py-2 bg-stone-900 text-white font-bold font-sans text-[10px] uppercase tracking-wider rounded-lg hover:bg-stone-800 transition flex items-center gap-1.5 shadow-2xs"
            >
              <Phone className="w-3 h-3" />
              <span>Call</span>
            </a>
            <a
              href={`sms:${cleanPhoneDigits}`}
              className="px-3.5 py-2 bg-rose-600 text-white font-bold font-sans text-[10px] uppercase tracking-wider rounded-lg hover:bg-rose-500 transition flex items-center gap-1.5 shadow-2xs"
            >
              <MessageSquare className="w-3 h-3" />
              <span>Text</span>
            </a>
          </div>
        </div>

        <div className="flex-1 border border-stone-200 rounded-xl overflow-hidden bg-stone-50 relative min-h-[400px]">
          <iframe
            src={calUrl}
            title={`Book an appointment with ${stylistName}`}
            className="w-full h-full min-h-[400px] border-0"
            loading="lazy"
          />
        </div>

        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-stone-100 text-xs text-stone-500">
          <div className="flex items-center gap-1.5">
            <Calendar className={`w-3.5 h-3.5 ${TOKENS.accent.icon}`} />
            <span>On-location appointments in {locationDisplay}</span>
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
