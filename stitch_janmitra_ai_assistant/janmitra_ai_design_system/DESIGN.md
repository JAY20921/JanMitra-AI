---
name: JanMitra AI Design System
colors:
  surface: '#f8f9ff'
  surface-dim: '#d0dbed'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e6eeff'
  surface-container-high: '#dee9fc'
  surface-container-highest: '#d9e3f6'
  on-surface: '#121c2a'
  on-surface-variant: '#444651'
  inverse-surface: '#27313f'
  inverse-on-surface: '#eaf1ff'
  outline: '#757682'
  outline-variant: '#c5c5d3'
  surface-tint: '#4059aa'
  primary: '#00236f'
  on-primary: '#ffffff'
  primary-container: '#1e3a8a'
  on-primary-container: '#90a8ff'
  inverse-primary: '#b6c4ff'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#4b1c00'
  on-tertiary: '#ffffff'
  tertiary-container: '#6e2d00'
  on-tertiary-container: '#ff8f4f'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b6c4ff'
  on-primary-fixed: '#00164e'
  on-primary-fixed-variant: '#264191'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffdbca'
  tertiary-fixed-dim: '#ffb690'
  on-tertiary-fixed: '#341100'
  on-tertiary-fixed-variant: '#783200'
  background: '#f8f9ff'
  on-background: '#121c2a'
  surface-variant: '#d9e3f6'
typography:
  headline-xl:
    fontFamily: Manrope
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 40px
  xl: 64px
  container-max: 1120px
  gutter: 24px
---

## Brand & Style
The design system is built on the pillars of **Institutional Trust, Radical Clarity, and Human-Centric Efficiency**. It bridges the gap between complex government bureaucracy and the intuitive nature of modern AI interfaces. The aesthetic is "Modern Professional"—borrowing the systematic rigor of enterprise SaaS and the uncompromising accessibility of public service portals.

The visual narrative avoids "AI tropes" like glowing gradients or futuristic particles. Instead, it utilizes high-quality whitespace, crisp borders, and a grounded color palette to evoke a sense of calm and reliability. This is a tool meant to be used by citizens of all ages and backgrounds, requiring an interface that feels stable, authoritative, and helpful.

## Colors
The palette is engineered for high legibility and psychological reassurance. 

- **Primary (Deep Blue):** Used for navigation, primary actions, and branding. It represents the "Anchor" of the experience, providing the authority of a government institution.
- **Secondary (Emerald Green):** Reserved for "Success" states, "Eligible" notifications, and completion indicators. It provides a positive emotional reward during the welfare application process.
- **Accent (Soft Orange):** Used sparingly for informational highlights or subtle calls to attention that aren't critical errors.
- **Surface & Background:** The use of Off-White (#FAFAFA) reduces eye strain compared to pure white, creating a softer, paper-like reading experience similar to high-end editorial sites.
- **Typography:** Dark Gray (#1F2937) ensures AA/AAA contrast ratios against the background for maximum accessibility.

## Typography
Typography is the most critical asset in this design system. We use **Manrope** for headlines to provide a modern, friendly, yet professional character. Its geometric balance ensures titles are legible even at smaller mobile scales.

For all functional text, body copy, and data, we use **Inter**. Inter’s tall x-height and systematic design make it the gold standard for screen readability. 

**Key Rules:**
- **Generous Leading:** Line heights are kept intentionally loose (1.5x for body) to assist users with cognitive friction or visual impairments.
- **Hierarchy:** No more than three weights are used (Regular, Medium, Semi-Bold) to keep the interface simple.
- **Contrast:** Crucial information never relies on color alone; font weight and size changes clearly indicate the hierarchy of information.

## Layout & Spacing
The layout follows a **structured fluid grid** with a maximum container width to prevent line lengths from becoming unreadable on wide monitors.

- **Desktop:** 12-column grid with a 1120px max-width, 24px gutters, and 40px side margins.
- **Tablet:** 8-column grid with 24px margins.
- **Mobile:** 4-column grid with 16px margins.

We use an **8pt spacing system** to maintain vertical rhythm. Whitespace is used aggressively to separate different "thought units" in the AI conversation, ensuring the user is never overwhelmed by a wall of text. Content should be centered in the viewport to maintain focus, mimicking the "reading mode" of apps like Notion or Substack.

## Elevation & Depth
Depth in the design system is handled with **Subtle Tonal Layering** and **Soft Ambient Shadows**. We avoid heavy dropshadows to keep the interface feeling light and "airbound."

- **Level 0 (Background):** The off-white base layer.
- **Level 1 (Cards/Sheets):** Pure white (#FFFFFF) surfaces with a 1px border (#E5E7EB). This is the primary container for content.
- **Level 2 (Active Elements):** For hovered items or modals, we apply a very soft, diffused shadow: `0px 4px 12px rgba(0, 0, 0, 0.05)`. 

Interaction is communicated through subtle shifts in border color or background tint rather than dramatic 3D effects. This maintains the "Modern Minimal" ethos.

## Shapes
The design system utilizes a **Rounded** shape language to appear approachable and modern. 

- **Containers & Cards:** 16px (1rem) corner radius. This creates a soft frame for government data, making it feel less intimidating.
- **Buttons & Inputs:** 8px (0.5rem) corner radius. This provides a clear, clickable structure that feels distinct from the larger page containers.
- **Small Elements (Chips/Badges):** Fully rounded (Pill-shaped) to distinguish them from interactive buttons.

Consistent radii across all elements ensure the UI feels like a single, cohesive ecosystem.

## Components
### Buttons
- **Primary:** Deep Blue background, white text. No gradients. High-contrast and clear.
- **Secondary:** White background, Deep Blue border (1px), Deep Blue text.
- **Success:** Emerald Green background, white text. Used for final submission or "Claim Benefit" actions.

### Input Fields
- Background: Pure White.
- Border: 1px Light Gray (#E5E7EB). 
- Active State: 2px Deep Blue border with a soft blue outer glow. 
- Labels always sit above the input, never hidden as placeholders, to ensure accessibility.

### Cards (The "Welfare Card")
Used to display available schemes. They feature a white background, 16px rounded corners, a 1px border, and a subtle shadow. The title is always Manrope Semi-Bold, while the description is Inter Regular.

### Chat Interface
- **User Bubble:** Light Gray tint background, right-aligned.
- **AI Response:** No bubble; plain text with a small institutional icon to the left. This mimics the clean, readable flow of an editorial article or a Perplexity-style answer.

### Progress Indicators
Steppers are used for multi-step applications. They use Emerald Green for completed steps and Deep Blue for the active step.