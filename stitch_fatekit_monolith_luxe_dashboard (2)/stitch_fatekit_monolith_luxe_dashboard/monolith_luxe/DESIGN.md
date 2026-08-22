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
  secondary: '#675d53'
  on-secondary: '#ffffff'
  secondary-container: '#efe0d4'
  on-secondary-container: '#6d6259'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1b1b1b'
  on-tertiary-container: '#848484'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c6'
  on-primary-fixed: '#1b1b1b'
  on-primary-fixed-variant: '#474747'
  secondary-fixed: '#efe0d4'
  secondary-fixed-dim: '#d2c4b9'
  on-secondary-fixed: '#211a13'
  on-secondary-fixed-variant: '#4e453c'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c6'
  on-tertiary-fixed: '#1b1b1b'
  on-tertiary-fixed-variant: '#474747'
  background: '#fbf9f9'
  on-background: '#1b1c1c'
  surface-variant: '#e3e2e2'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 64px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '500'
    lineHeight: '1.3'
  body-lg:
    fontFamily: IBM Plex Sans Arabic
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: IBM Plex Sans Arabic
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: IBM Plex Sans Arabic
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.05em
  label-sm:
    fontFamily: IBM Plex Sans Arabic
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.4'
spacing:
  unit: 4px
  gutter: 24px
  margin-mobile: 20px
  margin-desktop: 80px
  section-gap: 120px
---

## Brand & Style
The design system embodies a high-end editorial aesthetic tailored for the luxury beauty market. It prioritizes a sense of "monumental minimalism"—where heavy whitespace and precise, thin-lined structures create an atmosphere of exclusivity and prestige. The emotional response is one of calm, sophistication, and timelessness.

The design style is **Minimalist with Editorial Influence**, drawing inspiration from high-fashion print journalism. It utilizes a strict monochromatic foundation with soft, skin-toned accents to reflect the makeup industry's relationship with the human canvas. The UI is designed for a Right-to-Left (RTL) experience, ensuring that the luxury narrative remains fluid and intuitive for Arabic-speaking audiences.

## Colors
The palette is intentionally restrained to maintain a premium feel. 

- **Primary (Black):** Used for all structural elements, text, and primary call-to-actions. It provides the "Monolith" presence against the light background.
- **Secondary (Warm Champagne/Nude):** Used sparingly as an accent for hover states, selection indicators, or delicate dividers. It softens the starkness of the black and white.
- **Background (Pure White):** A slightly off-white, gallery-style background that reduces eye strain while maintaining a crisp, clinical luxury feel.
- **Neutrals:** Grayscale tones are used only for secondary information or disabled states, never as a replacement for the primary black.

## Typography
The typography strategy relies on the contrast between the classic, high-fashion curves of **Playfair Display** for headings and the architectural, modern clarity of **IBM Plex Sans Arabic** for functional UI.

- **Headlines:** Use Playfair Display to evoke editorial authority. Large sizes should have tight tracking for a more "designed" look.
- **Body & UI:** IBM Plex Sans Arabic provides a neutral, highly readable foundation that respects the nuances of Arabic script while remaining contemporary.
- **Numerics:** All pricing (₪) and quantities should use the Latin numerals within IBM Plex Sans for maximum clarity in a global luxury context.

## Layout & Spacing
The layout follows a **Fixed Grid** model on desktop to mimic the centered, intentional composition of a luxury lookbook.

- **Desktop (1440px+):** A 12-column grid with generous 80px side margins. Large "negative space" zones are required between product categories.
- **Mobile:** A 4-column fluid grid. Margins are reduced to 20px, but vertical spacing (section gaps) remains high to prevent the UI from feeling cluttered.
- **RTL Flow:** The layout must mirror perfectly. Navigation starts from the right; product images are prioritized on the right in split-screen layouts, with details on the left.
- **Vertical Rhythm:** Use a base unit of 4px. Component internal padding should be generous (e.g., 24px minimum for card containers).

## Elevation & Depth
This design system rejects traditional shadows in favor of **Low-Contrast Outlines** and **Tonal Layering**. 

Hierarchy is established through 1px solid borders (`#000000` or `#F5E6DA`) and scale rather than z-index depth.
- **Surfaces:** All containers are flat. 
- **Separation:** Use thin 1px lines to define sections.
- **Interaction:** Depth is conveyed through subtle color shifts (e.g., a button filling with Black on hover) rather than lifting off the page.

## Shapes
The shape language is strictly **Sharp**. 90-degree angles communicate precision, luxury, and a modern "Monolith" architectural feel.

- **Buttons & Inputs:** Hard corners only.
- **Product Tiles:** Sharp edges with no corner radius.
- **Images:** Always rectangular or square, never rounded.

## Components
- **Buttons:** Primary buttons are solid black with white text. Secondary buttons are transparent with a 1px black border. All buttons use `label-sm` typography.
- **Inputs:** Minimalist bottom-border only or 1px full border. Labels should sit above the field in `label-sm`.
- **Product Cards:** Feature a large, high-resolution image. Information (Name, Price) is center-aligned or right-aligned (RTL) below the image in `body-md` and `headline-md`.
- **Currency Display:** The Israeli Shekel symbol (₪) must always prefix the price (e.g., ₪250) using the sans-serif font for prominence.
- **Cash on Delivery (COD) Badge:** A dedicated, minimal UI label or icon appearing at checkout to clarify that no online payment is required.
- **Chips/Filters:** Simple text with a 1px border. The active state is indicated by a solid black fill.
- **Navigation:** A minimal top bar with high-kerning for the logo. Icons (Cart, Search) should be thin-line (1px stroke) to match the border language.