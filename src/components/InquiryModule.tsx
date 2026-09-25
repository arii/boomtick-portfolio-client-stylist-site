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
import { SITE_CONFIG, EVENTS_CONTENT } from "../config/site";
import type { FormFieldItem } from "../types/content";

export const InquiryModule: React.FC = () => {
  const defaultFields: FormFieldItem[] = [
    { _template: "inputField", label: "Your Name", fieldType: "text", placeholder: "Jane Doe", required: true },
    { _template: "inputField", label: "Email Address", fieldType: "email", placeholder: "jane@example.com", required: true },
    { _template: "inputField", label: "Phone Number", fieldType: "tel", placeholder: SITE_CONFIG.phoneDisplay, required: true },
    { 
      _template: "selectField", 
      label: "Event / Inquiry Type", 
      options: [
        "Wedding / Bridal Party", 
        "Editorial / Commercial Photoshoot", 
        "Swing Dance Camp / Festival", 
        "Retro Pageant / Special Event", 
        "Private Group Styling Session"
      ], 
      required: true 
    },
    { 
      _template: "selectField", 
      label: "Estimated Party Size", 
      options: [
        "1 Person", 
        "2-4 People", 
        "5-8 People", 
        "9+ People (Large Bridal / Production Group)"
      ], 
      required: true 
    },
    { _template: "inputField", label: "Target Date & Location (City or Venue)", fieldType: "text", placeholder: "e.g., October 14, 2026 • San Francisco or Bay Area venue", required: true },
    { _template: "textareaField", label: "Styling Notes / Desired Aesthetics", placeholder: "Mention desired styles (e.g. vintage victory rolls, natural curl styling, 1940s waves), call-times, or group details...", required: false }
  ];

  const formFields: FormFieldItem[] = EVENTS_CONTENT.formFields?.length ? EVENTS_CONTENT.formFields : defaultFields;
  const submitButtonText = EVENTS_CONTENT.formOptions?.submitButtonText || "Submit Booking Inquiry";

  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleFieldChange = (label: string, value: string) => {
    setFieldValues((prev) => ({ ...prev, [label]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    const sheetUrl = SITE_CONFIG.googleSheetUrl;

    const payload = {
      recipient: SITE_CONFIG.email,
      submittedAt: new Date().toISOString(),
      fields: formFields.map((field) => ({
        label: field.label,
        value: fieldValues[field.label] || "N/A",
      })),
    };

    if (sheetUrl) {
      try {
        await fetch(sheetUrl, {
          method: "POST",
          headers: {
            "Content-Type": "text/plain;charset=utf-8",
          },
          body: JSON.stringify(payload),
        });
        setIsSubmitting(false);
        setSubmitted(true);
      } catch (err: unknown) {
        const errorMsg =
          err instanceof Error
            ? err.message
            : "Network error transmitting inquiry to Apps Script endpoint.";
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

  // Find client name if possible for confirmation message
  const clientNameField = Object.entries(fieldValues).find(([label]) => 
    label.toLowerCase().includes("name")
  );
  const clientName = clientNameField ? clientNameField[1] : "";

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
                Thank you, {clientName || "friend"}.{" "}
                {SITE_CONFIG.stylistName} will review your request and reach out
                with availability, schedule details, and custom rate options.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setSubmitError(null);
                  setFieldValues({});
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

              {formFields.map((field, idx) => {
                const fieldKey = `field_${idx}`;
                const isRequired = field.required !== false;

                if (field._template === "selectField") {
                  return (
                    <div key={fieldKey}>
                      <label htmlFor={`field-input-${idx}`} className={TOKENS.input.label}>
                        {field.label} {isRequired && "*"}
                      </label>
                      <div className="relative">
                        <Users className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <select
                          id={`field-input-${idx}`}
                          required={isRequired}
                          value={fieldValues[field.label] || ""}
                          onChange={(e) => handleFieldChange(field.label, e.target.value)}
                          className={TOKENS.input.selectWithIcon}
                        >
                          <option value="" disabled>Select an option...</option>
                          {field.options?.map((opt, oIdx) => (
                            <option key={oIdx} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  );
                }

                if (field._template === "textareaField") {
                  return (
                    <div key={fieldKey}>
                      <label htmlFor={`field-input-${idx}`} className={TOKENS.input.label}>
                        {field.label} {isRequired && "*"}
                      </label>
                      <textarea
                        id={`field-input-${idx}`}
                        rows={3}
                        required={isRequired}
                        value={fieldValues[field.label] || ""}
                        onChange={(e) => handleFieldChange(field.label, e.target.value)}
                        placeholder={field.placeholder || ""}
                        className={TOKENS.input.base}
                      />
                    </div>
                  );
                }

                // Default inputField
                return (
                  <div key={fieldKey}>
                    <label htmlFor={`field-input-${idx}`} className={TOKENS.input.label}>
                      {field.label} {isRequired && "*"}
                    </label>
                    <div className="relative">
                      {field.label.toLowerCase().includes("location") || field.label.toLowerCase().includes("venue") ? (
                        <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      ) : null}
                      <input
                        id={`field-input-${idx}`}
                        type={field.fieldType || "text"}
                        required={isRequired}
                        value={fieldValues[field.label] || ""}
                        onChange={(e) => handleFieldChange(field.label, e.target.value)}
                        placeholder={field.placeholder || ""}
                        className={
                          field.label.toLowerCase().includes("location") || field.label.toLowerCase().includes("venue")
                            ? TOKENS.input.iconWrapper
                            : TOKENS.input.base
                        }
                      />
                    </div>
                  </div>
                );
              })}

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
                      <span>{submitButtonText}</span>
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
