---
name: Action Kinder-Brut
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
  on-surface-variant: '#5c3f40'
  inverse-surface: '#313030'
  inverse-on-surface: '#f3f0ef'
  outline: '#906f70'
  outline-variant: '#e5bdbe'
  surface-tint: '#be0037'
  primary: '#b80035'
  on-primary: '#ffffff'
  primary-container: '#e11d48'
  on-primary-container: '#fffaf9'
  inverse-primary: '#ffb3b6'
  secondary: '#0058be'
  on-secondary: '#ffffff'
  secondary-container: '#2170e4'
  on-secondary-container: '#fefcff'
  tertiary: '#735c00'
  on-tertiary: '#ffffff'
  tertiary-container: '#cea700'
  on-tertiary-container: '#4e3e00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdada'
  primary-fixed-dim: '#ffb3b6'
  on-primary-fixed: '#40000c'
  on-primary-fixed-variant: '#920028'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#ffe083'
  tertiary-fixed-dim: '#eec200'
  on-tertiary-fixed: '#231b00'
  on-tertiary-fixed-variant: '#574500'
  background: '#fcf9f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
  canvas-paper: '#FEF08A'
  notebook-line: '#60A5FA'
  crayon-red: '#E11D48'
  kinder-blue: '#3B82F6'
typography:
  headline-lg:
    fontFamily: Anton
    fontSize: 64px
    fontWeight: '400'
    lineHeight: 72px
    letterSpacing: 0.02em
  headline-lg-mobile:
    fontFamily: Anton
    fontSize: 40px
    fontWeight: '400'
    lineHeight: 44px
    letterSpacing: 0.02em
  headline-md:
    fontFamily: Anton
    fontSize: 32px
    fontWeight: '400'
    lineHeight: 36px
  body-lg:
    fontFamily: Rubik
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
  body-md:
    fontFamily: Rubik
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
  label-bold:
    fontFamily: Rubik
    fontSize: 14px
    fontWeight: '900'
    lineHeight: 16px
  scribble-caption:
    fontFamily: Rubik
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 14px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
  shadow-offset: 6px
  border-width: 3px
---

## Brand & Style
The design system is a high-energy fusion of Neo-Brutalism and nostalgic kindergarten aesthetics. It captures the chaotic, raw, and physical spirit of a child’s workbook, specifically inspired by the bold world of Action Kamen and Crayon Shin-chan. The target audience is invited into a space that feels tactile, energetic, and unapologetically "unrefined."

The chosen style is **Neo-Brutalism** mixed with **Tactile/Skeuomorphic** elements of paper and crayon. It rejects digital perfection in favor of "marker-drawn" imperfections, heavy borders, and solid block shadows. The emotional response is one of playfulness and urgency—interfaces should feel like they were physically constructed from cardboard, thick paper, and wax crayons. There are no gradients, no blurs, and no subtle transitions; every interaction is loud, binary, and mechanical.

## Colors
The palette is driven by the primary colors of a classic toy box, grounded by a warm, textured notebook yellow.

- **Action Kamen Red (Primary):** Used for primary action buttons, destructive states, and "scribbled" highlights.
- **Kindergarten Blue (Secondary):** Used for secondary actions, navigational elements, and the horizontal "ruled lines" of the paper canvas.
- **Sun Yellow (Tertiary):** Used for celebratory accents and warnings.
- **Charcoal Black (Neutral):** The structural backbone. Used for all text, heavy borders, and hard shadows.
- **Base Canvas:** The background is always `#FEF08A`, mimicking bright yellow notebook paper. It should be overlaid with 1px blue horizontal lines (`#60A5FA`) spaced at regular intervals to reinforce the workbook theme.

## Typography
The typography is heavy, loud, and impactful, mimicking the thick strokes of a marker.

- **Headlines:** Use **Anton** for all display and headline text. Its condensed, heavy nature feels like printed propaganda or a bold comic book.
- **Body & Labels:** Use **Rubik**. Its rounded corners complement the "childhood" theme while maintaining excellent legibility. Use heavier weights (500-900) by default to stand up against the aggressive borders.
- **Visual Rhythm:** Headlines should have a slight rotation (1-2 degrees) occasionally to simulate hand-stamping or messy placement.

## Layout & Spacing
The layout follows a **Fixed Grid** philosophy that feels like a physical page.

- **Grid Model:** A 12-column system on desktop with generous 24px gutters. Elements should align strictly to the "ruled lines" of the background where possible.
- **The "Marker" Border:** Every container, button, and input field must have a `3px` solid Charcoal Black border. The border should have a slightly irregular "roughened" SVG filter applied if possible to simulate a hand-drawn marker stroke.
- **Vertical Rhythm:** Spacing is strictly based on 8px increments. Content should be "chunked" into clear, bordered blocks rather than floating freely.

## Elevation & Depth
Depth is entirely 2D and physical. There are no Z-axis blurs or soft lighting.

- **Solid Shadows:** Every floating or interactive element uses a hard, non-transparent Charcoal Black shadow: `6px 6px 0px 0px #111111`.
- **Active States:** When a user interacts with an element (hover/active), the element translates 3px or 6px towards the shadow, effectively "hiding" the shadow to simulate a button being physically pressed into the paper.
- **Layering:** Hierarchy is achieved through stacking. Higher priority items have thicker borders or more aggressive shadow offsets (up to 12px for modals).

## Shapes
The shape language is "Soft-Brutalist." While the layout is rigid, the corners have a slight roundness to mimic the way cardboard or thick paper wears at the edges.

- **Base Corners:** 0.25rem (4px) for all standard cards and buttons.
- **Crayon Scribbles:** Elements like checkboxes, radio selections, and "stars" should use irregular, hand-drawn paths rather than perfect geometric shapes.
- **Oversized Blocks:** Interactive elements should feel chunky and "toy-like" in their proportions.

## Components
- **Buttons:** Large, physical blocks of Action Kamen Red or Kindergarten Blue. They must have a 3px border and 6px hard shadow. The text inside is always uppercase `label-bold`.
- **Checkboxes:** These are styled as thick, messy Red crayon "X" marks or scribbles inside a 3px black-bordered square.
- **Input Fields:** Thick black borders with a white background. On focus, the field's shadow should grow, and the background may shift to a very pale yellow.
- **Cards:** Use a white or light-yellow background with the standard 3px border and 6px shadow. Card headers should be separated by a blue "notebook line."
- **Progress Bars:** Styled as a "crayon filling a box"—the progress should have a textured, scribbled edge rather than a clean vertical line.
- **Lists:** Each item is a separate bordered block with a 4px shadow, stacked vertically with an 8px gap.