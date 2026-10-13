---
name: Tactile Editorial & Tech Brutalism
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0edec'
  surface-container-high: '#ebe7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#5c403d'
  inverse-surface: '#313030'
  inverse-on-surface: '#f3f0ef'
  outline: '#916f6b'
  outline-variant: '#e6bdb9'
  surface-tint: '#bf0717'
  primary: '#bb0215'
  on-primary: '#ffffff'
  primary-container: '#e02a2b'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb4ac'
  secondary: '#5f5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e5e2e1'
  on-secondary-container: '#656464'
  tertiary: '#5b5c5b'
  on-tertiary: '#ffffff'
  tertiary-container: '#747573'
  on-tertiary-container: '#fdfcfa'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad6'
  primary-fixed-dim: '#ffb4ac'
  on-primary-fixed: '#410002'
  on-primary-fixed-variant: '#93000e'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474646'
  tertiary-fixed: '#e3e2e0'
  tertiary-fixed-dim: '#c7c6c5'
  on-tertiary-fixed: '#1a1c1b'
  on-tertiary-fixed-variant: '#464746'
  background: '#fcf9f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
typography:
  display-lg:
    fontFamily: Anton
    fontSize: 96px
    fontWeight: '400'
    lineHeight: 90px
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Anton
    fontSize: 48px
    fontWeight: '400'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Anton
    fontSize: 32px
    fontWeight: '400'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Anton
    fontSize: 24px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: 0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: '0'
  label-bold:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
  mono-label:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.1em
spacing:
  unit: 4px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
  stack-gap: 12px
---

## Brand & Style
The design system operates at the intersection of high-end editorial print and functional industrial technology. It rejects digital softness in favor of physical metaphors: die-cut panels, heavy ink, and tactile interaction. The aesthetic is "Tech Brutalism"—unapologetic, high-contrast, and structurally rigid. 

The emotional response should be one of immediate clarity and physical presence. Interfaces should feel like a premium printed workbook that has come to life. Motion is mechanical and binary; there are no "fades," only "steps." This design system prioritizes legibility, impact, and a sense of permanence.

## Colors
The palette is rooted in the "Warm Cream" base to reduce eye strain while maintaining a premium, paper-like feel. 

- **Primary Crimson:** Reserved exclusively for high-priority actions and critical feedback.
- **Deep Ink Black:** Used for all structural borders, primary typography, and solid shadows.
- **Track Colors:** Emerald, Violet, and Cobalt are used for categorization and gamification stats. They should always be paired with an Ink Black border to maintain the brutalist aesthetic.
- **Surface Strategy:** Layers are built by stacking Cream surfaces. Contrast is achieved through heavy borders rather than tonal shifts.

## Typography
Typography is the primary driver of the "Editorial" feel. Headlines are massive, aggressive, and tightly kerned to mimic woodblock printing.

- **Headlines:** Always uppercase. Use negative letter spacing for larger sizes to create a dense, "heavy" visual block.
- **Body:** Inter provides a high-legibility counterpoint to the loud headlines. Use Medium (500) weight for primary body text to ensure it holds weight against the heavy borders.
- **Labels:** Small labels and tags should use increased letter spacing to ensure clarity in high-density data views.

## Layout & Spacing
The layout follows a strict 12-column grid for desktop and a 4-column grid for mobile. 

- **Structural Borders:** Every major container must have a minimum 2px solid Black border. 
- **The "Die-Cut" Stack:** Elements do not overlap with transparency. They stack like physical layers of cardstock. 
- **Hard Spacing:** Use 8px increments for vertical rhythm. Gutters are wide (24px) to emphasize the grid's skeletal structure.
- **Padding:** Content should never "touch" the borders; maintain a minimum 16px internal padding for all cards and panels.

## Elevation & Depth
This design system explicitly forbids the use of Gaussian blurs, soft gradients, or ambient shadows. 

- **The Offset Shadow:** Depth is communicated through a solid #111111 offset. The default shadow is `6px 6px 0px 0px #111111`.
- **Z-Axis Hierarchy:** Higher elevation is represented by a larger offset (e.g., 10px 10px for modals) rather than a softer shadow.
- **Reverse Elevation (Press):** When an element is active or "pressed," its offset shadow decreases to `2px 2px` or `0px 0px`, and the element physically shifts position on the X/Y axis to simulate a mechanical button being depressed.

## Shapes
The shape language is strictly geometric and "Sharp." 

- **Corners:** Use 0px radius for all primary containers, buttons, and input fields. 
- **Angle Accents:** Occasional 45-degree chamfered corners may be used for "Tags" or "Stickers" to reinforce the die-cut workbook aesthetic.
- **Stickers:** Gamification elements (like badges) may use a "Jagged" or "Burst" border style, but the corners within those paths remain sharp.

## Components
- **Buttons:** Rectangular with 2px Black borders. The "Action" button is Crimson Red. On hover/active, the button shifts +4px down and +4px right while the shadow disappears, simulating a physical press.
- **Sticker Tags:** Small, high-contrast badges used for stats. These should use the Track Colors (Emerald, Violet, Cobalt) with Black text and a 1px border.
- **Input Fields:** White or Cream background with a heavy 2px border. Focus state is indicated by a Crimson Red border and the appearance of the 6px solid shadow.
- **Cards:** Heavy 2px border with a 6px solid offset shadow. Titles within cards should be `label-bold` or `headline-md`.
- **Checkboxes/Radios:** Purely geometric. Checkboxes are squares; Radio buttons are nested squares (not circles) to maintain the brutalist language.
- **Data Panels:** Use "Terminal-style" lists where line items are separated by solid 1px horizontal rules.