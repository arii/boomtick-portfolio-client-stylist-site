/**
 * Centralized Design System Tokens & Reusable UI Classes
 *
 * Use these tokens across components so that styling adjustments (colors,
 * corner radius, font sizing, touch targets, focus states) can be updated
 * centrally in one single place.
 */

export const TOKENS = {
  // Button variants
  button: {
    primary:
      "bg-stone-900 hover:bg-stone-800 text-white font-semibold py-3.5 px-6 min-h-[48px] rounded-xl text-xs font-sans tracking-wider uppercase transition cursor-pointer inline-flex items-center justify-center gap-2 shadow-sm disabled:opacity-50",
    primaryFull:
      "w-full bg-stone-900 hover:bg-stone-800 text-white font-semibold py-3.5 px-4 min-h-[48px] rounded-xl text-xs font-sans tracking-wider uppercase transition cursor-pointer flex items-center justify-center gap-2 shadow-sm disabled:opacity-50",
    navAction:
      "bg-stone-900 hover:bg-stone-800 text-white px-5 py-2.5 min-h-[40px] flex items-center justify-center rounded-xl text-xs font-semibold tracking-wider uppercase transition cursor-pointer shadow-xs",
    icon: "w-10 h-10 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-950 transition flex items-center justify-center border border-stone-200/40 cursor-pointer",
    iconMobile:
      "w-11 h-11 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-950 transition flex items-center justify-center border border-stone-200/40 cursor-pointer",
  },

  // Card layouts
  card: {
    base: "bg-white rounded-2xl border border-stone-200 p-6 md:p-8 shadow-2xs",
    service:
      "bg-stone-50 rounded-2xl border border-stone-200 p-7 flex flex-col justify-between hover:border-stone-300 transition duration-200 shadow-2xs",
    showcase:
      "group relative rounded-2xl overflow-hidden border border-stone-200/90 bg-stone-200 shadow-2xs aspect-square",
    callout:
      "p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-700 flex items-center justify-center gap-2 text-center",
  },

  // Form input elements
  input: {
    base: "w-full px-3.5 py-3 min-h-[48px] rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-stone-900 bg-white font-sans text-base transition",
    iconWrapper:
      "w-full pl-10 pr-3.5 py-3 min-h-[48px] rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-stone-900 bg-white font-sans text-base transition",
    select:
      "w-full px-3.5 py-3 min-h-[48px] rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-stone-900 bg-white font-sans text-base transition cursor-pointer",
    selectWithIcon:
      "w-full pl-10 pr-3.5 py-3 min-h-[48px] rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-stone-900 bg-white font-sans text-base transition cursor-pointer",
    label:
      "block text-xs font-bold uppercase tracking-wider text-stone-700 font-sans mb-1.5",
  },

  // Badges & indicators
  badge: {
    credentials:
      "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-200/60 border border-stone-300/80 text-stone-800 text-xs font-semibold tracking-wider font-sans",
  },

  // Accent icons
  accent: {
    icon: "text-rose-600",
    iconHover: "hover:text-rose-600",
    bgHover: "hover:bg-rose-600",
  },
} as const;
