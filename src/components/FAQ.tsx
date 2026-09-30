import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { tinaField } from "../lib/useTina";
import type { FAQContent } from "../types/content";

const DEFAULT_FAQS = [
  {
    question: "Is service pricing restricted to San Francisco only?",
    answer: "Yes, all published menu rates are for appointments within San Francisco proper. A travel and logistics surcharge is added for out-of-town on-location styling throughout the greater San Francisco Bay Area.",
  },
  {
    question: "What exactly is a concierge hair stylist?",
    answer: "A concierge stylist brings professional, high-end salon expertise directly to you. April provides bespoke on-location hair styling, vintage updos, and cuts at your private home, hotel, commercial photo set, or event venue for ultimate convenience and zero travel stress.",
  },
  {
    question: "What are vintage victory rolls and retro Hollywood waves?",
    answer: "These are iconic, authentic mid-century hair styling techniques. Victory rolls are meticulously rolled, sculpted, and structurally set curls pinned high on the crown. S-waves (or classic Hollywood waves) are continuous, high-gloss, polished waves that create a continuous ribbon-like ripple down the hair, popular in 1940s and 50s fashion.",
  },
];

export function FAQ({ content }: { content?: FAQContent }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const title = content?.sectionTitle || "Frequently Asked Questions";
  const faqs = content?.faqList && content.faqList.length > 0 ? content.faqList : DEFAULT_FAQS;

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 md:py-24 bg-stone-50 border-b border-stone-200" id="faq">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <span className="text-[11px] font-bold uppercase tracking-widest text-rose-600 font-sans">
            Have Questions?
          </span>
          <h2
            data-tina-field={content ? tinaField(content, "sectionTitle") : undefined}
            className="mt-2 text-3xl md:text-4xl font-serif font-bold text-stone-900 tracking-tight"
          >
            {title}
          </h2>
        </div>

        <div className="space-y-4 max-w-3xl mx-auto">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-2xs hover:border-stone-300 transition duration-150"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between p-5 text-left font-serif font-bold text-stone-900 hover:text-stone-950 transition gap-4"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span
                      data-tina-field={content && content.faqList?.[index] ? tinaField(content.faqList[index], "question") : undefined}
                      className="text-sm md:text-base"
                    >
                      {faq.question}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-stone-400 shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isOpen ? "max-h-[500px] border-t border-stone-100" : "max-h-0"
                  }`}
                >
                  <p
                    data-tina-field={content && content.faqList?.[index] ? tinaField(content.faqList[index], "answer") : undefined}
                    className="p-5 text-stone-600 text-xs md:text-sm font-sans leading-relaxed whitespace-pre-line"
                  >
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
