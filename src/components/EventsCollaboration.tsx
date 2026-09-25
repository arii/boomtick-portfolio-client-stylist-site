import React from "react";
import { EVENTS_CONTENT } from "../config/site";
import type { EventsContent } from "../types/content";

interface EventsCollaborationProps {
  content?: EventsContent;
}

export const EventsCollaboration: React.FC<EventsCollaborationProps> = ({
  content = EVENTS_CONTENT,
}) => {
  return (
    <section
      id="forms"
      className="relative pt-20 pb-4 bg-stone-50 border-t border-stone-200 scroll-mt-16"
    >
      <span id="events" className="absolute -top-16" />
      <span id="form" className="absolute -top-16" />
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 tracking-tight">
          {content.title}
        </h2>
        <p className="mt-3 text-stone-600 font-sans text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
          {content.description}
        </p>
      </div>
    </section>
  );
};
