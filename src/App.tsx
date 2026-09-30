import React, { useState, useEffect, lazy, Suspense } from "react";
import { useTina, tinaField } from "./lib/useTina";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { StyleShowcase } from "./components/StyleShowcase";
import { EventsCollaboration } from "./components/EventsCollaboration";
import { InquiryModule } from "./components/InquiryModule";
import { FAQ } from "./components/FAQ";
import { Footer } from "./components/Footer";
import { SchemaOrg } from "./components/SchemaOrg";
import { SITE_CONFIG } from "./config/site";
import { tinaClient } from "./lib/tinaClient";
import { TOKENS } from "./styles/tokens";
import { Clock, ArrowRight, Check } from "lucide-react";
import pageData from "./content/page.json";
import type {
  HeroContent,
  ServiceItem,
  PortfolioContent,
  FAQContent,
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
        pricingNote
        servicesList {
          id
          name
          price
          duration
          description
          deliverables
          calSlug
          examples {
            image
            styleLabel
            alt
          }
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
          images
        }
      }
      faq {
        sectionTitle
        sectionSubtitle
        faqList {
          question
          answer
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

interface ServiceCardProps {
  service: ServiceItem;
  index: number;
  handleOpenBooking: (service: ServiceItem, slug: string) => void;
  liveSite: SiteContent;
}

function ServiceCard({
  service,
  index,
  handleOpenBooking,
  liveSite,
}: ServiceCardProps) {
  const sId = service.id || `service-${index}`;
  const sName = service.name || "Bespoke Styling Service";
  const sPrice = service.price || "Contact for Quote";
  const sDuration = service.duration || "60 mins";
  const sDescription =
    service.description ||
    "Consultation and personalized custom styling tailored to your unique hair profile.";
  const sDeliverables = service.deliverables || [];

  return (
    <div
      id={`service-card-${sId}`}
      className="flex flex-col h-full justify-between bg-white rounded-2xl border border-stone-200 shadow-sm p-6 md:p-8 transition-all duration-300 hover:shadow-md hover:border-stone-300"
    >
      <div className="flex flex-col h-full justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-end">
            <div
              data-tina-field={tinaField(service, "duration")}
              className="flex items-center gap-1 text-[11px] text-stone-500 shrink-0"
            >
              <Clock className="w-3 h-3 text-stone-400" />
              <span>{sDuration}</span>
            </div>
          </div>

          <div>
            <h3
              data-tina-field={tinaField(service, "name")}
              className="font-serif font-bold text-2xl text-stone-900 leading-snug"
            >
              {sName}
            </h3>
            <div
              data-tina-field={tinaField(service, "price")}
              className="font-serif font-bold text-3xl text-stone-900 mt-1"
            >
              {sPrice}
            </div>
          </div>

          <p
            data-tina-field={tinaField(service, "description")}
            className="text-stone-600 text-xs font-sans leading-relaxed"
          >
            {sDescription}
          </p>

          <div className="pt-4 border-t border-stone-200/70">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-700 block mb-2.5 font-sans">
              Included Deliverables:
            </span>
            <ul className="space-y-2.5">
              {sDeliverables.map((item, i) => (
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

        {/* Booking Button padding wrapper */}
        <div className="mt-8 pt-4 border-t border-stone-200/70">
          <button
            id={`book-service-btn-${sId}`}
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
    </div>
  );
}

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
    pricingNote?: string;
    servicesList: ServiceItem[];
  };
  const livePortfolio = (livePage?.portfolio ||
    cmsState.portfolio) as PortfolioContent;
  const liveFaq = (livePage?.faq || cmsState.faq) as FAQContent;
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
              pricingNote?: string;
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
        faq={liveFaq}
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

            {/* Primary Booking Strategy: Prioritize Direct Call/Text for New Clients */}
            <div className="mb-14 max-w-3xl mx-auto bg-stone-900 text-stone-50 rounded-2xl p-6 sm:p-8 md:p-10 shadow-lg border border-stone-800 text-center relative overflow-hidden">
              {/* Subtle background glow or texture for elevated high-end design */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-rose-600/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-stone-100/5 rounded-full blur-3xl pointer-events-none" />

              <span className="text-[11px] font-bold uppercase tracking-widest text-rose-400 font-sans">
                Consultation Priority
              </span>
              <h3 className="mt-2 text-2xl md:text-3xl font-serif font-bold text-white tracking-tight">
                New Client or Event Planner?
              </h3>
              <p className="mt-3.5 max-w-2xl mx-auto text-stone-300 text-sm md:text-base font-sans leading-relaxed">
                April highly recommends a quick text or call to discuss your
                natural texture, hair density, or event requirements before
                booking. It ensures the perfect service and duration are
                scheduled for you!
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
                <a
                  href="tel:415-794-5772"
                  className="w-full sm:w-auto px-6 py-4 bg-white text-stone-950 hover:bg-stone-100 font-bold font-sans tracking-wide text-xs uppercase rounded-xl transition shadow-md inline-flex items-center justify-center gap-2"
                >
                  Call April directly
                </a>
                <a
                  href="sms:415-794-5772"
                  className="w-full sm:w-auto px-6 py-4 bg-rose-600 hover:bg-rose-500 text-white font-bold font-sans tracking-wide text-xs uppercase rounded-xl transition shadow-md inline-flex items-center justify-center gap-2"
                >
                  Text April directly
                </a>
              </div>
            </div>

            {/* Clean Core Services Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto gap-8 items-stretch">
              {(liveServices?.servicesList || []).map((service, idx) => (
                <ServiceCard
                  key={service.id || `service-${idx}`}
                  service={service}
                  index={idx}
                  handleOpenBooking={handleOpenBooking}
                  liveSite={liveSite}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Dynamic Interactive FAQ Accordions for SEO and Conversion */}
        <FAQ content={liveFaq} />

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
