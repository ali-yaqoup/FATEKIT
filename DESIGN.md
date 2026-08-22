---
name: Monolith Luxe
colors:
  surface: '#fbf9f9'
  surface-dim: '#dbdad9'
  surface-bright: '#fbf9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f3'
  surface-container: '#efeded'
  surface-container-high: '#e9e8e7'
  surface-container-highest: '#e3e2e2'
  on-surface: '#1b1c1c'
  on-surface-variant: '#4c4546'
  inverse-surface: '#303031'
  inverse-on-surface: '#f2f0f0'
  outline: '#7e7576'
  outline-variant: '#cfc4c5'
  surface-tint: '#5e5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1b1b1b'
  on-primary-container: '#848484'
  inverse-primary: '#c6c6c6'
  secondary: '#5d5f5f'
  on-secondary: '#ffffff'
  secondary-container: '#dfe0e0'
  on-secondary-container: '#616363'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#211a13'
  on-tertiary-container: '#8d8278'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c6'
  on-primary-fixed: '#1b1b1b'
  on-primary-fixed-variant: '#474747'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c7'
  on-secondary-fixed: '#1a1c1c'
  on-secondary-fixed-variant: '#454747'
  tertiary-fixed: '#efe0d4'
  tertiary-fixed-dim: '#d2c4b9'
  on-tertiary-fixed: '#211a13'
  on-tertiary-fixed-variant: '#4e453c'
  background: '#fbf9f9'
  on-background: '#1b1c1c'
  surface-variant: '#e3e2e2'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 64px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 40px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '500'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.4'
  body-lg:
    fontFamily: IBM Plex Sans Arabic
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: IBM Plex Sans Arabic
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-caps:
    fontFamily: IBM Plex Sans Arabic
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.0'
    letterSpacing: 0.1em
  ui-button:
    fontFamily: IBM Plex Sans Arabic
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.0'
    letterSpacing: 0.05em
spacing:
  unit: 8px
  container-max: 1440px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
  section-gap: 120px
---

## Brand & Style

The design system is rooted in the "Monolith Luxe" aesthetic—a fusion of high-fashion editorial layout and modern minimalist rigor. It is designed to evoke exclusivity, precision, and timeless elegance for a premium makeup brand. The emotional response is one of aspiration and calm, moving away from cluttered "sales-heavy" interfaces toward a gallery-like experience.

The style leverages **Minimalism** with a **High-Contrast** edge. It utilizes expansive whitespace (white-space) to allow product photography to breathe, functioning more like a digital luxury magazine than a standard e-commerce site. Every element is intentional, stripping away decorative clutter to focus on the interplay between stark black, pure white, and high-fidelity imagery.

## Colors

This design system employs a strictly binary foundation to maintain a high-fashion editorial feel.

- **Primary (#000000):** Used for headers, primary navigation, and high-impact CTA buttons. It represents authority and permanence.
- **Background (#FFFFFF):** The canvas. Used to create a feeling of limitlessness and cleanliness.
- **Accent (#F5E6DA):** A "Champagne Nude" used sparingly for hover states on secondary buttons, specialized product badges, or subtle background tints for seasonal collections.
- **Text:** Absolute black (#000000) on white surfaces for maximum legibility; pure white (#FFFFFF) on black surfaces (like the global header) for striking contrast.

Color is never used to convey status (error/success) through vibrant hues; instead, use iconography and weight to maintain the monochromatic integrity.

## Typography

The typography strategy is a rhythmic contrast between the classical Serif and the utilitarian Sans-Serif.

- **Headlines (Playfair Display):** Used for editorial moments, product names, and section headers. In RTL (Arabic) contexts, if a serif is unavailable, maintain high-contrast weights to mimic the serif's impact.
- **Interface & Body (IBM Plex Sans Arabic):** Chosen for its technical precision and exceptional legibility in both English and Arabic. It handles the "commerce" aspect of the system—prices, descriptions, and navigation.
- **RTL Optimization:** Ensure line heights are increased by 10-15% for Arabic scripts to prevent descender/ascender clipping. Alignment should be strictly right-aligned for Arabic locales, with the font weight slightly adjusted to maintain visual "blackness" parity with English text.

## Layout & Spacing

This design system uses a **Fixed Grid** approach for desktop to preserve the editorial composition, transitioning to a **Fluid Grid** for mobile.

- **Desktop (1440px):** 12-column grid with 24px gutters. Large 64px side margins create a "frame" effect, making the browser feel like a printed page.
- **Mobile:** 4-column grid with 16px margins. 
- **Rhythm:** Spacing follows a strict 8px base unit. Use generous vertical "Section Gaps" (120px+) between major homepage modules to emphasize the premium nature of the brand.
- **RTL Reflow:** All horizontal layouts must flip. The sidebar moves to the right, and the "Back" arrows point right. Ensure the logical flow of the "Add to Cart" and "Price" information remains intuitive in the mirrored layout.

## Elevation & Depth

To maintain a "flat luxury" aesthetic, this design system avoids traditional shadows. Depth is communicated through **Tonal Layers** and **Bold Outlines**.

- **Surfaces:** Use #FFFFFF as the base. Overlays (like Quick-view modals) use a solid #000000 background with white text to "pop" without needing a shadow.
- **Borders:** A 1px solid #000000 or #E5E5E5 (light grey) border is used to define areas such as input fields and card boundaries.
- **Interactive Depth:** Instead of elevation, use "Inversion" for depth. A white button turns black on hover; a white card gains a 1px black border. 
- **Z-Index:** Treat the header as a "sticky monolith"—a solid black bar that remains at the top, ensuring the brand identity is always visible.

## Shapes

The shape language is **Sharp (0px)**. 

To evoke the precision of luxury packaging and architectural design, all UI elements—including buttons, input fields, and product cards—feature 90-degree corners. 

Exceptions:
- **Circular Elements:** Only for color swatches and functional icons (e.g., a "remove" "X" in a circle). 
- **Images:** All image containers must be sharp. Use varied aspect ratios (2:3 or 4:5) for a fashion-magazine feel rather than standard 1:1 squares.

## Components

- **Buttons:** Primary buttons are solid black rectangles with white center-aligned text. Secondary buttons are transparent with a 1px black border. No rounded corners.
- **Input Fields:** Minimalist 1px bottom border only for a "form" look, or a full 1px box. Labels use `label-caps` and sit above the field.
- **Product Cards:** No borders by default. Use large, high-resolution photography. The product name (Serif) and price (Sans) appear below the image. On hover, a "Quick Add" bar slides up from the bottom of the image in solid black.
- **Chips/Badges:** Small, rectangular boxes with `label-caps` text. Used for "New In" or "Limited Edition." Use the Accent color (#F5E6DA) background with black text here.
- **Navigation:** The global header is solid black (#000000). Links are white, using `label-caps`. 
- **RTL Specifics:** Search icons and "Account" icons must be positioned on the opposite side. Progress bars for checkout must fill from right to left.
- **Dividers:** Use 1px hair-line dividers (#E5E5E5) to separate list items or footer sections, ensuring they never feel heavy.