import { useState, useEffect, lazy, Suspense, useCallback } from "react";
import { useTina, tinaField } from "tinacms/dist/react";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { StyleShowcase } from "./components/StyleShowcase";
import { EventsCollaboration } from "./components/EventsCollaboration";
import { InquiryModule } from "./components/InquiryModule";
import { Footer } from "./components/Footer";
import { SchemaOrg } from "./components/SchemaOrg";
import { SITE_CONFIG } from "./config/site";
import { tinaClient } from "./lib/tinaClient";
import { TOKENS } from "./styles/tokens";
import { Clock, ArrowRight, Check, Calendar } from "lucide-react";
import type {
  HeroContent,
  ServiceItem,
  PortfolioItem,
  EventsContent,
  SiteContent,
} from "./types/content";
import {
  HeroDocument,
  SiteDocument,
  ServicesDocument,
  PortfolioDocument,
  EventsDocument,
} from "../tina/__generated__/types.js";
import heroContentJson from "./content/hero.json";
import siteContentJson from "./content/site.json";
import servicesContentJson from "./content/services.json";
import portfolioContentJson from "./content/portfolio.json";
import eventsContentJson from "./content/events.json";

// Code-split heavy modals to optimize initial bundle and LCP
const BookingModal = lazy(() =>
  import("./components/BookingModal").then((mod) => ({
    default: mod.BookingModal,
  }))
);

// 1. Hero Section Container with TinaCMS data registration
function HeroSectionContainer({
  payload,
  heroImage,
  onBookAppointment,
}: {
  payload: { query: string; variables: { relativePath: string }; data: { hero: HeroContent } };
  heroImage: string;
  onBookAppointment: (slug?: string) => void;
}) {
  const { data } = useTina({
    query: payload.query,
    variables: payload.variables,
    data: payload.data,
    experimental___selectFormByFormId: () => "src/content/hero.json",
  });

  const heroContent = data?.hero || payload.data.hero;

  return (
    <Hero
      onBookAppointment={() => onBookAppointment(heroContent.calSlug)}
      heroContent={heroContent}
      heroImage={heroImage}
    />
  );
}

// 2. Services Section Container with TinaCMS data registration
function ServicesSectionContainer({
  payload,
  availabilityNotice,
  onSelectService,
}: {
  payload: {
    query: string;
    variables: { relativePath: string };
    data: { services: { sectionTitle?: string; servicesList: ServiceItem[] } };
  };
  availabilityNotice: string;
  onSelectService: (service: ServiceItem) => void;
}) {
  const { data } = useTina({
    query: payload.query,
    variables: payload.variables,
    data: payload.data,
    experimental___selectFormByFormId: () => "src/content/services.json",
  });

  const services = data?.services || payload.data.services;
  const sectionTitle = services?.sectionTitle || "Services & Pricing";
  const servicesList: ServiceItem[] = services?.servicesList || [];

  return (
    <section
      id="services"
      className="py-20 md:py-28 bg-white scroll-mt-20 border-b border-stone-200"
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center mb-10">
          <h2
            data-tina-field={tinaField(services, "sectionTitle")}
            className="text-3xl md:text-4xl font-serif font-bold text-stone-900 tracking-tight"
          >
            {sectionTitle}
          </h2>
        </div>

        {/* Consolidated Scheduling Callout Banner */}
        <div className={`mb-10 max-w-2xl mx-auto ${TOKENS.card.callout}`}>
          <Calendar className={`w-4 h-4 ${TOKENS.accent.icon} shrink-0`} />
          <span>
            <strong>Scheduling Logistics:</strong> {availabilityNotice}
          </span>
        </div>

        {/* 2 Clean Core Services Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto gap-8 items-stretch">
          {servicesList.map((service) => (
            <div
              id={`service-card-${service.id}`}
              key={service.id}
              className={TOKENS.card.service}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-end">
                  <div
                    data-tina-field={tinaField(service, "duration")}
                    className="flex items-center gap-1 text-[11px] text-stone-500 shrink-0"
                  >
                    <Clock className="w-3 h-3 text-stone-400" />
                    <span>{service.duration}</span>
                  </div>
                </div>

                <div>
                  <h3
                    data-tina-field={tinaField(service, "name")}
                    className="font-serif font-bold text-2xl text-stone-900 leading-snug"
                  >
                    {service.name}
                  </h3>
                  <div
                    data-tina-field={tinaField(service, "price")}
                    className="font-serif font-bold text-3xl text-stone-900 mt-1"
                  >
                    {service.price}
                  </div>
                </div>

                <p
                  data-tina-field={tinaField(service, "description")}
                  className="text-stone-600 text-xs font-sans leading-relaxed"
                >
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
                  onClick={() => onSelectService(service)}
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
  );
}

// 3. Portfolio Section Container with TinaCMS data registration
function PortfolioSectionContainer({
  payload,
}: {
  payload: {
    query: string;
    variables: { relativePath: string };
    data: { portfolio: { portfolioList: PortfolioItem[] } };
  };
}) {
  const { data } = useTina({
    query: payload.query,
    variables: payload.variables,
    data: payload.data,
    experimental___selectFormByFormId: () => "src/content/portfolio.json",
  });

  const portfolio = data?.portfolio || payload.data.portfolio;
  return <StyleShowcase images={portfolio?.portfolioList} />;
}

// 4. Events Section Container with TinaCMS data registration
function EventsSectionContainer({
  payload,
  recipientEmail,
}: {
  payload: {
    query: string;
    variables: { relativePath: string };
    data: { events: EventsContent };
  };
  recipientEmail: string;
}) {
  const { data } = useTina({
    query: payload.query,
    variables: payload.variables,
    data: payload.data,
    experimental___selectFormByFormId: () => "src/content/events.json",
  });

  const events = data?.events || payload.data.events;

  return (
    <>
      <EventsCollaboration content={events} />
      {events?.showForm !== false && (
        <InquiryModule
          formFields={events?.formFields}
          submitButtonText={events?.formOptions?.submitButtonText}
          recipientEmail={recipientEmail}
        />
      )}
    </>
  );
}

// 5. Site Settings Bridge with TinaCMS data registration
function SiteSettingsBridge({
  payload,
  onSiteUpdate,
}: {
  payload: {
    query: string;
    variables: { relativePath: string };
    data: { site: SiteContent };
  };
  onSiteUpdate: (site: Partial<SiteContent>) => void;
}) {
  const { data } = useTina({
    query: payload.query,
    variables: payload.variables,
    data: payload.data,
    experimental___selectFormByFormId: () => "src/content/site.json",
  });

  const site = data?.site || payload.data.site;

  useEffect(() => {
    if (site) {
      onSiteUpdate(site);
    }
  }, [site, onSiteUpdate]);

  return null;
}

export default function App() {
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(
    null
  );
  const [customCalSlug, setCustomCalSlug] = useState<string | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  // Dynamic Site Layout Settings (Driven by TinaCMS site.json)
  const [siteState, setSiteState] = useState({
    studioName: SITE_CONFIG.studioName,
    stylistName: SITE_CONFIG.stylistName,
    email: SITE_CONFIG.email,
    phone: SITE_CONFIG.phone,
    instagram: SITE_CONFIG.instagram,
    instagramUrl: SITE_CONFIG.instagramUrl,
    calUsername: SITE_CONFIG.calUsername,
    calDefaultSlug: SITE_CONFIG.calDefaultSlug,
    availabilityBanner: SITE_CONFIG.logisticsNotice,
  });

  const handleSiteUpdate = useCallback((site: Partial<SiteContent>) => {
    if (!site) return;
    setSiteState((prev) => {
      const updated = { ...prev };
      if (site.studioName) updated.studioName = site.studioName;
      if (site.stylistName) updated.stylistName = site.stylistName;
      if (site.email) updated.email = site.email;
      if (site.phone) updated.phone = site.phone;
      if (site.calUsername) updated.calUsername = site.calUsername;
      if (site.calDefaultSlug) updated.calDefaultSlug = site.calDefaultSlug;
      if (site.availabilityBanner)
        updated.availabilityBanner = site.availabilityBanner;
      if (site.instagramHandle) {
        const clean = site.instagramHandle.replace(/^@/, "");
        updated.instagram = `@${clean}`;
        updated.instagramUrl = `https://www.instagram.com/${clean}/`;
      }
      return updated;
    });
  }, []);

  // TinaCMS Individual Document Payloads (Single-Document Queries Passed directly to useTina)
  const [heroPayload, setHeroPayload] = useState({
    query: HeroDocument,
    variables: { relativePath: "hero.json" },
    data: { hero: heroContentJson as unknown as HeroContent },
  });

  const [servicesPayload, setServicesPayload] = useState({
    query: ServicesDocument,
    variables: { relativePath: "services.json" },
    data: { services: servicesContentJson as unknown as { sectionTitle?: string; servicesList: ServiceItem[] } },
  });

  const [portfolioPayload, setPortfolioPayload] = useState({
    query: PortfolioDocument,
    variables: { relativePath: "portfolio.json" },
    data: { portfolio: portfolioContentJson as unknown as { portfolioList: PortfolioItem[] } },
  });

  const [eventsPayload, setEventsPayload] = useState({
    query: EventsDocument,
    variables: { relativePath: "events.json" },
    data: { events: eventsContentJson as unknown as EventsContent },
  });

  const [sitePayload, setSitePayload] = useState({
    query: SiteDocument,
    variables: { relativePath: "site.json" },
    data: { site: siteContentJson as unknown as SiteContent },
  });

  // 1. Initial live query via TinaCMS API (local dev server or TinaCloud)
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
          setHeroPayload({
            query: heroRes.value.query || HeroDocument,
            variables: heroRes.value.variables || { relativePath: "hero.json" },
            data: heroRes.value.data as { hero: HeroContent },
          });
        }

        if (siteRes.status === "fulfilled" && siteRes.value?.data?.site) {
          setSitePayload({
            query: siteRes.value.query || SiteDocument,
            variables: siteRes.value.variables || { relativePath: "site.json" },
            data: siteRes.value.data as unknown as { site: SiteContent },
          });
        }

        if (servicesRes.status === "fulfilled" && servicesRes.value?.data?.services) {
          setServicesPayload({
            query: servicesRes.value.query || ServicesDocument,
            variables: servicesRes.value.variables || { relativePath: "services.json" },
            data: servicesRes.value.data as unknown as { services: { sectionTitle?: string; servicesList: ServiceItem[] } },
          });
        }

        if (portfolioRes.status === "fulfilled" && portfolioRes.value?.data?.portfolio) {
          setPortfolioPayload({
            query: portfolioRes.value.query || PortfolioDocument,
            variables: portfolioRes.value.variables || { relativePath: "portfolio.json" },
            data: portfolioRes.value.data as unknown as { portfolio: { portfolioList: PortfolioItem[] } },
          });
        }

        if (eventsRes.status === "fulfilled" && eventsRes.value?.data?.events) {
          setEventsPayload({
            query: eventsRes.value.query || EventsDocument,
            variables: eventsRes.value.variables || { relativePath: "events.json" },
            data: eventsRes.value.data as unknown as { events: EventsContent },
          });
        }
      } catch {
        // Silently preserve initial SSOT static content
      }
    }

    loadContentFromTinaApi();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Hash scroll navigation for section links
  useEffect(() => {
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
    return () => {
      window.removeEventListener("hashchange", handleHashScroll);
    };
  }, []);

  const handleOpenBooking = (service?: ServiceItem | null, slug?: string) => {
    setSelectedService(service ?? null);
    setCustomCalSlug(slug || service?.calSlug || null);
    setIsBookingOpen(true);
  };

  const mainSiteContent = (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans selection:bg-rose-100 selection:text-rose-900">
      {/* Dynamic Schema.org JSON-LD Controller */}
      <SchemaOrg />

      {/* TinaCMS Site Settings Bridge */}
      <SiteSettingsBridge
        payload={sitePayload}
        onSiteUpdate={handleSiteUpdate}
      />

      {/* Navigation */}
      <Navbar
        onBookAppointment={() => handleOpenBooking()}
        studioName={siteState.studioName}
        instagramUrl={siteState.instagramUrl}
      />

      {/* 1. Primary Hero Section (LCP Optimized + TinaCMS Live Hook) */}
      <HeroSectionContainer
        payload={heroPayload}
        heroImage={SITE_CONFIG.heroPreloadImage}
        onBookAppointment={(slug) => handleOpenBooking(null, slug)}
      />

      {/* 2. Signature Disciplines: Pin-Up & Curly Cuts Showcase Grid (TinaCMS Live Hook) */}
      <PortfolioSectionContainer payload={portfolioPayload} />

      {/* 3. Services Menu (TinaCMS Live Hook) */}
      <ServicesSectionContainer
        payload={servicesPayload}
        availabilityNotice={
          heroPayload.data.hero.availabilityNotice ||
          siteState.availabilityBanner ||
          SITE_CONFIG.logisticsNotice
        }
        onSelectService={(service) => handleOpenBooking(service, service.calSlug)}
      />

      {/* 4. Flexible Events & Custom Inquiry Form (TinaCMS Live Hook) */}
      <EventsSectionContainer
        payload={eventsPayload}
        recipientEmail={siteState.email}
      />

      {/* Footer Branding & Navigation */}
      <Footer
        onBookAppointment={() => handleOpenBooking()}
        onToggleAdmin={() => {
          window.location.href = "/admin";
        }}
        studioName={siteState.studioName}
        email={siteState.email}
        phone={siteState.phone}
        instagram={siteState.instagram}
        instagramUrl={siteState.instagramUrl}
      />

      {/* Code-split Cal.com Embed Modal */}
      {isBookingOpen && (
        <Suspense fallback={null}>
          <BookingModal
            isOpen={isBookingOpen}
            onClose={() => setIsBookingOpen(false)}
            eventSlug={
              customCalSlug ||
              selectedService?.calSlug ||
              heroPayload.data.hero.calSlug ||
              siteState.calDefaultSlug ||
              "april-demo"
            }
            calUsername={siteState.calUsername || "ariel-anders"}
          />
        </Suspense>
      )}
    </div>
  );

  return mainSiteContent;
}
