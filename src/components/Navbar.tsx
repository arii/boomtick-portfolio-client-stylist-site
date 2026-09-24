import React, { useState } from "react";
import { Menu, X, Scissors, Instagram } from "lucide-react";
import { TOKENS } from "../styles/tokens";
import { SITE_CONFIG } from "../config/site";

interface NavbarProps {
  onBookAppointment: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onBookAppointment }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const navItems = [
    { label: "Services & Pricing", href: "#services" },
    { label: "Events & Collaborations", href: "#events" },
  ];

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 box-border w-full">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between w-full box-border">
        {/* Left Pillar: Brand Logo */}
        <div className="flex-1 flex justify-start">
          <a href="#" className="flex items-center gap-2 group">
            <span
              className={`p-1.5 rounded-lg bg-stone-900 text-white ${TOKENS.accent.bgHover} transition`}
            >
              <Scissors className="w-3.5 h-3.5" />
            </span>
            <span className="font-serif text-lg font-bold tracking-tight text-stone-900">
              {SITE_CONFIG.studioName}
            </span>
          </a>
        </div>

        {/* Center Pillar: Desktop Nav Items */}
        <div className="hidden md:flex items-center justify-center gap-8">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-[14px] font-medium text-stone-600 hover:text-stone-950 transition font-sans normal-case"
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* Right Pillar: Action Button & IG */}
        <div className="hidden md:flex items-center justify-end flex-1 gap-4">
          <a
            href={SITE_CONFIG.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={TOKENS.button.icon}
            aria-label={`Instagram ${SITE_CONFIG.instagram}`}
          >
            <Instagram className="w-4.5 h-4.5" />
          </a>
          <button
            id="nav-book-appointment-btn"
            onClick={onBookAppointment}
            className={TOKENS.button.navAction}
          >
            Book Appointment
          </button>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center gap-4">
          <a
            href={SITE_CONFIG.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={TOKENS.button.iconMobile}
            aria-label="Instagram"
          >
            <Instagram className="w-4.5 h-4.5" />
          </a>
          <button
            id="mobile-menu-toggle-btn"
            onClick={toggleMenu}
            className={TOKENS.button.iconMobile}
            aria-label="Toggle Menu"
          >
            {isOpen ? (
              <X className="w-4.5 h-4.5" />
            ) : (
              <Menu className="w-4.5 h-4.5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-stone-200 py-4 px-6 space-y-3 shadow-sm animate-fade-in">
          <div className="flex flex-col gap-3">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="text-[14px] font-medium text-stone-700 hover:text-stone-950 transition font-sans py-2.5 min-h-[44px] flex items-center"
              >
                {item.label}
              </a>
            ))}
            <div className="pt-2 border-t border-stone-100">
              <button
                id="mobile-nav-book-appointment-btn"
                onClick={() => {
                  setIsOpen(false);
                  onBookAppointment();
                }}
                className={TOKENS.button.primaryFull}
              >
                Book Appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
