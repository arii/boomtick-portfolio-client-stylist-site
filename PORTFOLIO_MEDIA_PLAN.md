# Portfolio & Media Showcase: Auto-Cycling Slideshow Headers Plan

This document outlines the architecture, implementation, and CMS management plan for utilizing the **Auto-Cycling Slideshow Headers** across our premium visual media gallery.

By utilizing dynamic, high-fidelity media transitions, we celebrate April's 20+ years of expertise in curly haircuts, fine haircuts, and authentic mid-century vintage styling, while keeping the user experience clean, fast, and high-converting.

---

## 1. UX & Placement Strategy

Initially, dynamic cycling headers were proposed for individual Service Cards. However, to prioritize high-end design principles, reduce layout shift, and optimize conversion rates:

1. **Service Menu Cards** remain text-only with highly prominent pricing, included features/deliverables lists, and direct Cal.com booking action triggers.
2. **Style Showcase (Portfolio)** serves as the high-impact visual home of April's signature disciplines. The dynamic auto-cycling media and smooth transitions are built directly into the portfolio showcase cards.

### Behavioral Highlights:

- **Desktop View:** Hovering over any style showcase card smoothly cycles/cross-fades between 2–3 categorized high-definition photos (every 2.5 seconds) to display additional real client examples of that discipline. Hover-out safely resets back to the main photo.
- **Mobile View:** Slideshows run on a subtle, slow auto-fade carousel (cross-fading every 4.5 seconds) with tiny indicators. This requires **zero user interaction (taps)** to view, keeping engagement high on touchscreens.
- **Metadata & Badges:** Each card is permanently overlayed with an elegant category chip (e.g., _Curly Cut_, _Vintage Styling_) and descriptive alt-text for search engine visibility.

---

## 2. CMS Database Schema (`tina/config.ts`)

To support adding unlimited slideshow images to any portfolio item directly via the CMS interface, the Schema includes an `images` field within the `portfolioList` object:

```typescript
{
  type: "object",
  name: "portfolioList",
  label: "Showcase Images Gallery",
  list: true,
  ui: {
    itemProps: (item: any) => ({
      label: item?.title || item?.alt || item?.id || "Portfolio Item",
    }),
  },
  fields: [
    {
      type: "string",
      name: "title",
      label: "Style Title / Caption",
      description: "Human-readable title for this style (e.g. 'Vintage Victory Rolls')",
    },
    {
      type: "string",
      name: "id",
      label: "Image ID (slug)",
      description: "System anchor identifier used for direct portfolio linking",
      required: true,
    },
    {
      type: "image",
      name: "image",
      label: "Primary Photo",
      description: "High-resolution showcase photograph displayed on load",
      required: true,
    },
    {
      type: "string",
      name: "alt",
      label: "Alt Text Description",
      description: "Descriptive accessibility and image SEO text explaining the style and texture",
      required: true,
    },
    {
      type: "string",
      name: "tag",
      label: "Style Category",
      options: ["Curly Cut", "Vintage Styling", "Updos", "Events & Production"],
    },
    {
      type: "image",
      name: "images",
      label: "Additional Slideshow Photos",
      list: true,
      description: "Add multiple photos to enable smooth auto-cycling slideshows on this portfolio item",
    },
  ],
}
```

---

## 3. How to Update & Add Photos in the CMS

April or an event planner can add new, beautiful media assets in real-time via the Admin Dashboard.

### Step-by-Step Instructions:

1. **Access the Dashboard:**
   - Go to the deployment URL with the `/admin` path (e.g., `https://hairbyapril.pages.dev/admin/index.html`).
   - Authenticate with your CMS credentials.

2. **Navigate to the Portfolio Section:**
   - Select the **Page** content.
   - Scroll down to the **Portfolio & Media Showcase** collection.

3. **Manage Portfolio Items:**
   - **To Update an Existing Style Card (e.g., Curly Cut):**
     - Click on the card item.
     - Scroll to the **Additional Slideshow Photos** section.
     - Click **Add Item** to insert a new slot.
     - Use the **Media Library Manager** to upload high-definition `.jpeg`, `.png`, or `.webp` images from your device, or select an existing asset.
   - **To Add a New Specialty Card:**
     - Click **Add Showcase Image**.
     - Fill out the _Title_, _Image ID_, _Primary Photo_, _Alt Text_, and _Category Tag_.
     - Populate the **Additional Slideshow Photos** field with supporting images.

4. **Verify Accessibility (SEO & Alt Texts):**
   - Make sure every uploaded asset is paired with rich, readable descriptive text (e.g., _"Precision blunt haircut with texturizing for fine hair"_) rather than default file downloads like `IMG_0415.jpeg`. This optimizes visual search indexing for local Google queries.

5. **Save & Deploy:**
   - Click the **Save** or **Publish** button at the top-right.
   - TinaCMS will commit changes to your repository (`src/content/page.json` & `src/content/portfolio.json`). The web application will rebuild automatically, pushing the updates live in seconds!

---

## 4. Under the Hood (`StyleShowcase.tsx` Logic)

The React slider engine gracefully manages transitions, prevents memory leaks, and scales to any number of slides:

```tsx
function PortfolioShowcaseCard({ item }: { item: PortfolioItem }) {
  const [isHovered, setIsHovered] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Compile all photos (Main Photo + Additional Slideshow Photos list)
  const photos = [item.image, ...(item.images || [])].filter(Boolean);

  // Safely detect mobile layout shifts
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Multi-Mode Slider Timer
  useEffect(() => {
    if (photos.length <= 1) return;

    if (isMobile) {
      // Mobile Mode: Constant, slow cross-fade with zero touch inputs required
      const interval = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % photos.length);
      }, 4500);
      return () => clearInterval(interval);
    } else if (isHovered) {
      // Desktop Mode: Cycle through slideshow ONLY on hover
      const interval = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % photos.length);
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [isMobile, isHovered, photos.length]);

  // Reset to original image when mouse hover leaves
  useEffect(() => {
    if (!isHovered && !isMobile) {
      setActiveIndex(0);
    }
  }, [isHovered, isMobile]);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative overflow-hidden rounded-2xl border border-stone-200"
    >
      {photos.map((photo, idx) => (
        <div
          key={photo + idx}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === activeIndex
              ? "opacity-100 z-10"
              : "opacity-0 z-0 pointer-events-none"
          }`}
        >
          <img
            src={photo}
            alt={item.alt || item.title || "Portfolio Hair Style"}
            className="w-full h-full object-cover transition-transform duration-[4000ms]"
            style={{
              transform:
                isHovered && idx === activeIndex ? "scale(1.04)" : "scale(1)",
            }}
          />
        </div>
      ))}

      {/* Tiny slide indicator dots */}
      {photos.length > 1 && (
        <div className="absolute top-4 right-4 flex space-x-1.5 z-20 bg-black/35 backdrop-blur-[4px] px-2.5 py-1.5 rounded-full">
          {photos.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === activeIndex ? "w-3 bg-white" : "w-1.5 bg-white/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## 5. Ongoing Asset Strategy

As more client photos are saved and organized:

- **Formats:** Convert original camera HEIF/HEIC format photos into web-optimized `.webp` or `.jpeg` formats.
- **Sizing:** Scale images to a standard dimension (e.g., width `800px`) before uploading to preserve bandwidth and keep PageSpeed scores exceptionally high.
- **SEO Copywriting:** Write explicit captions showcasing April's exact search terms (e.g. _Victory Rolls_, _Precision Fine Haircut_, _On-Location Event Updo_) to maximize organic leads from SF and the wider Bay Area.
