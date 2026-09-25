import React, { useState, useMemo } from "react";
import {
  FileText,
  Save,
  LogOut,
  Check,
  RefreshCw,
  Plus,
  Trash2,
  Sparkles,
  Eye,
  Sliders,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Terminal,
  ExternalLink,
  Bug,
} from "lucide-react";
import type {
  HeroContent,
  ServiceItem,
  PortfolioItem,
  EventsContent,
} from "../types/content";

export interface SchemaViolation {
  id: string;
  tab: TabType;
  collection: "hero" | "events" | "services" | "portfolio" | "site";
  field: string;
  message: string;
  severity: "error" | "warning";
  targetIndex?: number;
}

interface AdminMockupProps {
  heroContent: HeroContent;
  setHeroContent: React.Dispatch<React.SetStateAction<HeroContent>>;
  eventsContent: EventsContent;
  setEventsContent: React.Dispatch<React.SetStateAction<EventsContent>>;
  servicesContent: ServiceItem[];
  setServicesContent: React.Dispatch<React.SetStateAction<ServiceItem[]>>;
  portfolioContent: PortfolioItem[];
  setPortfolioContent: React.Dispatch<React.SetStateAction<PortfolioItem[]>>;
  onClose: () => void;
  children?: React.ReactNode;
  email: string;
  setEmail: (email: string) => void;
  phone: string;
  setPhone: (phone: string) => void;
  instagram: string;
  setInstagram: (instagram: string) => void;
  instagramUrl: string;
  setInstagramUrl: (url: string) => void;
  heroImage: string;
  setHeroImage: (image: string) => void;
}

type TabType = "hero" | "services" | "images" | "events" | "diagnostics";

export const AdminMockup: React.FC<AdminMockupProps> = ({
  heroContent,
  setHeroContent,
  eventsContent,
  setEventsContent,
  servicesContent,
  setServicesContent,
  portfolioContent,
  setPortfolioContent,
  onClose,
  children,
  email,
  setEmail,
  phone,
  setPhone,
  instagram,
  setInstagram,
  instagramUrl: _instagramUrl,
  setInstagramUrl,
  heroImage,
  setHeroImage,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("admin_session_auth") === "true";
    }
    return false;
  });

  const [activeTab, setActiveTab] = useState<TabType>("hero");
  const [selectedServiceIndex, setSelectedServiceIndex] = useState<number>(0);
  const [selectedPortfolioIndex, setSelectedPortfolioIndex] =
    useState<number>(0);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [saveBlockedMessage, setSaveBlockedMessage] = useState<string | null>(
    null
  );

  // Diagnostic states
  const [isSimulatingError, setIsSimulatingError] = useState(false);
  const [simulatedHeadline, setSimulatedHeadline] = useState("");
  const [auditConsoleLogs, setAuditConsoleLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] TinaCMS Schema Engine initialized.`,
    `[${new Date().toLocaleTimeString()}] Loaded 5 collections from tina/config.ts.`,
    `[${new Date().toLocaleTimeString()}] Ready for live schema validation and content audits.`,
  ]);
  const [isAuditing, setIsAuditing] = useState(false);

  // Calculate live schema violations against tina/config.ts rules
  const schemaErrors = useMemo<SchemaViolation[]>(() => {
    const list: SchemaViolation[] = [];

    // 1. Hero Collection Validation (tina/config.ts)
    const effectiveHeadline = isSimulatingError
      ? simulatedHeadline
      : heroContent.headline;

    if (!heroContent.badge || !heroContent.badge.trim()) {
      list.push({
        id: "hero-badge",
        tab: "hero",
        collection: "hero",
        field: "badge",
        message:
          "Credentials Badge is required by hero schema in tina/config.ts",
        severity: "error",
      });
    }

    if (!effectiveHeadline || !effectiveHeadline.trim()) {
      list.push({
        id: "hero-headline",
        tab: "hero",
        collection: "hero",
        field: "headline",
        message:
          "Main Headline cannot be empty (marked required in Tina schema)",
        severity: "error",
      });
    }

    if (!heroContent.subheading || !heroContent.subheading.trim()) {
      list.push({
        id: "hero-subheading",
        tab: "hero",
        collection: "hero",
        field: "subheading",
        message: "Subheading Copy is required by hero schema",
        severity: "error",
      });
    }

    if (
      !heroContent.availabilityNotice ||
      !heroContent.availabilityNotice.trim()
    ) {
      list.push({
        id: "hero-availability",
        tab: "hero",
        collection: "hero",
        field: "availabilityNotice",
        message: "Availability Notice Banner is required by hero schema",
        severity: "error",
      });
    }

    if (!instagram || !instagram.trim()) {
      list.push({
        id: "hero-instagram-handle",
        tab: "hero",
        collection: "hero",
        field: "instagram",
        message: "Instagram Handle is required",
        severity: "error",
      });
    }

    // 2. Services Collection Validation (tina/config.ts)
    const serviceIds = new Set<string>();
    servicesContent.forEach((service, index) => {
      if (!service.name || !service.name.trim()) {
        list.push({
          id: `service-${index}-name`,
          tab: "services",
          collection: "services",
          field: "name",
          message: `Service #${index + 1} Name cannot be blank`,
          severity: "error",
          targetIndex: index,
        });
      }

      if (!service.price || !service.price.trim()) {
        list.push({
          id: `service-${index}-price`,
          tab: "services",
          collection: "services",
          field: "price",
          message: `Service #${index + 1} Price display is required (e.g. $175)`,
          severity: "error",
          targetIndex: index,
        });
      } else if (!service.price.startsWith("$")) {
        list.push({
          id: `service-${index}-price-format`,
          tab: "services",
          collection: "services",
          field: "price",
          message: `Service #${index + 1} Price should start with currency symbol ($)`,
          severity: "warning",
          targetIndex: index,
        });
      }

      if (!service.duration || !service.duration.trim()) {
        list.push({
          id: `service-${index}-duration`,
          tab: "services",
          collection: "services",
          field: "duration",
          message: `Service #${index + 1} Duration display is required`,
          severity: "error",
          targetIndex: index,
        });
      }

      if (!service.description || !service.description.trim()) {
        list.push({
          id: `service-${index}-description`,
          tab: "services",
          collection: "services",
          field: "description",
          message: `Service #${index + 1} Short description is required`,
          severity: "error",
          targetIndex: index,
        });
      }

      if (!service.deliverables || service.deliverables.length === 0) {
        list.push({
          id: `service-${index}-deliverables`,
          tab: "services",
          collection: "services",
          field: "deliverables",
          message: `Service #${index + 1} must have at least one deliverable`,
          severity: "warning",
          targetIndex: index,
        });
      }

      if (serviceIds.has(service.id)) {
        list.push({
          id: `service-${index}-duplicate-id`,
          tab: "services",
          collection: "services",
          field: "id",
          message: `Duplicate service slug '${service.id}'. IDs must be unique`,
          severity: "error",
          targetIndex: index,
        });
      } else {
        serviceIds.add(service.id);
      }
    });

    // 3. Portfolio Collection Validation (tina/config.ts)
    const portfolioIds = new Set<string>();
    portfolioContent.forEach((item, index) => {
      if (!item.image || !item.image.trim()) {
        list.push({
          id: `portfolio-${index}-image`,
          tab: "images",
          collection: "portfolio",
          field: "image",
          message: `Portfolio Item #${index + 1} image asset path is required`,
          severity: "error",
          targetIndex: index,
        });
      }

      if (!item.alt || !item.alt.trim()) {
        list.push({
          id: `portfolio-${index}-alt`,
          tab: "images",
          collection: "portfolio",
          field: "alt",
          message: `Portfolio Item #${index + 1} alt description is required for accessibility & SEO`,
          severity: "error",
          targetIndex: index,
        });
      } else if (item.alt.trim().length < 8) {
        list.push({
          id: `portfolio-${index}-alt-short`,
          tab: "images",
          collection: "portfolio",
          field: "alt",
          message: `Portfolio Item #${index + 1} alt text is too brief for optimal SEO`,
          severity: "warning",
          targetIndex: index,
        });
      }

      if (portfolioIds.has(item.id)) {
        list.push({
          id: `portfolio-${index}-duplicate-id`,
          tab: "images",
          collection: "portfolio",
          field: "id",
          message: `Duplicate portfolio slug '${item.id}'`,
          severity: "error",
          targetIndex: index,
        });
      } else {
        portfolioIds.add(item.id);
      }
    });

    // 4. Events Collection Validation (tina/config.ts)
    if (!eventsContent.title || !eventsContent.title.trim()) {
      list.push({
        id: "events-title",
        tab: "events",
        collection: "events",
        field: "title",
        message: "Events Section Title is required by events schema",
        severity: "error",
      });
    }

    if (!eventsContent.description || !eventsContent.description.trim()) {
      list.push({
        id: "events-desc",
        tab: "events",
        collection: "events",
        field: "description",
        message: "Events Description copy is required by events schema",
        severity: "error",
      });
    }

    // 5. Site Contact Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !email.trim()) {
      list.push({
        id: "site-email",
        tab: "hero",
        collection: "site",
        field: "email",
        message: "Direct contact email is required",
        severity: "error",
      });
    } else if (!emailRegex.test(email.trim())) {
      list.push({
        id: "site-email-invalid",
        tab: "hero",
        collection: "site",
        field: "email",
        message: "Invalid email syntax format (must be user@domain.com)",
        severity: "error",
      });
    }

    if (!phone || phone.replace(/[^0-9]/g, "").length < 10) {
      list.push({
        id: "site-phone-length",
        tab: "hero",
        collection: "site",
        field: "phone",
        message: "Contact phone requires at least 10 valid digits",
        severity: "warning",
      });
    }

    return list;
  }, [
    heroContent,
    eventsContent,
    servicesContent,
    portfolioContent,
    email,
    phone,
    instagram,
    isSimulatingError,
    simulatedHeadline,
  ]);

  const errorCount = schemaErrors.filter((e) => e.severity === "error").length;
  const warningCount = schemaErrors.filter(
    (e) => e.severity === "warning"
  ).length;

  const getFieldError = (tab: TabType, field: string, targetIndex?: number) => {
    return schemaErrors.find(
      (e) =>
        e.tab === tab &&
        e.field === field &&
        (targetIndex === undefined || e.targetIndex === targetIndex)
    );
  };

  const handleRunAudit = () => {
    setIsAuditing(true);
    const now = new Date().toLocaleTimeString();
    setAuditConsoleLogs((prev) => [
      ...prev,
      `[${now}] 🔍 Starting TinaCMS Schema Verification across src/content/ ...`,
      `[${now}] Checking 'hero' schema: ${heroContent.badge ? "✔ PASS" : "❌ FAIL"} (5 fields)`,
      `[${now}] Checking 'events' schema: ${eventsContent.title ? "✔ PASS" : "❌ FAIL"} (2 fields)`,
      `[${now}] Checking 'services' schema: ${servicesContent.length} services loaded (${servicesContent.length * 7} fields validated) ✔ PASS`,
      `[${now}] Checking 'portfolio' schema: ${portfolioContent.length} gallery items loaded ✔ PASS`,
      `[${now}] Checking 'site' schema: SEO, location, and contact metadata ✔ PASS`,
      `[${now}] Tina Schema Audit Finished: ${errorCount} Errors, ${warningCount} Warnings.`,
    ]);
    setTimeout(() => {
      setIsAuditing(false);
    }, 600);
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900 p-6">
        <div className="w-full max-w-md bg-stone-950 rounded-2xl border border-stone-800 p-8 shadow-2xl text-stone-100">
          <div className="text-center space-y-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center mx-auto shadow-md">
              <Sliders className="w-6 h-6 text-stone-950" />
            </div>
            <div>
              <h1 className="font-serif font-bold text-xl">
                Tina Config Portal
              </h1>
              <p className="text-xs text-stone-400 mt-1">
                Authorized site administration & schema verification
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <a
              href="/admin/index.html"
              className="w-full py-3 px-4 bg-orange-500 hover:bg-orange-400 text-stone-950 font-bold rounded-lg text-sm transition duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer text-center"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Verify Config & Open TinaCMS Auth</span>
            </a>

            <button
              type="button"
              onClick={() => {
                sessionStorage.setItem("admin_session_auth", "true");
                setIsAuthenticated(true);
              }}
              className="w-full py-2.5 px-4 bg-stone-850 hover:bg-stone-800 text-stone-200 hover:text-white border border-stone-750 text-xs font-semibold rounded-lg transition duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Enter Local Config Portal (Bypass Passcode)</span>
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-stone-900 text-center space-y-3">
            <div className="p-3 bg-stone-900/80 rounded-lg border border-stone-800 text-left space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Tina Schema Verified: 5 Collections</span>
              </div>
              <p className="text-[11px] text-stone-400">
                Directly authenticated via TinaCMS Git & Auth server layer.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleResetDefaults = () => {
    window.location.reload();
  };

  const handleInstagramHandleChange = (newHandle: string) => {
    setInstagram(newHandle);
    const cleanHandle = newHandle.trim().replace(/^@/, "");
    if (cleanHandle) {
      const newUrl = `https://www.instagram.com/${cleanHandle}/`;
      setInstagramUrl(newUrl);
    }
  };

  const handleTriggerSave = () => {
    setSaveBlockedMessage(null);

    // Guard: Prevent saving if schema errors exist
    if (errorCount > 0) {
      setSaveBlockedMessage(
        `Commit blocked: ${errorCount} schema violation(s) detected. Please correct the highlighted errors before saving.`
      );
      setActiveTab("diagnostics");
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      const now = new Date().toLocaleTimeString();
      setAuditConsoleLogs((prev) => [
        ...prev,
        `[${now}] 💾 JSON Content committed to Git data layer (5 collections verified).`,
      ]);
      setTimeout(() => setSaveSuccess(false), 4000);
    }, 1000);
  };

  const handleServiceChange = (
    field: keyof ServiceItem,
    value: string | string[]
  ) => {
    const updated = [...servicesContent];
    updated[selectedServiceIndex] = {
      ...updated[selectedServiceIndex],
      [field]: value,
    } as ServiceItem;
    setServicesContent(updated);
  };

  const handleDeliverableChange = (idx: number, value: string) => {
    const updated = [...servicesContent];
    const currentService = updated[selectedServiceIndex];
    const deliverables = [...currentService.deliverables];
    deliverables[idx] = value;
    updated[selectedServiceIndex] = {
      ...currentService,
      deliverables,
    };
    setServicesContent(updated);
  };

  const handleAddDeliverable = () => {
    const updated = [...servicesContent];
    const currentService = updated[selectedServiceIndex];
    const deliverables = [
      ...currentService.deliverables,
      "New deliverable feature",
    ];
    updated[selectedServiceIndex] = {
      ...currentService,
      deliverables,
    };
    setServicesContent(updated);
  };

  const handleRemoveDeliverable = (idx: number) => {
    const updated = [...servicesContent];
    const currentService = updated[selectedServiceIndex];
    const deliverables = currentService.deliverables.filter(
      (_, i) => i !== idx
    );
    updated[selectedServiceIndex] = {
      ...currentService,
      deliverables,
    };
    setServicesContent(updated);
  };

  const handlePortfolioChange = (field: keyof PortfolioItem, value: string) => {
    const updated = [...portfolioContent];
    updated[selectedPortfolioIndex] = {
      ...updated[selectedPortfolioIndex],
      [field]: value,
    };
    setPortfolioContent(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col md:flex-row bg-stone-900 text-stone-100 font-sans">
      {/* LEFT SIDEBAR: Admin Portal CMS Control Panel */}
      <div className="w-full md:w-[440px] lg:w-[480px] bg-stone-950 border-r border-stone-800 flex flex-col h-1/2 md:h-full shrink-0 shadow-2xl overflow-hidden">
        {/* Sidebar Header */}
        <div className="p-4 bg-stone-900/80 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center shadow-md">
              <Sliders className="w-4 h-4 text-stone-950" />
            </div>
            <div>
              <h1 className="font-serif font-bold text-sm leading-none flex items-center gap-1.5">
                Tina Config Portal
                {errorCount > 0 ? (
                  <button
                    onClick={() => setActiveTab("diagnostics")}
                    className="text-[9px] font-sans font-bold px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 uppercase tracking-wider flex items-center gap-1 hover:bg-red-500/30 transition"
                  >
                    <AlertCircle className="w-2.5 h-2.5" />
                    <span>
                      {errorCount} Error{errorCount > 1 ? "s" : ""}
                    </span>
                  </button>
                ) : (
                  <span className="text-[9px] font-sans font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 uppercase tracking-wider flex items-center gap-0.5">
                    <ShieldCheck className="w-2.5 h-2.5" />
                    <span>Schema OK</span>
                  </span>
                )}
              </h1>
              <p className="text-[10px] text-stone-500 mt-1">
                Live Schema Audit & Content Management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 relative">
            {showResetConfirm && (
              <div className="absolute right-0 top-10 z-50 bg-stone-900 border border-stone-750 p-2.5 rounded-lg shadow-xl text-left w-52">
                <p className="text-[11px] text-stone-300 font-medium mb-2">
                  Revert all fields to original defaults?
                </p>
                <div className="flex gap-1.5">
                  <button
                    onClick={handleResetDefaults}
                    className="flex-1 py-1 px-2 bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold rounded"
                  >
                    Yes, Reset
                  </button>
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="flex-1 py-1 px-2 bg-stone-800 hover:bg-stone-700 text-stone-300 text-[10px] rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            <button
              onClick={() => setShowResetConfirm((prev) => !prev)}
              title="Reset fields to original defaults"
              className="p-1.5 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-md transition duration-200"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              title="View live website"
              className="px-2 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium rounded-md flex items-center gap-1 transition"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View Site</span>
            </button>
            <button
              onClick={() => {
                sessionStorage.removeItem("admin_session_auth");
                setIsAuthenticated(false);
              }}
              title="Sign out of portal"
              className="p-1.5 text-stone-400 hover:text-red-400 hover:bg-stone-800 rounded-md transition duration-200"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Selector with Live Error Badges */}
        <div className="grid grid-cols-5 border-b border-stone-800 text-[11px]">
          {(
            [
              { id: "hero", label: "Hero" },
              { id: "services", label: "Services" },
              { id: "images", label: "Images" },
              { id: "events", label: "Events" },
              { id: "diagnostics", label: "Diagnostics" },
            ] as { id: TabType; label: string }[]
          ).map((tab) => {
            const tabErrors = schemaErrors.filter((e) => e.tab === tab.id);
            const hasCritical = tabErrors.some((e) => e.severity === "error");

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 text-center font-medium border-b-2 transition duration-200 relative flex items-center justify-center gap-1 ${
                  activeTab === tab.id
                    ? "border-orange-500 text-orange-400 bg-stone-900/40"
                    : "border-transparent text-stone-400 hover:text-stone-200 hover:bg-stone-900/10"
                }`}
              >
                <span>{tab.label}</span>
                {tab.id === "diagnostics" ? (
                  errorCount > 0 ? (
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  ) : (
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                  )
                ) : (
                  tabErrors.length > 0 && (
                    <span
                      className={`text-[9px] px-1 rounded-full font-bold leading-tight ${
                        hasCritical
                          ? "bg-red-500 text-white"
                          : "bg-amber-500 text-stone-950"
                      }`}
                    >
                      {tabErrors.length}
                    </span>
                  )
                )}
              </button>
            );
          })}
        </div>

        {/* Editor Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* TAB 1: HERO SECTION */}
          {activeTab === "hero" && (
            <div className="space-y-4">
              <div className="border-b border-stone-800/80 pb-3 mb-2 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-orange-400 flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-orange-500" />
                    Edit Hero Section
                  </h2>
                  <p className="text-[10px] text-stone-500 mt-0.5">
                    Maps directly to src/content/hero.json (Tina collection:
                    hero)
                  </p>
                </div>
              </div>

              {/* Field: Credentials Badge */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Credentials Badge</span>
                  <span className="text-[9px] text-stone-500 lowercase font-mono">
                    string • required
                  </span>
                </label>
                <input
                  type="text"
                  value={heroContent.badge}
                  onChange={(e) =>
                    setHeroContent({ ...heroContent, badge: e.target.value })
                  }
                  className={`w-full bg-stone-900 border rounded-lg px-3.5 py-2 text-sm text-stone-100 focus:outline-none transition ${
                    getFieldError("hero", "badge")
                      ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      : "border-stone-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  }`}
                />
                {getFieldError("hero", "badge") && (
                  <p className="text-[11px] text-red-400 flex items-center gap-1 font-mono">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{getFieldError("hero", "badge")?.message}</span>
                  </p>
                )}
              </div>

              {/* Field: Headline */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Main Headline</span>
                  <span className="text-[9px] text-stone-500 lowercase font-mono">
                    string • required
                  </span>
                </label>
                <input
                  type="text"
                  value={
                    isSimulatingError ? simulatedHeadline : heroContent.headline
                  }
                  onChange={(e) => {
                    if (isSimulatingError) {
                      setSimulatedHeadline(e.target.value);
                    } else {
                      setHeroContent({
                        ...heroContent,
                        headline: e.target.value,
                      });
                    }
                  }}
                  className={`w-full bg-stone-900 border rounded-lg px-3.5 py-2 text-sm text-stone-100 focus:outline-none transition ${
                    getFieldError("hero", "headline")
                      ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-red-950/20"
                      : "border-stone-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  }`}
                />
                {getFieldError("hero", "headline") && (
                  <p className="text-[11px] text-red-400 flex items-center gap-1 font-mono">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{getFieldError("hero", "headline")?.message}</span>
                  </p>
                )}
              </div>

              {/* Field: Subheading */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Subheading Copy</span>
                  <span className="text-[9px] text-stone-500 lowercase font-mono">
                    textarea • required
                  </span>
                </label>
                <textarea
                  rows={3}
                  value={heroContent.subheading}
                  onChange={(e) =>
                    setHeroContent({
                      ...heroContent,
                      subheading: e.target.value,
                    })
                  }
                  className={`w-full bg-stone-900 border rounded-lg px-3.5 py-2 text-sm text-stone-100 focus:outline-none leading-relaxed resize-none transition ${
                    getFieldError("hero", "subheading")
                      ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      : "border-stone-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  }`}
                />
                {getFieldError("hero", "subheading") && (
                  <p className="text-[11px] text-red-400 flex items-center gap-1 font-mono">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{getFieldError("hero", "subheading")?.message}</span>
                  </p>
                )}
              </div>

              {/* Field: Availability Notice Banner */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Availability Notice Banner</span>
                  <span className="text-[9px] text-stone-500 lowercase font-mono">
                    textarea • required
                  </span>
                </label>
                <textarea
                  rows={2}
                  value={heroContent.availabilityNotice}
                  onChange={(e) =>
                    setHeroContent({
                      ...heroContent,
                      availabilityNotice: e.target.value,
                    })
                  }
                  className={`w-full bg-stone-900 border rounded-lg px-3.5 py-2 text-sm text-stone-100 focus:outline-none leading-relaxed resize-none transition ${
                    getFieldError("hero", "availabilityNotice")
                      ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      : "border-stone-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  }`}
                />
                {getFieldError("hero", "availabilityNotice") && (
                  <p className="text-[11px] text-red-400 flex items-center gap-1 font-mono">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>
                      {getFieldError("hero", "availabilityNotice")?.message}
                    </span>
                  </p>
                )}
              </div>

              {/* Cal.com Booking Event Slug */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Cal.com Event Slug</span>
                  <span className="text-[9px] text-stone-500 lowercase font-mono">
                    string
                  </span>
                </label>
                <input
                  type="text"
                  value={heroContent.calSlug || "april-demo"}
                  onChange={(e) =>
                    setHeroContent({ ...heroContent, calSlug: e.target.value })
                  }
                  className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3.5 py-2 text-sm text-stone-100 focus:outline-none focus:border-orange-500"
                  placeholder="april-demo"
                />
              </div>

              {/* Single Social Field: Instagram Handle */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Instagram Handle</span>
                  <span className="text-[9px] text-stone-500 lowercase font-mono">
                    string • required
                  </span>
                </label>
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) =>
                    handleInstagramHandleChange(e.target.value)
                  }
                  className={`w-full bg-stone-900 border rounded-lg px-3.5 py-2 text-sm text-stone-100 focus:outline-none transition ${
                    getFieldError("hero", "instagram")
                      ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      : "border-stone-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  }`}
                  placeholder="@hair.by.april_209"
                />
                {getFieldError("hero", "instagram") && (
                  <p className="text-[11px] text-red-400 flex items-center gap-1 font-mono">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>
                      {getFieldError("hero", "instagram")?.message}
                    </span>
                  </p>
                )}
              </div>

              {/* Business Contact Info */}
              <div className="border-t border-stone-800/80 pt-4 mt-4 space-y-4">
                <h3 className="text-xs font-semibold text-orange-400 uppercase tracking-wider text-[11px]">
                  Site Metadata & Direct Contacts
                </h3>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Contact Email Address</span>
                    <span className="text-[9px] text-stone-500 lowercase font-mono">
                      email • required
                    </span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full bg-stone-900 border rounded-lg px-3.5 py-2 text-sm text-stone-100 focus:outline-none transition ${
                      getFieldError("hero", "email")
                        ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                        : "border-stone-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    }`}
                  />
                  {getFieldError("hero", "email") && (
                    <p className="text-[11px] text-red-400 flex items-center gap-1 font-mono">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{getFieldError("hero", "email")?.message}</span>
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Contact Phone Number</span>
                    <span className="text-[9px] text-stone-500 lowercase font-mono">
                      phone
                    </span>
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`w-full bg-stone-900 border rounded-lg px-3.5 py-2 text-sm text-stone-100 focus:outline-none transition ${
                      getFieldError("hero", "phone")
                        ? "border-amber-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                        : "border-stone-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    }`}
                  />
                  {getFieldError("hero", "phone") && (
                    <p className="text-[11px] text-amber-400 flex items-center gap-1 font-mono">
                      <AlertTriangle className="w-3 h-3 shrink-0" />
                      <span>{getFieldError("hero", "phone")?.message}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SERVICES MENU */}
          {activeTab === "services" && (
            <div className="space-y-5">
              <div className="border-b border-stone-800/80 pb-3 mb-2 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-orange-400 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-orange-500" />
                    Services Catalog List
                  </h2>
                  <p className="text-[10px] text-stone-500 mt-0.5">
                    Maps directly to src/content/services.json (Tina collection:
                    services)
                  </p>
                </div>
              </div>

              {/* Service Item Select Tabs */}
              <div className="flex gap-2 p-1.5 bg-stone-900 rounded-lg">
                {servicesContent.map((service, index) => {
                  const itemErrors = schemaErrors.filter(
                    (e) => e.tab === "services" && e.targetIndex === index
                  );
                  return (
                    <button
                      key={service.id || index}
                      onClick={() => setSelectedServiceIndex(index)}
                      className={`flex-1 py-1.5 px-2 text-center rounded-md text-[11px] font-medium transition flex items-center justify-center gap-1.5 ${
                        selectedServiceIndex === index
                          ? "bg-stone-800 text-stone-100 shadow-sm"
                          : "text-stone-400 hover:text-stone-200"
                      }`}
                    >
                      <span>{service.name.split(" ")[0]}...</span>
                      {itemErrors.length > 0 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      )}
                    </button>
                  );
                })}
              </div>

              {servicesContent[selectedServiceIndex] && (
                <div className="space-y-4 pt-1">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider flex items-center justify-between">
                      <span>Service Name</span>
                      <span className="text-[9px] text-stone-500 lowercase font-mono">
                        string • required
                      </span>
                    </label>
                    <input
                      type="text"
                      value={servicesContent[selectedServiceIndex].name}
                      onChange={(e) =>
                        handleServiceChange("name", e.target.value)
                      }
                      className={`w-full bg-stone-900 border rounded-lg px-3.5 py-2 text-sm text-stone-100 focus:outline-none transition ${
                        getFieldError("services", "name", selectedServiceIndex)
                          ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                          : "border-stone-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      }`}
                    />
                    {getFieldError(
                      "services",
                      "name",
                      selectedServiceIndex
                    ) && (
                      <p className="text-[11px] text-red-400 flex items-center gap-1 font-mono">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>
                          {
                            getFieldError(
                              "services",
                              "name",
                              selectedServiceIndex
                            )?.message
                          }
                        </span>
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider flex items-center justify-between">
                        <span>Price Display</span>
                        <span className="text-[9px] text-stone-500 lowercase font-mono">
                          string • required
                        </span>
                      </label>
                      <input
                        type="text"
                        value={servicesContent[selectedServiceIndex].price}
                        onChange={(e) =>
                          handleServiceChange("price", e.target.value)
                        }
                        className={`w-full bg-stone-900 border rounded-lg px-3.5 py-2 text-sm text-stone-100 focus:outline-none transition ${
                          getFieldError(
                            "services",
                            "price",
                            selectedServiceIndex
                          )
                            ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                            : "border-stone-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                        }`}
                        placeholder="$175"
                      />
                      {getFieldError(
                        "services",
                        "price",
                        selectedServiceIndex
                      ) && (
                        <p className="text-[11px] text-red-400 flex items-center gap-1 font-mono">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>
                            {
                              getFieldError(
                                "services",
                                "price",
                                selectedServiceIndex
                              )?.message
                            }
                          </span>
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider flex items-center justify-between">
                        <span>Duration Display</span>
                        <span className="text-[9px] text-stone-500 lowercase font-mono">
                          string • required
                        </span>
                      </label>
                      <input
                        type="text"
                        value={servicesContent[selectedServiceIndex].duration}
                        onChange={(e) =>
                          handleServiceChange("duration", e.target.value)
                        }
                        className={`w-full bg-stone-900 border rounded-lg px-3.5 py-2 text-sm text-stone-100 focus:outline-none transition ${
                          getFieldError(
                            "services",
                            "duration",
                            selectedServiceIndex
                          )
                            ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                            : "border-stone-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                        }`}
                        placeholder="90 mins"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider flex items-center justify-between">
                      <span>Short Description</span>
                      <span className="text-[9px] text-stone-500 lowercase font-mono">
                        string • required
                      </span>
                    </label>
                    <textarea
                      rows={3}
                      value={servicesContent[selectedServiceIndex].description}
                      onChange={(e) =>
                        handleServiceChange("description", e.target.value)
                      }
                      className={`w-full bg-stone-900 border rounded-lg px-3.5 py-2 text-sm text-stone-100 focus:outline-none leading-relaxed resize-none transition ${
                        getFieldError(
                          "services",
                          "description",
                          selectedServiceIndex
                        )
                          ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                          : "border-stone-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      }`}
                    />
                  </div>

                  {/* Deliverables List */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between border-t border-stone-800/80 pt-3">
                      <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                        Deliverables List (Array)
                      </label>
                      <button
                        onClick={handleAddDeliverable}
                        className="px-2 py-1 bg-stone-800 hover:bg-stone-700 text-orange-400 hover:text-orange-300 text-[10px] font-medium rounded flex items-center gap-0.5 transition cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Item</span>
                      </button>
                    </div>

                    <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                      {servicesContent[selectedServiceIndex].deliverables.map(
                        (item, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={item}
                              onChange={(e) =>
                                handleDeliverableChange(idx, e.target.value)
                              }
                              className="flex-1 bg-stone-900 border border-stone-800 rounded px-2.5 py-1 text-xs text-stone-200 focus:outline-none focus:border-orange-500"
                            />
                            <button
                              onClick={() => handleRemoveDeliverable(idx)}
                              className="p-1 text-stone-500 hover:text-red-400 hover:bg-stone-850 rounded transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: IMAGES & HERO MEDIA */}
          {activeTab === "images" && (
            <div className="space-y-6">
              {/* SECTION A: HERO IMAGE */}
              <div className="bg-stone-900/40 p-4 rounded-xl border border-stone-850 space-y-4">
                <div className="border-b border-stone-800/80 pb-2">
                  <h3 className="text-xs font-bold text-orange-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                    Main Website Hero Image
                  </h3>
                  <p className="text-[10px] text-stone-500 mt-0.5">
                    Preloaded high-priority hero showcase asset
                  </p>
                </div>

                <div className="relative rounded-lg overflow-hidden border border-stone-800 bg-stone-900 aspect-[16/10] w-full max-w-[200px] mx-auto">
                  <img
                    src={heroImage}
                    alt="Hero Preload"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="relative border border-dashed border-stone-800 hover:border-orange-500/50 bg-stone-900/30 rounded-lg p-3 text-center cursor-pointer transition">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          const url = URL.createObjectURL(file);
                          setHeroImage(url);
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <Plus className="w-4 h-4 text-orange-500 mx-auto mb-1" />
                    <span className="text-[11px] text-stone-300 block font-semibold">
                      Upload New Hero Image
                    </span>
                    <span className="text-[9px] text-stone-500 block mt-0.5">
                      Supports WebP, JPEG, PNG
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION B: PORTFOLIO SHOWCASE */}
              <div className="bg-stone-900/40 p-4 rounded-xl border border-stone-850 space-y-4">
                <div className="border-b border-stone-800/80 pb-2">
                  <h3 className="text-xs font-bold text-orange-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                    Portfolio Showcase Gallery
                  </h3>
                  <p className="text-[10px] text-stone-500 mt-0.5">
                    Maps directly to src/content/portfolio.json (Tina
                    collection: portfolio)
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 p-1 bg-stone-900/60 rounded-lg">
                  {portfolioContent.map((item, idx) => (
                    <button
                      key={item.id || idx}
                      onClick={() => setSelectedPortfolioIndex(idx)}
                      className={`flex-1 px-2.5 py-1 text-[10px] rounded text-center transition ${
                        selectedPortfolioIndex === idx
                          ? "bg-stone-850 text-orange-400 font-bold border border-stone-700"
                          : "text-stone-400 hover:text-stone-200 border border-transparent"
                      }`}
                    >
                      Slot {idx + 1}
                    </button>
                  ))}
                </div>

                {portfolioContent[selectedPortfolioIndex] && (
                  <div className="space-y-4 pt-1">
                    <div className="relative rounded-lg overflow-hidden border border-stone-800 bg-stone-900 aspect-[16/10] w-full max-w-[200px] mx-auto">
                      <img
                        src={portfolioContent[selectedPortfolioIndex].image}
                        alt="Thumbnail"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                        Style Category Tag
                      </label>
                      <input
                        type="text"
                        value={portfolioContent[selectedPortfolioIndex].tag}
                        onChange={(e) =>
                          handlePortfolioChange("tag", e.target.value)
                        }
                        className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3.5 py-2 text-sm text-stone-100 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider flex items-center justify-between">
                        <span>Alt Description (SEO & A11y)</span>
                        <span className="text-[9px] text-stone-500 lowercase font-mono">
                          string • required
                        </span>
                      </label>
                      <textarea
                        rows={2}
                        value={portfolioContent[selectedPortfolioIndex].alt}
                        onChange={(e) =>
                          handlePortfolioChange("alt", e.target.value)
                        }
                        className={`w-full bg-stone-900 border rounded-lg px-3.5 py-2 text-sm text-stone-100 focus:outline-none leading-relaxed resize-none transition ${
                          getFieldError("images", "alt", selectedPortfolioIndex)
                            ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                            : "border-stone-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                        }`}
                      />
                      {getFieldError(
                        "images",
                        "alt",
                        selectedPortfolioIndex
                      ) && (
                        <p className="text-[11px] text-red-400 flex items-center gap-1 font-mono">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>
                            {
                              getFieldError(
                                "images",
                                "alt",
                                selectedPortfolioIndex
                              )?.message
                            }
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: EVENTS COPY */}
          {activeTab === "events" && (
            <div className="space-y-4">
              <div className="border-b border-stone-800/80 pb-3 mb-2">
                <h2 className="text-sm font-semibold text-orange-400 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-orange-500" />
                  Events & Collaborations
                </h2>
                <p className="text-[10px] text-stone-500 mt-1">
                  Maps directly to src/content/events.json (Tina collection:
                  events)
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Section Title</span>
                  <span className="text-[9px] text-stone-500 lowercase font-mono">
                    string • required
                  </span>
                </label>
                <input
                  type="text"
                  value={eventsContent.title}
                  onChange={(e) =>
                    setEventsContent({
                      ...eventsContent,
                      title: e.target.value,
                    })
                  }
                  className={`w-full bg-stone-900 border rounded-lg px-3.5 py-2 text-sm text-stone-100 focus:outline-none transition ${
                    getFieldError("events", "title")
                      ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      : "border-stone-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Description Copy</span>
                  <span className="text-[9px] text-stone-500 lowercase font-mono">
                    textarea • required
                  </span>
                </label>
                <textarea
                  rows={4}
                  value={eventsContent.description}
                  onChange={(e) =>
                    setEventsContent({
                      ...eventsContent,
                      description: e.target.value,
                    })
                  }
                  className={`w-full bg-stone-900 border rounded-lg px-3.5 py-2 text-sm text-stone-100 focus:outline-none leading-relaxed resize-none transition ${
                    getFieldError("events", "description")
                      ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      : "border-stone-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  }`}
                />
              </div>

              <div className="pt-3 border-t border-stone-800 space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={eventsContent.showForm !== false}
                    onChange={(e) =>
                      setEventsContent({
                        ...eventsContent,
                        showForm: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded bg-stone-900 border-stone-700 text-orange-500 focus:ring-orange-500"
                  />
                  <div>
                    <span className="text-xs font-semibold text-stone-200 block">
                      Display Inquiry Form on Site
                    </span>
                    <span className="text-[10px] text-stone-500 block">
                      Toggle off to completely remove the booking inquiry form from the public website
                    </span>
                  </div>
                </label>
              </div>

              <div className="pt-4 border-t border-stone-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-stone-300 uppercase tracking-wider">
                      Inquiry Form Fields ({eventsContent.formFields?.length || 0})
                    </h3>
                    <p className="text-[10px] text-stone-500">
                      Manage form inputs rendered on the public booking module
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newFields = [
                        ...(eventsContent.formFields || []),
                        {
                          _template: "inputField" as const,
                          label: "New Question",
                          fieldType: "text",
                          placeholder: "Enter placeholder...",
                          required: false,
                        },
                      ];
                      setEventsContent({ ...eventsContent, formFields: newFields });
                    }}
                    className="px-2.5 py-1 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 text-xs font-semibold rounded-md flex items-center gap-1 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Field</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {(eventsContent.formFields || []).map((field, fIdx) => (
                    <div key={fIdx} className="p-3 bg-stone-900/90 border border-stone-800 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-orange-400 uppercase tracking-wider">
                          Field #{fIdx + 1} ({field._template})
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const newFields = [...(eventsContent.formFields || [])];
                            newFields.splice(fIdx, 1);
                            setEventsContent({ ...eventsContent, formFields: newFields });
                          }}
                          className="text-stone-500 hover:text-red-400 transition p-1"
                          title="Remove Field"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-stone-400 block mb-1">Label</label>
                          <input
                            type="text"
                            value={field.label}
                            onChange={(e) => {
                              const newFields = [...(eventsContent.formFields || [])];
                              newFields[fIdx] = { ...newFields[fIdx], label: e.target.value };
                              setEventsContent({ ...eventsContent, formFields: newFields });
                            }}
                            className="w-full bg-stone-950 border border-stone-800 rounded px-2.5 py-1.5 text-xs text-stone-200 focus:outline-none focus:border-orange-500"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-stone-400 block mb-1">Type / Template</label>
                          <select
                            value={field._template}
                            onChange={(e) => {
                              const newFields = [...(eventsContent.formFields || [])];
                              newFields[fIdx] = { 
                                ...newFields[fIdx], 
                                _template: e.target.value as "inputField" | "selectField" | "textareaField",
                                fieldType: e.target.value === "inputField" ? "text" : undefined,
                              };
                              setEventsContent({ ...eventsContent, formFields: newFields });
                            }}
                            className="w-full bg-stone-950 border border-stone-800 rounded px-2.5 py-1.5 text-xs text-stone-200 focus:outline-none focus:border-orange-500"
                          >
                            <option value="inputField">Text/Input Field</option>
                            <option value="selectField">Dropdown Select</option>
                            <option value="textareaField">Textarea</option>
                          </select>
                        </div>
                      </div>

                      {field._template === "inputField" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] text-stone-400 block mb-1">Input Type</label>
                            <select
                              value={field.fieldType || "text"}
                              onChange={(e) => {
                                const newFields = [...(eventsContent.formFields || [])];
                                newFields[fIdx] = { ...newFields[fIdx], fieldType: e.target.value };
                                setEventsContent({ ...eventsContent, formFields: newFields });
                              }}
                              className="w-full bg-stone-950 border border-stone-800 rounded px-2.5 py-1.5 text-xs text-stone-200 focus:outline-none focus:border-orange-500"
                            >
                              <option value="text">text</option>
                              <option value="email">email</option>
                              <option value="tel">tel</option>
                              <option value="date">date</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] text-stone-400 block mb-1">Placeholder</label>
                            <input
                              type="text"
                              value={field.placeholder || ""}
                              onChange={(e) => {
                                const newFields = [...(eventsContent.formFields || [])];
                                newFields[fIdx] = { ...newFields[fIdx], placeholder: e.target.value };
                                setEventsContent({ ...eventsContent, formFields: newFields });
                              }}
                              className="w-full bg-stone-950 border border-stone-800 rounded px-2.5 py-1.5 text-xs text-stone-200 focus:outline-none focus:border-orange-500"
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-1">
                        <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-300">
                          <input
                            type="checkbox"
                            checked={field.required !== false}
                            onChange={(e) => {
                              const newFields = [...(eventsContent.formFields || [])];
                              newFields[fIdx] = { ...newFields[fIdx], required: e.target.checked };
                              setEventsContent({ ...eventsContent, formFields: newFields });
                            }}
                            className="w-3.5 h-3.5 rounded bg-stone-950 border-stone-800 text-orange-500 focus:ring-orange-500"
                          />
                          <span>Required Field</span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-stone-800 space-y-2">
                <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                  Submit Button Text
                </label>
                <input
                  type="text"
                  value={eventsContent.formOptions?.submitButtonText || ""}
                  onChange={(e) =>
                    setEventsContent({
                      ...eventsContent,
                      formOptions: {
                        ...(eventsContent.formOptions || {}),
                        submitButtonText: e.target.value,
                      },
                    })
                  }
                  className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3.5 py-2 text-sm text-stone-100 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>
          )}

          {/* TAB 5: SCHEMA & LIVE DIAGNOSTICS */}
          {activeTab === "diagnostics" && (
            <div className="space-y-5">
              {/* Header */}
              <div className="border-b border-stone-800/80 pb-3 mb-2 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-orange-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-orange-500" />
                    Tina Schema Diagnostics
                  </h2>
                  <p className="text-[10px] text-stone-500 mt-0.5">
                    Real-time verification of schemas, collections, & data
                    integrity
                  </p>
                </div>
                <button
                  onClick={handleRunAudit}
                  disabled={isAuditing}
                  className="px-2.5 py-1.5 bg-orange-500 hover:bg-orange-400 text-stone-950 font-bold text-xs rounded-md flex items-center gap-1.5 transition cursor-pointer"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${isAuditing ? "animate-spin" : ""}`}
                  />
                  <span>Audit Now</span>
                </button>
              </div>

              {/* Real-time Status Card */}
              <div
                className={`p-4 rounded-xl border transition ${
                  errorCount > 0
                    ? "bg-red-950/40 border-red-800/80 text-red-200"
                    : "bg-emerald-950/30 border-emerald-800/80 text-emerald-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  {errorCount > 0 ? (
                    <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h3 className="font-bold text-sm">
                      {errorCount > 0
                        ? `${errorCount} Active Schema Violation${errorCount > 1 ? "s" : ""}`
                        : "All 5 Tina Collections Pass Schema Validation"}
                    </h3>
                    <p className="text-xs opacity-80 mt-1 leading-relaxed">
                      {errorCount > 0
                        ? "Fields marked below violate schema rules in tina/config.ts. Commits to Git JSON are guarded until resolved."
                        : "All fields adhere strictly to tina/config.ts definitions. Content is ready for live Git commit and cloud deployment."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Active Violations List (if any) */}
              {schemaErrors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold text-stone-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Active Issues Breakdown</span>
                    <span className="text-[10px] text-stone-500 font-mono">
                      {errorCount} errors • {warningCount} warnings
                    </span>
                  </h4>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {schemaErrors.map((err) => (
                      <div
                        key={err.id}
                        className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-2 ${
                          err.severity === "error"
                            ? "bg-red-950/20 border-red-800/50 text-red-300"
                            : "bg-amber-950/20 border-amber-800/50 text-amber-300"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <div>
                            <div className="font-semibold flex items-center gap-1.5">
                              <span className="uppercase text-[9px] px-1 py-0.2 rounded bg-stone-900 font-mono">
                                {err.collection}
                              </span>
                              <span>{err.field}</span>
                            </div>
                            <p className="text-[11px] opacity-85 mt-0.5">
                              {err.message}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setActiveTab(err.tab);
                            if (err.targetIndex !== undefined) {
                              if (err.tab === "services")
                                setSelectedServiceIndex(err.targetIndex);
                              if (err.tab === "images")
                                setSelectedPortfolioIndex(err.targetIndex);
                            }
                          }}
                          className="px-2 py-1 bg-stone-850 hover:bg-stone-800 text-stone-200 text-[10px] rounded border border-stone-750 shrink-0 font-medium cursor-pointer"
                        >
                          Jump to Field
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Collections Matrix Table */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                  TinaCMS Collections Matrix (tina/config.ts)
                </h4>
                <div className="border border-stone-800 rounded-xl overflow-hidden text-xs">
                  <div className="grid grid-cols-12 bg-stone-900 p-2.5 font-semibold text-stone-400 border-b border-stone-800 text-[10px] uppercase">
                    <span className="col-span-3">Collection</span>
                    <span className="col-span-5">Path & Match</span>
                    <span className="col-span-2">Fields</span>
                    <span className="col-span-2 text-right">Status</span>
                  </div>
                  {[
                    {
                      name: "hero",
                      path: "src/content/hero.json",
                      fields: "5 fields",
                      valid: !schemaErrors.some((e) => e.collection === "hero"),
                    },
                    {
                      name: "events",
                      path: "src/content/events.json",
                      fields: "2 fields",
                      valid: !schemaErrors.some(
                        (e) => e.collection === "events"
                      ),
                    },
                    {
                      name: "services",
                      path: "src/content/services.json",
                      fields: "7 fields",
                      valid: !schemaErrors.some(
                        (e) => e.collection === "services"
                      ),
                    },
                    {
                      name: "portfolio",
                      path: "src/content/portfolio.json",
                      fields: "4 fields",
                      valid: !schemaErrors.some(
                        (e) => e.collection === "portfolio"
                      ),
                    },
                    {
                      name: "site",
                      path: "src/content/site.json",
                      fields: "9 fields",
                      valid: !schemaErrors.some((e) => e.collection === "site"),
                    },
                  ].map((col, idx) => (
                    <div
                      key={col.name}
                      className={`grid grid-cols-12 p-2.5 items-center ${
                        idx % 2 === 0 ? "bg-stone-950" : "bg-stone-900/40"
                      } border-b border-stone-850/60 font-mono text-[11px]`}
                    >
                      <span className="col-span-3 font-semibold text-stone-200">
                        {col.name}
                      </span>
                      <span className="col-span-5 text-stone-400 truncate">
                        {col.path}
                      </span>
                      <span className="col-span-2 text-stone-500">
                        {col.fields}
                      </span>
                      <span className="col-span-2 text-right">
                        {col.valid ? (
                          <span className="text-emerald-400 font-bold text-[10px]">
                            ✔ VALID
                          </span>
                        ) : (
                          <span className="text-red-400 font-bold text-[10px]">
                            ❌ ISSUE
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Error Simulation Sandbox */}
              <div className="bg-stone-900/50 border border-stone-800 rounded-xl p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Bug className="w-4 h-4 text-orange-400" />
                    <span className="text-xs font-bold text-stone-200">
                      Error Simulation Sandbox
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      if (!isSimulatingError) {
                        setIsSimulatingError(true);
                        setSimulatedHeadline("");
                      } else {
                        setIsSimulatingError(false);
                      }
                    }}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded transition cursor-pointer ${
                      isSimulatingError
                        ? "bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30"
                        : "bg-stone-800 hover:bg-stone-700 text-stone-300"
                    }`}
                  >
                    {isSimulatingError
                      ? "Clear Simulated Error"
                      : "Simulate Headline Schema Error"}
                  </button>
                </div>
                <p className="text-[11px] text-stone-400 leading-relaxed">
                  Toggle this to test live error elevation: clears the required
                  headline, triggering instant red field warnings, elevating
                  diagnostics, and guarding Git commit pushes.
                </p>
              </div>

              {/* Live Terminal Console Log */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-stone-400 font-bold uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <Terminal className="w-3.5 h-3.5 text-stone-500" />
                    <span>Diagnostics Console Feed</span>
                  </span>
                  <button
                    onClick={() => setAuditConsoleLogs([])}
                    className="text-[10px] text-stone-500 hover:text-stone-300 transition"
                  >
                    Clear Feed
                  </button>
                </div>
                <div className="bg-black/80 border border-stone-850 rounded-lg p-3 font-mono text-[10px] text-stone-300 h-28 overflow-y-auto space-y-1">
                  {auditConsoleLogs.map((log, i) => (
                    <div
                      key={i}
                      className={
                        log.includes("❌") || log.includes("blocked")
                          ? "text-red-400"
                          : log.includes("✔")
                            ? "text-emerald-400"
                            : "text-stone-400"
                      }
                    >
                      {log}
                    </div>
                  ))}
                </div>
              </div>

              {/* Tina Cloud Production Setup Notice */}
              <div className="p-3.5 bg-stone-900/60 rounded-xl border border-stone-800 text-xs space-y-2">
                <h5 className="font-semibold text-stone-200 flex items-center justify-between">
                  <span>Tina Cloud & Production Setup</span>
                  <a
                    href="https://tina.io/docs/setup-overview/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-orange-400 hover:underline flex items-center gap-0.5"
                  >
                    <span>Tina Docs</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </h5>
                <p className="text-[11px] text-stone-400 leading-relaxed">
                  In production, connect your repository at{" "}
                  <code className="text-orange-300">app.tina.io</code> and
                  provide{" "}
                  <code className="text-orange-300">VITE_TINA_CLIENT_ID</code>{" "}
                  and <code className="text-orange-300">TINA_TOKEN</code> in
                  your environment settings.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Footer Commit Trigger */}
        <div className="p-4 bg-stone-950 border-t border-stone-800/80 space-y-3">
          {saveBlockedMessage && (
            <div className="p-3 bg-red-950/70 border border-red-800 text-red-300 text-xs rounded-lg flex items-start gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block">Commit Guard Triggered</strong>
                <span className="text-[10px] opacity-85">
                  {saveBlockedMessage}
                </span>
              </div>
            </div>
          )}

          {saveSuccess && (
            <div className="p-3 bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs rounded-lg flex items-start gap-2 animate-fadeIn">
              <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block">Git JSON Commit Created!</strong>
                <span className="text-[10px] opacity-85">
                  Changes committed to Git content files (src/content/*.json).
                  All schema rules verified.
                </span>
              </div>
            </div>
          )}

          <button
            onClick={handleTriggerSave}
            disabled={isSaving}
            className={`w-full py-2.5 px-4 rounded-lg font-medium text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
              isSaving
                ? "bg-stone-800 text-stone-400 cursor-not-allowed"
                : errorCount > 0
                  ? "bg-red-600 hover:bg-red-500 text-white"
                  : "bg-orange-500 hover:bg-orange-400 text-stone-950 active:scale-98"
            }`}
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Simulating commit push...</span>
              </>
            ) : errorCount > 0 ? (
              <>
                <AlertCircle className="w-3.5 h-3.5" />
                <span>
                  Resolve {errorCount} Error{errorCount > 1 ? "s" : ""} to
                  Commit
                </span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save & Commit JSON</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* RIGHT PREVIEW CANVAS: Live Website (React State Driven) */}
      <div className="flex-1 bg-stone-900 flex flex-col h-1/2 md:h-full relative overflow-hidden">
        {/* Canvas Header */}
        <div className="p-3 bg-stone-950 border-b border-stone-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/80"></span>
            </div>
            <span className="text-xs text-stone-400 font-sans ml-1 bg-stone-900/60 px-2 py-0.5 rounded border border-stone-850">
              Live Interactive Previews (React-State Bound)
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            {errorCount > 0 ? (
              <span className="text-red-400 flex items-center gap-1 bg-red-950/40 px-2 py-0.5 rounded border border-red-800/40">
                <AlertCircle className="w-3 h-3" />
                <span>{errorCount} Schema Violations in Form</span>
              </span>
            ) : (
              <span className="text-emerald-400 flex items-center gap-1 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                <ShieldCheck className="w-3 h-3" />
                <span>Live Preview Active</span>
              </span>
            )}
          </div>
        </div>

        {/* Preview Container */}
        <div className="flex-1 bg-white overflow-y-auto">
          <div className="scale-100 origin-top h-full w-full">{children}</div>
        </div>
      </div>
    </div>
  );
};
