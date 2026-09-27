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
import type {
  HeroContent,
  ServiceItem,
  PortfolioItem,
  EventsContent,
  SiteContent,
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

// Single, Unified GraphQL Query for all 5 TinaCMS Collections
const ALL_CONTENT_QUERY = `
  query AllContent($heroPath: String!, $sitePath: String!, $servicesPath: String!, $portfolioPath: String!, $eventsPath: String!) {
    hero(relativePath: $heroPath) {
      badge
      headline
      subheading
      availabilityNotice
      calSlug
    }
    site(relativePath: $sitePath) {
      studioName
      stylistName
      credentials
      title
      browserTitle
      description
      metaDescription
      keywords
      email
      phone
      emailFallback
      phoneFallback
      instagramHandle
      locationDisplay
      availabilityBanner
      logisticsNotice
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
      heroHeading
      heroSubtext
      ogImageRelative
      ogImageFallbackRelative
      ogImageAlt
      ogImageWidth
      ogImageHeight
      heroPreloadImage
      portfolioImagesRelative
    }
    services(relativePath: $servicesPath) {
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
    portfolio(relativePath: $portfolioPath) {
      portfolioList {
        id
        image
        alt
        tag
      }
    }
    events(relativePath: $eventsPath) {
      title
      description
      showForm
      formFields {
        __typename
        ... on EventsFormFieldsInputField {
          label
          fieldType
          placeholder
          required
        }
        ... on EventsFormFieldsSelectField {
          label
          options
          required
        }
        ... on EventsFormFieldsTextareaField {
          label
          placeholder
          required
        }
      }
      formOptions {
        submitButtonText
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
  const [isAdminOpen, setIsAdminOpen] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return (
        params.get("admin") === "true" || window.location.hash === "#admin"
      );
    }
    return false;
  });

  // Consolidated CMS State serving as local fallback and reactive Single Source of Truth (SSOT)
  const [cmsState, setCmsState] = useState<{
    hero: HeroContent;
    site: SiteContent;
    services: {
      sectionTitle?: string;
      servicesList: ServiceItem[];
    };
    portfolio: {
      portfolioList: PortfolioItem[];
    };
    events: EventsContent;
  }>(() => {
    const rawSite = SITE_CONFIG as unknown as SiteContent;
    return {
      hero: {
        badge: "Licensed Professional",
        headline: "Curly Hair Cuts & Vintage Styling specialist",
        subheading:
          "April specializes in custom dry curly cuts, classic victory rolls, waves, retro pageantry hair, and commercial production styling across the San Francisco Bay Area.",
        availabilityNotice:
          "Taking Select New Clients for Autumn • Book via Cal.com",
        calSlug: "april-demo",
      },
      site: {
        ...rawSite,
        studioName: SITE_CONFIG.studioName,
        stylistName: SITE_CONFIG.stylistName,
        email: SITE_CONFIG.email,
        phone: SITE_CONFIG.phone,
        instagramHandle: (SITE_CONFIG.instagram || "").replace(/^@/, ""),
        instagram: SITE_CONFIG.instagram,
        instagramUrl: SITE_CONFIG.instagramUrl,
        calUsername: SITE_CONFIG.calUsername,
        calDefaultSlug: SITE_CONFIG.calDefaultSlug,
        availabilityBanner: SITE_CONFIG.logisticsNotice,
        locationDisplay: SITE_CONFIG.locationDisplay,
        logisticsNotice: SITE_CONFIG.logisticsNotice,
        address: SITE_CONFIG.address || {
          locality: "San Francisco",
          region: "CA",
          country: "US",
        },
        geo: SITE_CONFIG.geo || { latitude: 37.7749, longitude: -122.4194 },
        areaServed: SITE_CONFIG.areaServed || ["San Francisco, CA", "Bay Area"],
        openingDays: SITE_CONFIG.openingDays || ["Tuesday"],
        openingHours: SITE_CONFIG.openingHours || {
          opens: "09:00",
          closes: "18:00",
        },
        priceRange: SITE_CONFIG.priceRange || "$$",
        title: SITE_CONFIG.title,
        description: SITE_CONFIG.description,
        browserTitle: SITE_CONFIG.title,
        metaDescription: SITE_CONFIG.description,
        keywords: SITE_CONFIG.keywords || [],
        ogImageRelative: "/assets/portfolio-4.webp",
        ogImageFallbackRelative: "/assets/og-cover.jpg",
        ogImageAlt: "Hair by April - Curly Cuts & Vintage Styling SF",
        ogImageWidth: 620,
        ogImageHeight: 758,
        heroPreloadImage: "/assets/portfolio-4.webp",
        portfolioImagesRelative: [],
        heroHeading: "Curly Hair Cuts & Vintage Styling",
        heroSubtext: "dry cutting and vintage victory rolls",
      },
      services: {
        sectionTitle: "Services & Pricing",
        servicesList: [
          {
            id: "curly-cut",
            name: "Dry Curly Cut & Styled Finish",
            price: "$175",
            duration: "2 hours",
            description:
              "Customized dry-cutting method designed specifically for your natural texture, curl pattern, and density. Includes detox wash, deep hydration styling, and step-by-step coaching on maintenance.",
            deliverables: [
              "Detailed dry-shaping consultation based on lifestyle and hair goals",
              "Precision dry curly cut tailored to your unique bounce & pattern",
              "Botanical detox wash & custom deep conditioning treatment",
              "Interactive styling session with step-by-step guidance",
              "Diffused finish or hood dry setting with premium curl products",
            ],
            calSlug: "april-demo",
          },
          {
            id: "vintage-updo",
            name: "Classic Vintage Hair & Special Event Updos",
            price: "$145",
            duration: "90 minutes",
            description:
              "Authentic victory rolls, vintage bumper bangs, sleek Hollywood waves, and classic pin-up styling. Built with meticulous backcombing, pinning, and setting techniques for maximum durability and longevity.",
            deliverables: [
              "Individual consultation to match styling with vintage era outfits",
              "Hair preparation with vintage-appropriate hold and texture sprays",
              "Setting curl patterns and custom sculpting for victory rolls or retro waves",
              "Sturdy pin placement and structural setting spray application",
              "Longevity finish designed to survive all-day events and swing dancing",
            ],
            calSlug: "april-demo",
          },
        ],
      },
      portfolio: {
        portfolioList: [
          {
            id: "retro-updo",
            image: "/assets/portfolio-1.webp",
            alt: "Polished vintage victory rolls styling on customer",
            tag: "Updos",
          },
          {
            id: "natural-curly",
            image: "/assets/portfolio-2.webp",
            alt: "Dry curly haircut highlighting natural springy spirals",
            tag: "Curly Cut",
          },
          {
            id: "vintage-waves",
            image: "/assets/portfolio-3.webp",
            alt: "Classic Hollywood waves styling on on-location photoshoot client",
            tag: "Vintage Styling",
          },
          {
            id: "sculpted-retro",
            image: "/assets/portfolio-4.webp",
            alt: "Side profile of vintage styled victory rolls and bumper bangs",
            tag: "Events & Production",
          },
          {
            id: "springy-spirals",
            image: "/assets/portfolio-5.webp",
            alt: "Bouncy, well-defined custom dry curly cut showcasing volume",
            tag: "Curly Cut",
          },
        ],
      },
      events: {
        title: "Events & Collaborations",
        description:
          "Custom on-location styling available for weddings and bridal parties, editorial and commercial shoots, swing dance camps, and retro pageants across the Bay Area.",
        showForm: true,
        formFields: [
          {
            label: "Your Name",
            fieldType: "text",
            placeholder: "Jane Doe",
            required: true,
            _template: "inputField",
          },
          {
            label: "Email Address",
            fieldType: "email",
            placeholder: "jane@example.com",
            required: true,
            _template: "inputField",
          },
          {
            label: "Phone Number",
            fieldType: "tel",
            placeholder: "(415) 555-0192",
            required: true,
            _template: "inputField",
          },
          {
            label: "Event / Inquiry Type",
            options: [
              "Wedding / Bridal Party",
              "Editorial & Commercial Photoshoot",
              "Swing Dance Camp / Festival",
              "Retro Pageant / Special Event",
              "Private Group Styling Session",
            ],
            required: true,
            _template: "selectField",
          },
          {
            label: "Estimated Party Size",
            options: [
              "1 Person",
              "2-4 People",
              "5-8 People",
              "9+ People (Large Bridal / Production Group)",
            ],
            required: true,
            _template: "selectField",
          },
          {
            label: "Target Date & Location (City or Venue)",
            fieldType: "text",
            placeholder:
              "e.g., October 14, 2026 • San Francisco or Bay Area venue",
            required: true,
            _template: "inputField",
          },
          {
            label: "Styling Notes / Desired Aesthetics",
            placeholder:
              "Mention desired styles (e.g. vintage victory rolls, natural curl styling, 1940s waves), call-times, or group details...",
            required: false,
            _template: "textareaField",
          },
        ],
        formOptions: {
          submitButtonText: "Submit Booking Inquiry",
        },
      },
    };
  });

  // Single useTina hook registered to prevent multiple Tina hook conflicts!
  const { data: liveData } = useTina({
    query: ALL_CONTENT_QUERY,
    variables: {
      heroPath: "hero.json",
      sitePath: "site.json",
      servicesPath: "services.json",
      portfolioPath: "portfolio.json",
      eventsPath: "events.json",
    },
    data: cmsState,
  });

  // Extract resolved live content with fallback safety
  const liveHero = liveData?.hero || cmsState.hero;
  const liveSite = liveData?.site || cmsState.site;
  const liveServices = liveData?.services || cmsState.services;
  const livePortfolio = liveData?.portfolio || cmsState.portfolio;
  const liveEvents = liveData?.events || cmsState.events;

  // Single, efficient HTTP query to load content on mount
  useEffect(() => {
    let isMounted = true;

    async function loadContentFromTinaApi() {
      try {
        if (!tinaClient) return;

        const result = await tinaClient.request(
          {
            query: ALL_CONTENT_QUERY,
            variables: {
              heroPath: "hero.json",
              sitePath: "site.json",
              servicesPath: "services.json",
              portfolioPath: "portfolio.json",
              eventsPath: "events.json",
            },
          },
          {}
        );

        if (!isMounted) return;

        if (result?.data) {
          setCmsState({
            hero: (result.data.hero || cmsState.hero) as HeroContent,
            site: (result.data.site || cmsState.site) as SiteContent,
            services: (result.data.services || cmsState.services) as {
              sectionTitle?: string;
              servicesList: ServiceItem[];
            },
            portfolio: (result.data.portfolio || cmsState.portfolio) as {
              portfolioList: PortfolioItem[];
            },
            events: (result.data.events || cmsState.events) as EventsContent,
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
    if (f.__typename === "EventsFormFieldsSelectField") {
      template = "selectField";
    } else if (f.__typename === "EventsFormFieldsTextareaField") {
      template = "textareaField";
    }
    return { ...f, _template: template };
  });

  const mainSiteContent = (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans selection:bg-rose-100 selection:text-rose-900">
      {/* Dynamic Reactive Schema.org JSON-LD & SEO Controller */}
      <SchemaOrg
        siteConfig={liveSite}
        services={liveServices?.servicesList || []}
      />

      {/* Navigation */}
      <Navbar
        onBookAppointment={() => handleOpenBooking()}
        studioName={String(liveSite.studioName || SITE_CONFIG.studioName)}
        instagramUrl={String(liveSite.instagramUrl || SITE_CONFIG.instagramUrl)}
      />

      {/* 1. Primary Hero Section (LCP Optimized + Live Preview Hook) */}
      <Hero
        onBookAppointment={() => handleOpenBooking(null, liveHero.calSlug)}
        heroContent={liveHero}
        heroImage={SITE_CONFIG.heroPreloadImage}
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
              {liveHero.availabilityNotice ||
                liveSite.availabilityBanner ||
                liveSite.logisticsNotice ||
                SITE_CONFIG.logisticsNotice}
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
                    <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-2.5 font-sans">
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
                    onClick={() => handleOpenBooking(service, service.calSlug)}
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

      {/* Footer Branding & Navigation */}
      <Footer
        onBookAppointment={() => handleOpenBooking()}
        onToggleAdmin={() => {
          setIsAdminOpen(true);
        }}
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
                liveHero.calSlug ||
                liveSite.calDefaultSlug ||
                SITE_CONFIG.calDefaultSlug
            )}
            calUsername={String(
              liveSite.calUsername || SITE_CONFIG.calUsername
            )}
            logisticsNotice={String(
              liveSite.availabilityBanner ||
                liveSite.logisticsNotice ||
                SITE_CONFIG.logisticsNotice
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
          heroContent={cmsState.hero}
          setHeroContent={(newHero) => {
            setCmsState((prev) => {
              const h =
                typeof newHero === "function" ? newHero(prev.hero) : newHero;
              return { ...prev, hero: h };
            });
          }}
          eventsContent={cmsState.events}
          setEventsContent={(newEvents) => {
            setCmsState((prev) => {
              const ev =
                typeof newEvents === "function"
                  ? newEvents(prev.events)
                  : newEvents;
              return { ...prev, events: ev };
            });
          }}
          servicesContent={cmsState.services.servicesList}
          setServicesContent={(newServices) => {
            setCmsState((prev) => {
              const list =
                typeof newServices === "function"
                  ? newServices(prev.services.servicesList)
                  : newServices;
              return {
                ...prev,
                services: { ...prev.services, servicesList: list },
              };
            });
          }}
          portfolioContent={cmsState.portfolio.portfolioList}
          setPortfolioContent={(newPortfolio) => {
            setCmsState((prev) => {
              const list =
                typeof newPortfolio === "function"
                  ? newPortfolio(prev.portfolio.portfolioList)
                  : newPortfolio;
              return {
                ...prev,
                portfolio: { ...prev.portfolio, portfolioList: list },
              };
            });
          }}
          onClose={() => setIsAdminOpen(false)}
          email={cmsState.site.email || SITE_CONFIG.email}
          setEmail={(email: string) => {
            setCmsState((p) => ({
              ...p,
              site: { ...p.site, email },
            }));
          }}
          phone={cmsState.site.phone || SITE_CONFIG.phone}
          setPhone={(phone: string) => {
            setCmsState((p) => ({
              ...p,
              site: { ...p.site, phone },
            }));
          }}
          instagram={String(
            cmsState.site.instagram ||
              (cmsState.site.instagramHandle
                ? `@${String(cmsState.site.instagramHandle).replace(/^@/, "")}`
                : "")
          )}
          setInstagram={(instagram: string) => {
            setCmsState((p) => ({
              ...p,
              site: { ...p.site, instagram },
            }));
          }}
          instagramUrl={String(
            cmsState.site.instagramUrl || SITE_CONFIG.instagramUrl
          )}
          setInstagramUrl={(instagramUrl: string) => {
            setCmsState((p) => ({
              ...p,
              site: { ...p.site, instagramUrl },
            }));
          }}
          heroImage={SITE_CONFIG.heroPreloadImage}
          setHeroImage={() => {}}
        >
          {mainSiteContent}
        </AdminMockup>
      </Suspense>
    );
  }

  return mainSiteContent;
}
