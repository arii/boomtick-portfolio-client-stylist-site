import React from "react";

export const EventsCollaboration: React.FC = () => {
  return (
    <section
      id="events"
      className="pt-20 pb-4 bg-stone-50 border-t border-stone-200 scroll-mt-16"
    >
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 tracking-tight">
          Events & Collaborations
        </h2>
        <p className="mt-3 text-stone-600 font-sans text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
          Custom on-location styling available for weddings and bridal parties,
          editorial and commercial shoots, swing dance camps, and classic car
          show pageants across San Francisco and the wider Bay Area.
        </p>
      </div>
    </section>
  );
};
