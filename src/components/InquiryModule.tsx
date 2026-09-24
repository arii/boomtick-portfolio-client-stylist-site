import React, { useState } from "react";
import {
  Send,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Users,
  RefreshCw,
} from "lucide-react";
import { TOKENS } from "../styles/tokens";
import { SITE_CONFIG } from "../config/site";

export const InquiryModule: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    eventType: "Wedding / Bridal Party",
    partySize: "3-5 People",
    dateLocation: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    const sheetUrl = SITE_CONFIG.googleSheetUrl;

    if (sheetUrl) {
      try {
        await fetch(sheetUrl, {
          method: "POST",
          mode: "no-cors",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
        setIsSubmitting(false);
        setSubmitted(true);
      } catch (err: unknown) {
        const errorMsg =
          err instanceof Error
            ? err.message
            : "Network error transmitting inquiry to Google Sheets.";
        console.error("Elevated Submission Error:", err);
        setIsSubmitting(false);
        setSubmitError(errorMsg);
      }
    } else {
      // Simulate fast submission when no webhook URL is configured
      setTimeout(() => {
        setIsSubmitting(false);
        setSubmitted(true);
      }, 500);
    }
  };

  return (
    <section
      id="inquiry"
      className="pt-8 pb-20 md:pb-24 bg-stone-50 border-b border-stone-200 scroll-mt-16"
    >
      <div className="max-w-3xl mx-auto px-6">
        <div className={TOKENS.card.base}>
          {submitted ? (
            <div className="py-8 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="font-serif font-bold text-2xl text-stone-900">
                Inquiry Received
              </h3>
              <p className="text-xs text-stone-600 font-sans max-w-md mx-auto leading-relaxed">
                Thank you, {formData.name || "friend"}.{" "}
                {SITE_CONFIG.stylistName} will review your request and reach out
                via email or phone ({formData.phone || formData.email}) with
                availability, schedule details, and custom rate options.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setSubmitError(null);
                }}
                className={`mt-4 text-xs font-semibold uppercase tracking-wider text-stone-900 underline ${TOKENS.accent.iconHover} cursor-pointer`}
              >
                Send another inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Elevated Error Banner if submission failed */}
              {submitError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 flex items-start gap-3 animate-fade-in">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <strong className="font-semibold block">
                      Submission Error: {submitError}
                    </strong>
                    <p className="text-stone-600 leading-relaxed">
                      Your inquiry could not be sent automatically. Please reach
                      out directly to {SITE_CONFIG.stylistName} at{" "}
                      <a
                        href={`mailto:${SITE_CONFIG.email}`}
                        className="underline font-semibold text-stone-900"
                      >
                        {SITE_CONFIG.email}
                      </a>{" "}
                      or text{" "}
                      <a
                        href={SITE_CONFIG.phoneTel}
                        className="underline font-semibold text-stone-900"
                      >
                        {SITE_CONFIG.phoneDisplay}
                      </a>
                      .
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="inquiry-name" className={TOKENS.input.label}>
                    Your Name *
                  </label>
                  <input
                    id="inquiry-name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Jane Doe"
                    className={TOKENS.input.base}
                  />
                </div>

                <div>
                  <label htmlFor="inquiry-email" className={TOKENS.input.label}>
                    Email Address *
                  </label>
                  <input
                    id="inquiry-email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="jane@example.com"
                    className={TOKENS.input.base}
                  />
                </div>

                <div>
                  <label htmlFor="inquiry-phone" className={TOKENS.input.label}>
                    Phone Number *
                  </label>
                  <input
                    id="inquiry-phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder={SITE_CONFIG.phoneDisplay}
                    className={TOKENS.input.base}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="inquiry-event-type"
                    className={TOKENS.input.label}
                  >
                    Event / Inquiry Type
                  </label>
                  <select
                    id="inquiry-event-type"
                    value={formData.eventType}
                    onChange={(e) =>
                      setFormData({ ...formData, eventType: e.target.value })
                    }
                    className={TOKENS.input.select}
                  >
                    <option value="Wedding / Bridal Party">
                      Wedding / Bridal Party
                    </option>
                    <option value="Editorial / Modeling Shoot">
                      Editorial / Modeling Shoot
                    </option>
                    <option value="Swing Dance Camp / Troupe">
                      Swing Dance Camp / Troupe Prep
                    </option>
                    <option value="Car Show / Pin-Up Pageant">
                      Car Show / Pin-Up Pageant
                    </option>
                    <option value="Private Gala / Special Event">
                      Private Gala / Milestone Party
                    </option>
                    <option value="Other Custom Booking">
                      Other Custom Production
                    </option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="inquiry-party-size"
                    className={TOKENS.input.label}
                  >
                    Estimated Party Size
                  </label>
                  <div className="relative">
                    <Users className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      id="inquiry-party-size"
                      value={formData.partySize}
                      onChange={(e) =>
                        setFormData({ ...formData, partySize: e.target.value })
                      }
                      className={TOKENS.input.selectWithIcon}
                    >
                      <option value="Individual (Single Client)">
                        Individual (Single Client)
                      </option>
                      <option value="2-3 People">2-3 People</option>
                      <option value="4-6 People">4-6 People</option>
                      <option value="7+ People (Full Wedding / Troupe)">
                        7+ People (Full Wedding / Troupe)
                      </option>
                      <option value="Full-Day Production / Shoot">
                        Full-Day Production / Shoot
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="inquiry-date-location"
                  className={TOKENS.input.label}
                >
                  Target Date & Location (City or Venue) *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="inquiry-date-location"
                    type="text"
                    required
                    value={formData.dateLocation}
                    onChange={(e) =>
                      setFormData({ ...formData, dateLocation: e.target.value })
                    }
                    placeholder="e.g., October 14, 2026 • San Francisco or Bay Area venue"
                    className={TOKENS.input.iconWrapper}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="inquiry-notes" className={TOKENS.input.label}>
                  Styling Notes / Desired Aesthetics (Optional)
                </label>
                <textarea
                  id="inquiry-notes"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Mention desired styles (e.g. vintage victory rolls, natural curl styling, 1940s waves), call-times, or group details..."
                  className={TOKENS.input.base}
                />
              </div>

              <div className="pt-2">
                <button
                  id="submit-custom-inquiry-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className={TOKENS.button.primaryFull}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Sending Inquiry...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Custom Booking Inquiry</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-stone-500 text-center font-sans">
                Prefer direct reach out? Email{" "}
                <a
                  href={`mailto:${SITE_CONFIG.email}`}
                  className="underline text-stone-800 hover:text-stone-950 font-medium transition"
                >
                  {SITE_CONFIG.email}
                </a>{" "}
                or text{" "}
                <a
                  href={SITE_CONFIG.phoneTel}
                  className="underline text-stone-800 hover:text-stone-950 font-medium transition"
                >
                  {SITE_CONFIG.phoneDisplay}
                </a>
                .
              </p>

              <p className="text-[11px] text-stone-400 text-center font-sans">
                Direct quotes provided with travel estimates, preparation
                guides, and timed schedules.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
