import React from "react";
import { Scissors } from "lucide-react";
import { TOKENS } from "../styles/tokens";
import { CLIENT_BIO } from "../data/services";

interface FooterProps {
  onBookAppointment: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onBookAppointment }) => {
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
                {CLIENT_BIO.studioName}
              </span>
            </div>

            {/* Tight vertically stacked contact information block */}
            <div className="flex flex-col gap-2 text-[13px] text-stone-400 font-sans">
              <a
                id="footer-email-link"
                href={`mailto:${CLIENT_BIO.email}`}
                className="hover:text-white transition w-fit"
              >
                {CLIENT_BIO.email}
              </a>
              <a
                id="footer-phone-link"
                href={`tel:${CLIENT_BIO.phone.replace(/[^0-9]/g, "")}`}
                className="hover:text-white transition w-fit"
              >
                {CLIENT_BIO.phone}
              </a>
              <a
                id="footer-instagram-link"
                href={CLIENT_BIO.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition w-fit"
              >
                {CLIENT_BIO.instagram}
              </a>
            </div>
          </div>

          {/* Right Zone: Balanced Primary Navigation Links */}
          <nav
            aria-label="Footer navigation"
            className="flex flex-col md:flex-row gap-4 md:gap-8 text-[13px] text-stone-400 font-sans"
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
              id="footer-events-link"
              href="#events"
              className="hover:text-white transition"
            >
              Events & Collaborations
            </a>
          </nav>
        </div>

        {/* Faint Horizontal Divider Line to completely decouple attributions */}
        <div className="border-t border-stone-800/60" />

        {/* Bottom Bar: Copyright and developer credit */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-500 font-sans">
          <p>
            &copy; {new Date().getFullYear()} {CLIENT_BIO.studioName}. All
            rights reserved.
          </p>
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
