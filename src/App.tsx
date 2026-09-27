import React, { useState, useEffect, lazy, Suspense } from "react";
import { useTina, tinaField } from "./lib/useTina";
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
import pageData from "./content/page.json";
import type {
  HeroContent,
  ServiceItem,
  PortfolioContent,
  EventsContent,
  SiteContent,
  PageContent,
} from "./types/content";

// Code-split heavy modals to optimize initial bundle and LCP
const BookingModal = lazy(() =>
  import("./components/BookingModal").then((mod) => ({
    default: mod.BookingModal,
  }))
);

// Single, Unified GraphQL Query for the Home Page collection
const PAGE_CONTENT_QUERY = `
  query PageContent($relativePath: String!) {
    page(relativePath: $relativePath) {
      hero {
        badge
        headline
        subheading
        availabilityNotice
      }
      services {
        sectionTitle
        servicesList {
          id
          name
          price
          duration
          description
          deliverables
          calSlug
        }
      }
      portfolio {
        heroImage
        ogImage
        ogImageAlt
        portfolioList {
          id
          title
          image
          alt
          tag
        }
      }
      events {
        title
        description
        showForm
        formFields {
          __typename
          ... on PageEventsFormFieldsInputField {
            label
            fieldType
            placeholder
            required
          }
          ... on PageEventsFormFieldsSelectField {
            label
            options
            required
          }
          ... on PageEventsFormFieldsTextareaField {
            label
            placeholder
            required
          }
        }
        formOptions {
          submitButtonText
        }
      }
      site {
        studioName
        stylistName
        title
        description
        keywords
        email
        phone
        instagramHandle
        locationDisplay
        calUsername
        calDefaultSlug
        address {
          locality
          region
          country
        }
        geo {
          latitude
          longitude
        }
        areaServed
        openingDays
        openingHours {
          opens
          closes
        }
        priceRange
      }
    }
  }
`;

export default function App() {
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(
    null
  );
  const [customCalSlug, setCustomCalSlug] = useState<string | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  // Consolidated CMS State initialized from page.json and synchronized reactively
  const [cmsState, setCmsState] = useState<PageContent>(
    () => pageData as unknown as PageContent
  );

  // Single useTina hook registered on the unified page schema
  const { data: liveData } = useTina({
    query: PAGE_CONTENT_QUERY,
    variables: {
      relativePath: "page.json",
    },
    data: { page: cmsState },
  });

  // Extract resolved live content with fallback safety
  const livePage = liveData?.page;
  const liveHero = (livePage?.hero || cmsState.hero) as HeroContent;
  const liveSite = (livePage?.site || cmsState.site) as SiteContent;
  const liveServices = (livePage?.services || cmsState.services) as {
    sectionTitle?: string;
    servicesList: ServiceItem[];
  };
  const livePortfolio = (livePage?.portfolio ||
    cmsState.portfolio) as PortfolioContent;
  const liveEvents = (livePage?.events || cmsState.events) as EventsContent;

  // Single, efficient HTTP query to load content on mount
  useEffect(() => {
    let isMounted = true;

    async function loadContentFromTinaApi() {
      try {
        if (!tinaClient) return;

        const result = await tinaClient.request(
          {
            query: PAGE_CONTENT_QUERY,
            variables: {
              relativePath: "page.json",
            },
          },
          {}
        );

        if (!isMounted) return;

        if (result?.data?.page) {
          const pageData = result.data.page;
          setCmsState({
            hero: (pageData.hero || cmsState.hero) as HeroContent,
            site: (pageData.site || cmsState.site) as SiteContent,
            services: (pageData.services || cmsState.services) as {
              sectionTitle?: string;
              servicesList: ServiceItem[];
            },
            portfolio: (pageData.portfolio ||
              cmsState.portfolio) as PortfolioContent,
            events: (pageData.events || cmsState.events) as EventsContent,
          });
        }
      } catch (err: unknown) {
        console.warn(
          "⚠️ [TinaCMS Info] Fallback to local static assets. Dev server may be launching...",
          err
        );
      }
    }

    loadContentFromTinaApi();
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Hash scroll navigation for section links
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

  // Pre-process the dynamic polymorphic formFields to map __typename to _template
  const processedFormFields = (liveEvents?.formFields || []).map((f) => {
    if (f._template) return f;
    let template: "inputField" | "selectField" | "textareaField" = "inputField";
    if (
      f.__typename === "PageEventsFormFieldsSelectField" ||
      f.__typename === "EventsFormFieldsSelectField"
    ) {
      template = "selectField";
    } else if (
      f.__typename === "PageEventsFormFieldsTextareaField" ||
      f.__typename === "EventsFormFieldsTextareaField"
    ) {
      template = "textareaField";
    }
    return { ...f, _template: template };
  });

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans selection:bg-rose-100 selection:text-rose-900">
      {/* Dynamic Reactive Schema.org JSON-LD & SEO Controller */}
      <SchemaOrg
        siteConfig={liveSite}
        services={liveServices?.servicesList || []}
        portfolio={livePortfolio}
      />

      {/* Navigation */}
      <Navbar
        onBookAppointment={() => handleOpenBooking()}
        studioName={String(liveSite.studioName || SITE_CONFIG.studioName)}
        instagramUrl={String(liveSite.instagramUrl || SITE_CONFIG.instagramUrl)}
      />

      {/* Main Landmark wrapping primary content */}
      <main id="main-content">
        {/* 1. Primary Hero Section (LCP Optimized + Live Preview Hook) */}
        <Hero
          onBookAppointment={() =>
            handleOpenBooking(null, liveSite.calDefaultSlug)
          }
          heroContent={liveHero}
          heroImage={livePortfolio.heroImage || SITE_CONFIG.heroImage}
        />

        {/* 2. Signature Disciplines: Pin-Up & Curly Cuts Showcase Grid (Live Preview Hook) */}
        <StyleShowcase images={livePortfolio?.portfolioList || []} />

        {/* 3. Services Menu (Live Preview Hook) */}
        <section
          id="services"
          className="py-20 md:py-28 bg-white scroll-mt-20 border-b border-stone-200"
        >
          <div className="max-w-6xl mx-auto px-6">
            <div className="max-w-2xl mx-auto text-center mb-10">
              <h2
                data-tina-field={tinaField(liveServices, "sectionTitle")}
                className="text-3xl md:text-4xl font-serif font-bold text-stone-900 tracking-tight"
              >
                {liveServices?.sectionTitle || "Services & Pricing"}
              </h2>
            </div>

            {/* Consolidated Scheduling Callout Banner */}
            <div className={`mb-10 max-w-2xl mx-auto ${TOKENS.card.callout}`}>
              <Calendar className={`w-4 h-4 ${TOKENS.accent.icon} shrink-0`} />
              <span>
                <strong>Scheduling Logistics:</strong>{" "}
                {liveHero.availabilityNotice || SITE_CONFIG.logisticsNotice}
              </span>
            </div>

            {/* Clean Core Services Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto gap-8 items-stretch">
              {(liveServices?.servicesList || []).map((service) => (
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
                      <span className="text-[11px] font-bold uppercase tracking-wider text-stone-700 block mb-2.5 font-sans">
                        Included Deliverables:
                      </span>
                      <ul className="space-y-2.5">
                        {(service.deliverables || []).map((item, i) => (
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
                      onClick={() =>
                        handleOpenBooking(
                          service,
                          service.calSlug || liveSite.calDefaultSlug
                        )
                      }
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

        {/* 4. Flexible Events & Custom Inquiry Form (Live Preview Hook) */}
        <EventsCollaboration content={liveEvents} />
        {liveEvents?.showForm !== false && (
          <InquiryModule
            formFields={processedFormFields}
            submitButtonText={liveEvents?.formOptions?.submitButtonText}
            recipientEmail={liveSite.email || SITE_CONFIG.email}
          />
        )}
      </main>

      {/* Footer Branding & Navigation */}
      <Footer
        onBookAppointment={() => handleOpenBooking()}
        studioName={String(liveSite.studioName || SITE_CONFIG.studioName)}
        email={String(liveSite.email || SITE_CONFIG.email)}
        phone={String(liveSite.phone || SITE_CONFIG.phone)}
        instagram={String(liveSite.instagram || SITE_CONFIG.instagram)}
        instagramUrl={String(liveSite.instagramUrl || SITE_CONFIG.instagramUrl)}
      />

      {/* Code-split Cal.com Embed Modal */}
      {isBookingOpen && (
        <Suspense fallback={null}>
          <BookingModal
            isOpen={isBookingOpen}
            onClose={() => setIsBookingOpen(false)}
            eventSlug={String(
              customCalSlug ||
                selectedService?.calSlug ||
                liveSite.calDefaultSlug ||
                SITE_CONFIG.calDefaultSlug
            )}
            calUsername={String(
              liveSite.calUsername || SITE_CONFIG.calUsername
            )}
            logisticsNotice={String(
              liveHero.availabilityNotice || SITE_CONFIG.logisticsNotice
            )}
            locationDisplay={String(
              liveSite.locationDisplay || SITE_CONFIG.locationDisplay
            )}
            stylistName={String(
              liveSite.stylistName || SITE_CONFIG.stylistName
            )}
          />
        </Suspense>
      )}
    </div>
  );
}
