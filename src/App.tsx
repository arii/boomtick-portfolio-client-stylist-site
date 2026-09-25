import { useState, useEffect, lazy, Suspense } from "react";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { StyleShowcase } from "./components/StyleShowcase";
import { EventsCollaboration } from "./components/EventsCollaboration";
import { InquiryModule } from "./components/InquiryModule";
import { Footer } from "./components/Footer";
import { SchemaOrg } from "./components/SchemaOrg";
import {
  SITE_CONFIG,
  HERO_CONTENT,
  EVENTS_CONTENT,
  SERVICES_CONTENT,
  PORTFOLIO_CONTENT,
} from "./config/site";
import { tinaClient } from "./lib/tinaClient";
import { TOKENS } from "./styles/tokens";
import { Clock, ArrowRight, Check, Calendar } from "lucide-react";
import type {
  HeroContent,
  ServiceItem,
  PortfolioItem,
  EventsContent,
  FormFieldItem,
} from "./types/content";

// Code-split heavy modals to optimize initial bundle and LCP
const BookingModal = lazy(() =>
  import("./components/BookingModal").then((mod) => ({
    default: mod.BookingModal,
  }))
);

const AdminMockup = lazy(() =>
  import("./components/AdminMockup").then((mod) => ({
    default: mod.AdminMockup,
  }))
);

export default function App() {
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(
    null
  );
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return (
        params.get("admin") === "true" || window.location.hash === "#admin"
      );
    }
    return false;
  });

  // Dynamic Content States (Initialized with SSOT static defaults)
  const [heroState, setHeroState] = useState<HeroContent>(HERO_CONTENT);
  const [eventsState, setEventsState] = useState<EventsContent>(EVENTS_CONTENT);
  const [servicesState, setServicesState] =
    useState<ServiceItem[]>(SERVICES_CONTENT);
  const [portfolioState, setPortfolioState] =
    useState<PortfolioItem[]>(PORTFOLIO_CONTENT);
  const [emailState, setEmailState] = useState(SITE_CONFIG.email);
  const [phoneState, setPhoneState] = useState(SITE_CONFIG.phone);
  const [instagramState, setInstagramState] = useState(SITE_CONFIG.instagram);
  const [instagramUrlState, setInstagramUrlState] = useState(
    SITE_CONFIG.instagramUrl
  );
  const [heroImageState, setHeroImageState] = useState(
    SITE_CONFIG.heroPreloadImage
  );
  const [calUsernameState, setCalUsernameState] = useState(
    SITE_CONFIG.calUsername
  );
  const [calDefaultSlugState, setCalDefaultSlugState] = useState(
    SITE_CONFIG.calDefaultSlug
  );

  // 1. Live Querying via TinaCMS Content API (when available)
  useEffect(() => {
    let isMounted = true;

    async function loadContentFromTinaApi() {
      try {
        if (!tinaClient?.queries) return;

        const results = await Promise.allSettled([
          tinaClient.queries.hero({ relativePath: "hero.json" }),
          tinaClient.queries.site({ relativePath: "site.json" }),
          tinaClient.queries.services({ relativePath: "services.json" }),
          tinaClient.queries.portfolio({ relativePath: "portfolio.json" }),
          tinaClient.queries.events({ relativePath: "events.json" }),
        ]);

        if (!isMounted) return;

        const [heroRes, siteRes, servicesRes, portfolioRes, eventsRes] = results;

        if (heroRes.status === "fulfilled" && heroRes.value?.data?.hero) {
          const h = heroRes.value.data.hero;
          setHeroState((prev) => ({
            ...prev,
            badge: h.badge || prev.badge,
            headline: h.headline || prev.headline,
            subheading: h.subheading || prev.subheading,
            availabilityNotice: h.availabilityNotice || prev.availabilityNotice,
            calSlug: h.calSlug || prev.calSlug,
          }));
        }

        if (siteRes.status === "fulfilled" && siteRes.value?.data?.site) {
          const s = siteRes.value.data.site;
          if (s.email) setEmailState(s.email);
          if (s.phone) setPhoneState(s.phone);
          if (s.calUsername) setCalUsernameState(s.calUsername);
          if (s.calDefaultSlug) setCalDefaultSlugState(s.calDefaultSlug);
          if (s.instagramHandle) {
            const clean = s.instagramHandle.replace(/^@/, "");
            setInstagramState(`@${clean}`);
            setInstagramUrlState(`https://www.instagram.com/${clean}/`);
          }
        }

        if (
          servicesRes.status === "fulfilled" &&
          servicesRes.value?.data?.services?.servicesList
        ) {
          setServicesState(
            servicesRes.value.data.services.servicesList as ServiceItem[]
          );
        }

        if (
          portfolioRes.status === "fulfilled" &&
          portfolioRes.value?.data?.portfolio?.portfolioList
        ) {
          setPortfolioState(
            portfolioRes.value.data.portfolio.portfolioList as PortfolioItem[]
          );
        }

        if (eventsRes.status === "fulfilled" && eventsRes.value?.data?.events) {
          const ev = eventsRes.value.data.events;
          setEventsState((prev) => ({
            ...prev,
            title: ev.title || prev.title,
            description: ev.description || prev.description,
            showForm:
              typeof ev.showForm === "boolean" ? ev.showForm : prev.showForm,
            formFields:
              (ev.formFields as unknown as FormFieldItem[]) || prev.formFields,
          }));
        }
      } catch {
        // Silently preserve SSOT static content
      }
    }

    loadContentFromTinaApi();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. TinaCMS Live Preview Data Re-hydration & Iframe Bridge
  useEffect(() => {
    // Notify parent window (TinaCMS live editor) that preview iframe is ready
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: "tina:ready" }, "*");
      window.parent.postMessage({ type: "url-changed" }, "*");
    }

    // Scroll to section hash when navigating via TinaCMS router
    const handleHashScroll = () => {
      if (window.location.hash) {
        const id = window.location.hash.replace("#", "");
        const target = document.getElementById(id);
        if (target) {
          target.scrollIntoView({ behavior: "smooth" });
        }
      }
    };

    handleHashScroll();
    window.addEventListener("hashchange", handleHashScroll);

    const handleTinaMessage = (event: MessageEvent) => {
      if (!event.data) return;

      // Handle direct document updates from Tina CMS live preview
      const { type, data, collection, values } = event.data;
      const payload = values || data;

      if (!payload) return;

      if (collection === "hero" || type?.includes("hero") || payload.headline) {
        setHeroState((prev) => ({
          ...prev,
          ...payload,
        }));
      }

      if (
        collection === "services" ||
        type?.includes("services") ||
        payload.servicesList
      ) {
        if (Array.isArray(payload.servicesList)) {
          setServicesState(payload.servicesList);
        }
      }

      if (
        collection === "portfolio" ||
        type?.includes("portfolio") ||
        payload.portfolioList
      ) {
        if (Array.isArray(payload.portfolioList)) {
          setPortfolioState(payload.portfolioList);
        }
      }

      if (collection === "events" || type?.includes("events") || payload.title) {
        setEventsState((prev) => ({
          ...prev,
          ...payload,
        }));
      }

      if (collection === "site" || type?.includes("site")) {
        if (payload.email) setEmailState(payload.email);
        if (payload.phone) setPhoneState(payload.phone);
        if (payload.calUsername) setCalUsernameState(payload.calUsername);
        if (payload.calDefaultSlug)
          setCalDefaultSlugState(payload.calDefaultSlug);
        if (payload.instagramHandle) {
          const clean = payload.instagramHandle.replace(/^@/, "");
          setInstagramState(`@${clean}`);
          setInstagramUrlState(`https://www.instagram.com/${clean}/`);
        }
      }
    };

    window.addEventListener("message", handleTinaMessage);
    return () => {
      window.removeEventListener("message", handleTinaMessage);
      window.removeEventListener("hashchange", handleHashScroll);
    };
  }, []);

  const handleOpenBooking = (service?: ServiceItem) => {
    setSelectedService(service ?? null);
    setIsBookingOpen(true);
  };

  const mainSiteContent = (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans selection:bg-rose-100 selection:text-rose-900">
      {/* Dynamic Schema.org JSON-LD Controller */}
      <SchemaOrg />

      {/* Navigation */}
      <Navbar onBookAppointment={() => handleOpenBooking()} />

      {/* 1. Primary Hero Section (LCP Optimized) */}
      <Hero
        onBookAppointment={() => handleOpenBooking()}
        heroContent={heroState}
        heroImage={heroImageState}
      />

      {/* 2. Signature Disciplines: Pin-Up & Curly Cuts Showcase Grid */}
      <StyleShowcase images={portfolioState} />

      {/* 3. Services Menu (Two Core Disciplines) */}
      <section
        id="services"
        className="py-20 md:py-28 bg-white scroll-mt-20 border-b border-stone-200"
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 tracking-tight">
              Services & Pricing
            </h2>
          </div>

          {/* Consolidated Scheduling Callout Banner */}
          <div className={`mb-10 max-w-2xl mx-auto ${TOKENS.card.callout}`}>
            <Calendar className={`w-4 h-4 ${TOKENS.accent.icon} shrink-0`} />
            <span>
              <strong>Scheduling Logistics:</strong>{" "}
              {heroState.availabilityNotice}
            </span>
          </div>

          {/* 2 Clean Core Services Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto gap-8 items-stretch">
            {servicesState.map((service) => (
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

      {/* 4. Flexible Events & Productions */}
      <EventsCollaboration content={eventsState} />

      {/* 5. Custom Booking & Event Inquiry Form */}
      {eventsState.showForm !== false && <InquiryModule />}

      {/* Footer Branding & Navigation */}
      <Footer
        onBookAppointment={() => handleOpenBooking()}
        onToggleAdmin={() => {
          setIsAdminOpen(true);
        }}
        email={emailState}
        phone={phoneState}
        instagram={instagramState}
        instagramUrl={instagramUrlState}
      />

      {/* Code-split Cal.com Embed Modal */}
      {isBookingOpen && (
        <Suspense fallback={null}>
          <BookingModal
            isOpen={isBookingOpen}
            onClose={() => setIsBookingOpen(false)}
            eventSlug={selectedService?.calSlug || heroState.calSlug || calDefaultSlugState}
            calUsername={calUsernameState}
          />
        </Suspense>
      )}
    </div>
  );

  if (isAdminOpen) {
    return (
      <Suspense
        fallback={
          <div className="min-h-screen bg-stone-950 text-stone-200 flex items-center justify-center font-mono text-sm">
            Loading CMS Portal...
          </div>
        }
      >
        <AdminMockup
          heroContent={heroState}
          setHeroContent={setHeroState}
          eventsContent={eventsState}
          setEventsContent={setEventsState}
          servicesContent={servicesState}
          setServicesContent={setServicesState}
          portfolioContent={portfolioState}
          setPortfolioContent={setPortfolioState}
          onClose={() => setIsAdminOpen(false)}
          email={emailState}
          setEmail={setEmailState}
          phone={phoneState}
          setPhone={setPhoneState}
          instagram={instagramState}
          setInstagram={setInstagramState}
          instagramUrl={instagramUrlState}
          setInstagramUrl={setInstagramUrlState}
          heroImage={heroImageState}
          setHeroImage={setHeroImageState}
        >
          {mainSiteContent}
        </AdminMockup>
      </Suspense>
    );
  }

  return mainSiteContent;
}
