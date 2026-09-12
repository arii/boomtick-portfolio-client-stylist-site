import { useState, lazy, Suspense } from "react";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { StyleShowcase } from "./components/StyleShowcase";
import { EventsCollaboration } from "./components/EventsCollaboration";
import { InquiryModule } from "./components/InquiryModule";
import { Footer } from "./components/Footer";
import { SchemaOrg } from "./components/SchemaOrg";
import { SERVICES, CLIENT_BIO, Service } from "./data/services";
import { TOKENS } from "./styles/tokens";
import { Clock, ArrowRight, Check, Calendar } from "lucide-react";

// Code-split BookingModal to reduce initial bundle size for faster LCP
const BookingModal = lazy(() =>
  import("./components/BookingModal").then((mod) => ({
    default: mod.BookingModal,
  }))
);

export default function App() {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const handleOpenBooking = (service?: Service) => {
    setSelectedService(service || null);
    setIsBookingOpen(true);
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans selection:bg-rose-100 selection:text-rose-900">
      {/* Dynamic Schema.org JSON-LD Controller */}
      <SchemaOrg />

      {/* Navigation */}
      <Navbar onBookAppointment={() => handleOpenBooking()} />

      {/* 1. Primary Hero Section (LCP Optimized) */}
      <Hero onBookAppointment={() => handleOpenBooking()} />

      {/* 2. Signature Disciplines: Pin-Up & Curly Cuts Showcase Grid */}
      <StyleShowcase />

      {/* 3. Services Menu (Two Core Disciplines) */}
      <section
        id="services"
        className="py-20 md:py-28 bg-white scroll-mt-20 border-b border-stone-200"
      >
        <div className="max-w-6xl mx-auto px-6">
          {/* Header */}
          <div className="max-w-2xl mx-auto text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 tracking-tight">
              Services & Pricing
            </h2>
          </div>

          {/* Consolidated Single Scheduling Callout Banner */}
          <div className={`mb-10 max-w-2xl mx-auto ${TOKENS.card.callout}`}>
            <Calendar className={`w-4 h-4 ${TOKENS.accent.icon} shrink-0`} />
            <span>
              <strong>Scheduling Logistics:</strong> Main appointment
              availability is on <strong>Tuesdays</strong>. On-location hair
              stylist appointments in San Francisco.
            </span>
          </div>

          {/* 2 Clean Core Services Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto gap-8 items-stretch">
            {SERVICES.map((service) => (
              <div
                id={`service-card-${service.id}`}
                key={service.id}
                className={TOKENS.card.service}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-end">
                    <div className="flex items-center gap-1 text-[11px] text-stone-500 shrink-0">
                      <Clock className="w-3 h-3 text-stone-400" />
                      <span>{service.duration}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-serif font-bold text-2xl text-stone-900 leading-snug">
                      {service.name}
                    </h3>
                    <div className="font-serif font-bold text-3xl text-stone-900 mt-1">
                      {service.price}
                    </div>
                  </div>

                  <p className="text-stone-600 text-xs font-sans leading-relaxed">
                    {service.description}
                  </p>

                  <div className="pt-4 border-t border-stone-200/70">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-2.5 font-sans">
                      Included Deliverables:
                    </span>
                    <ul className="space-y-2.5">
                      {service.deliverables.map((item, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-xs text-stone-600 font-sans"
                        >
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-stone-200/70">
                  <button
                    id={`book-service-btn-${service.id}`}
                    onClick={() => handleOpenBooking(service)}
                    className={TOKENS.button.primaryFull}
                  >
                    <span>Book Appointment</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Flexible Events & Productions (Brief Lead-in) */}
      <EventsCollaboration />

      {/* 4. Custom Booking & Event Inquiry Form */}
      <InquiryModule />

      {/* Footer Branding & Standard Navigation */}
      <Footer onBookAppointment={() => handleOpenBooking()} />

      {/* Lazy-loaded Cal.com Embed Modal */}
      {isBookingOpen && (
        <Suspense fallback={null}>
          <BookingModal
            isOpen={isBookingOpen}
            onClose={() => setIsBookingOpen(false)}
            eventSlug={selectedService?.calSlug}
            calUsername={CLIENT_BIO.calUsername}
          />
        </Suspense>
      )}
    </div>
  );
}
