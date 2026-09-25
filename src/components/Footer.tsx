import React from "react";
import { Scissors } from "lucide-react";
import { TOKENS } from "../styles/tokens";
import { SITE_CONFIG } from "../config/site";

interface FooterProps {
  onBookAppointment: () => void;
  onToggleAdmin?: () => void;
  studioName?: string;
  email?: string;
  phone?: string;
  instagram?: string;
  instagramUrl?: string;
}

export const Footer: React.FC<FooterProps> = ({
  onBookAppointment,
  onToggleAdmin,
  studioName = SITE_CONFIG.studioName,
  email = SITE_CONFIG.email,
  phone = SITE_CONFIG.phone,
  instagram = SITE_CONFIG.instagram,
  instagramUrl = SITE_CONFIG.instagramUrl,
}) => {
  return (
    <footer className="bg-stone-900 text-stone-300 py-16 md:py-20 border-t border-stone-800">
      <div className="max-w-6xl mx-auto px-6">
        {/* Upper Functional Row */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-10 pb-12">
          {/* Left Zone: Brand + Stacked Contact Info */}
          <div className="space-y-5">
            <div className="flex items-center gap-2.5 text-white">
              <span className="p-1.5 rounded-lg bg-stone-800 text-stone-200">
                <Scissors className={`w-4 h-4 ${TOKENS.accent.icon}`} />
              </span>
              <span className="font-serif text-lg font-bold tracking-tight">
                {studioName}
              </span>
            </div>

            {/* Tight vertically stacked contact information block */}
            <div className="flex flex-col gap-2 text-[13px] text-stone-400 font-sans">
              <a
                id="footer-email-link"
                href={`mailto:${email}`}
                className="hover:text-white transition w-fit"
              >
                {email}
              </a>
              <a
                id="footer-phone-link"
                href={SITE_CONFIG.phoneTel}
                className="hover:text-white transition w-fit"
              >
                {phone}
              </a>
              <a
                id="footer-instagram-link"
                href={instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition w-fit"
              >
                {instagram}
              </a>
            </div>
          </div>

          {/* Right Zone: Balanced Primary Navigation Links */}
          <nav
            aria-label="Footer navigation"
            className="flex flex-col md:flex-row gap-4 md:gap-8 text-[13px] text-stone-400 font-sans items-start md:items-center"
          >
            <button
              id="footer-book-appointment-link"
              onClick={onBookAppointment}
              className="hover:text-white transition cursor-pointer text-left bg-transparent border-0 p-0 font-sans text-[13px] text-stone-400 font-semibold"
            >
              Book Appointment
            </button>
            <a
              id="footer-services-pricing-link"
              href="#services"
              className="hover:text-white transition"
            >
              Services & Pricing
            </a>
            <a
              id="footer-forms-link"
              href="#forms"
              className="hover:text-white transition"
            >
              Inquiry Form
            </a>
          </nav>
        </div>

        {/* Faint Horizontal Divider Line to completely decouple attributions */}
        <div className="border-t border-stone-800/60" />

        {/* Bottom Bar: Copyright and developer credit */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-500 font-sans">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <span>
              &copy; {new Date().getFullYear()} {SITE_CONFIG.studioName}. All
              rights reserved.
            </span>
            {onToggleAdmin && (
              <>
                <span className="text-stone-700 select-none">•</span>
                <button
                  id="footer-admin-link"
                  onClick={onToggleAdmin}
                  className="text-stone-500 hover:text-stone-300 transition cursor-pointer bg-transparent border-0 p-0 font-sans text-[11px]"
                >
                  Admin Login
                </button>
              </>
            )}
          </div>
          <p>
            Developed by{" "}
            <a
              href="https://arii.github.io"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-stone-400 hover:text-white transition font-semibold"
            >
              Ariel Anders
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  );
};
