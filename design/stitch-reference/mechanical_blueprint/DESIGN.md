---
name: Mechanical Blueprint
colors:
  surface: '#f4faff'
  surface-dim: '#cbdde8'
  surface-bright: '#f4faff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#e8f6ff'
  surface-container: '#def0fc'
  surface-container-high: '#d9ebf7'
  surface-container-highest: '#d3e5f1'
  on-surface: '#0c1e26'
  on-surface-variant: '#444651'
  inverse-surface: '#22333c'
  inverse-on-surface: '#e2f3ff'
  outline: '#757682'
  outline-variant: '#c5c5d3'
  surface-tint: '#4059aa'
  primary: '#00236f'
  on-primary: '#ffffff'
  primary-container: '#1e3a8a'
  on-primary-container: '#90a8ff'
  inverse-primary: '#b6c4ff'
  secondary: '#b61722'
  on-secondary: '#ffffff'
  secondary-container: '#da3437'
  on-secondary-container: '#fffbff'
  tertiary: '#735c00'
  on-tertiary: '#ffffff'
  tertiary-container: '#cea700'
  on-tertiary-container: '#4e3e00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b6c4ff'
  on-primary-fixed: '#00164e'
  on-primary-fixed-variant: '#264191'
  secondary-fixed: '#ffdad7'
  secondary-fixed-dim: '#ffb3ad'
  on-secondary-fixed: '#410004'
  on-secondary-fixed-variant: '#930013'
  tertiary-fixed: '#ffe083'
  tertiary-fixed-dim: '#eec200'
  on-tertiary-fixed: '#231b00'
  on-tertiary-fixed-variant: '#574500'
  background: '#f4faff'
  on-background: '#0c1e26'
  surface-variant: '#d3e5f1'
typography:
  display:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '800'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '800'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Work Sans
    fontSize: 18px
    fontWeight: '500'
    lineHeight: '1.6'
  body-md:
    fontFamily: Work Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-bold:
    fontFamily: Space Grotesk
    fontSize: 14px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Space Grotesk
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 40px
  xl: 64px
  grid-margin: 24px
  grid-gutter: 24px
---

## Brand & Style
This design system captures a Neo-Brutalist interpretation of futuristic gadgetry. The brand personality is optimistic, mechanical, and highly structured, evoking the feeling of an engineering blueprint come to life. It targets a creative, tech-savvy audience that appreciates tactile interfaces and bold, nostalgic aesthetics.

The visual style is characterized by "Physical Neo-Brutality." It rejects the ephemeral nature of modern SaaS design (blurs, gradients, soft shadows) in favor of heavy strokes, solid offsets, and a rigid grid. Every element must feel like a tangible part of a machine—bolted down, outlined, and ready to be toggled. The atmosphere is energetic yet disciplined, combining a playful primary palette with a strict geometric framework.

## Colors
The palette is rooted in a primary triad that commands attention and defines hierarchy through high-contrast layering.

- **Primary (Navy Blue):** Used for all structural elements, including 4px borders and solid 6px shadows. It is the "ink" of the system.
- **Secondary (Gadget Red):** Reserved for high-priority actions, critical alerts, and focal points.
- **Tertiary (Bell Gold):** Used for secondary highlights, toggles, and "special" gadget features.
- **Neutral (Matte Sky-Blue):** The base canvas color. It should be overlaid with a 32px x 32px white grid line pattern (1px stroke) to simulate an engineering blueprint.
- **Surface (4D White):** Pure white panels used for content areas to ensure maximum legibility against the blue background.

## Typography
The typography strategy uses heavy weights and geometric structures to match the 4px border system.

- **Headlines:** Set in **Plus Jakarta Sans** at Extra Bold or Bold weights. These should feel "blocky" and impactful. For display text, use tight letter spacing to emphasize the physical mass of the words.
- **Body:** **Work Sans** provides a grounded, neutral balance. It ensures that while the interface is playful, the information remains professional and readable.
- **Labels/Technical Info:** **Space Grotesk** is used for utility text, buttons, and data points, reinforcing the technical, "gadget" feel of the system.

## Layout & Spacing
The layout follows a strict 8px hard grid, ensuring every element aligns with the blueprint background.

- **Grid Model:** Use a 12-column fluid grid for desktop and a 4-column grid for mobile.
- **Rhythm:** Spacing is derived from a 4px base unit. Gaps between panels should match the shadow offset (6px or 8px) to create a consistent "mechanical fit."
- **Margins:** Container margins are a fixed 24px on mobile and scale to a maximum of 64px on ultra-wide displays to maintain the "panel" aesthetic.
- **Reflow:** On mobile, side-by-side panels stack vertically. The 4px borders remain constant regardless of screen size to maintain the physical identity.

## Elevation & Depth
In this design system, depth is communicated through **Solid Offsets** rather than light and shadow. There are no blurs.

- **Level 0 (Canvas):** The Sky-Blue background with white grid.
- **Level 1 (Panels):** White or Pale Yellow surfaces with a 4px Navy Blue border and a 6px x 6px solid Navy Blue shadow offset to the bottom-right.
- **Level 2 (Interactive):** Buttons and active cards. On hover, these elements shift 2px down and 2px right, while the shadow reduces to 4px, simulating a physical "press."
- **Level 3 (Active/Pressed):** Elements shift the full 6px down and right, aligning with the shadow's original position, effectively "flattening" the button against the surface.

## Shapes
Shapes are predominantly "Soft" Neo-Brutalist. While the aesthetic is raw, slightly rounded corners (0.25rem) prevent the UI from feeling sharp or aggressive, maintaining the friendly gadget theme.

- **Standard Elements:** 4px (0.25rem) corner radius.
- **Containers/Cards:** 8px (0.5rem) corner radius.
- **Interactive Toggles:** Elements like "Bell" buttons or circular gadgets use a 100% radius (Circle) but retain the 4px border and 6px solid shadow.

## Components
- **Buttons:** Must have a 4px Navy Blue border. Primary buttons use Gadget Red with white text. Secondary buttons use Bell Gold with Navy text.
- **Input Fields:** Pure white background, 4px Navy border. The "focus" state changes the shadow offset color to Bell Gold or Gadget Red.
- **Cards:** White surfaces with the standard 6px Navy shadow. Card headers should be separated by a 4px horizontal Navy line.
- **Chips/Labels:** Use Space Grotesk. Small, pill-shaped or rectangular with 4px borders and no shadows to indicate they are "labels" rather than "buttons."
- **Progress Bars:** A "mechanical" look. A 4px Navy frame with a solid Gadget Red or Bell Gold fill that steps in 10% increments.
- **Checkboxes:** Square, 4px border. When checked, the box fills with Navy and displays a white "X" or checkmark.