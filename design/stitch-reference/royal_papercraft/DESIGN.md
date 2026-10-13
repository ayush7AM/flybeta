---
name: Royal Papercraft
colors:
  surface: '#fff7f9'
  surface-dim: '#e9d4e0'
  surface-bright: '#fff7f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#ffeff7'
  surface-container: '#fde8f4'
  surface-container-high: '#f7e3ee'
  surface-container-highest: '#f1dde9'
  on-surface: '#231820'
  on-surface-variant: '#5b4041'
  inverse-surface: '#392d36'
  inverse-on-surface: '#ffebf6'
  outline: '#8f6f71'
  outline-variant: '#e3bdbf'
  surface-tint: '#bc0b3b'
  primary: '#b90538'
  on-primary: '#ffffff'
  primary-container: '#dc2c4f'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb2b7'
  secondary: '#904d00'
  on-secondary: '#ffffff'
  secondary-container: '#fe932c'
  on-secondary-container: '#663500'
  tertiary: '#8e3891'
  on-tertiary: '#ffffff'
  tertiary-container: '#ab52ac'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdadb'
  primary-fixed-dim: '#ffb2b7'
  on-primary-fixed: '#40000d'
  on-primary-fixed-variant: '#92002a'
  secondary-fixed: '#ffdcc3'
  secondary-fixed-dim: '#ffb77d'
  on-secondary-fixed: '#2f1500'
  on-secondary-fixed-variant: '#6e3900'
  tertiary-fixed: '#ffd6f9'
  tertiary-fixed-dim: '#ffa9fb'
  on-tertiary-fixed: '#37003b'
  on-tertiary-fixed-variant: '#75207a'
  background: '#fff7f9'
  on-background: '#231820'
  surface-variant: '#f1dde9'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 56px
    fontWeight: '900'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 36px
    fontWeight: '900'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '800'
    lineHeight: '1.2'
  title-lg:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-bold:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: 0.05em
spacing:
  unit: 4px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
  offset-shadow: 6px
  border-width: 3px
---

## Brand & Style
The design system establishes a high-contrast, tactile aesthetic that merges the precision of neo-brutalism with the luxury of royal stationery. The visual narrative is built around the concept of "physicality without realism"—utilizing flat shapes to represent heavy cardstock layers.

The personality is authoritative yet playful, evoking the feeling of an expensive, die-cut pop-up book. The UI rejects digital softness (no blurs, no gradients, no glows) in favor of sharp lines, solid shadows, and a rigid geometric structure. The target audience values exclusivity and a bold, non-conformist digital experience.

## Colors
The palette is rooted in a "matte paper" base of soft blush pink (#FCE7F3). Surface elements use pure white to simulate thick cardstock. 

- **Primary (Rose Pink):** Reserved for high-energy call-to-actions and interactive highlights.
- **Secondary (Royal Gold):** Used for rewards, premium features, and secondary emphasis.
- **Stroke/Text (Deep Plum):** All borders, text, and structural lines must use this color to maintain the "ink on paper" feel.
- **Shadow:** Solid #701A75 at 100% opacity. Never use semi-transparent blacks or greys.

## Typography
The system employs a dramatic contrast between the authoritative, high-contrast Serif (Playfair Display) and the technical clarity of a modern Grotesk (Hanken Grotesk).

Headlines should be treated as "editorial" elements—tightly kerned and heavy. Body copy remains clean and airy to balance the visual weight of the heavy borders elsewhere in the design. Labels and metadata should always use the Sans font in bold uppercase to reinforce the structured, "labeled" feel of a physical archive.

## Layout & Spacing
The layout follows a strict 12-column grid. A subtle, non-scrolling diamond grid pattern should be applied to the background (#FCE7F3) to provide a canvas-like texture.

All spacing is based on a 4px baseline. Components are separated by generous gutters to allow the "shadows" enough room to breathe without overlapping adjacent elements. On mobile, the 6px offset shadow remains constant to maintain the physical depth, though the container padding may tighten.

## Elevation & Depth
Depth is created through "Die-Cut Neo-Brutalism." Instead of light sources and blurs, elevation is defined by thickness and stacking.

- **Level 0 (Background):** The Blush Pink base with diamond grid.
- **Level 1 (Panels):** White cardstock with a 3px Deep Plum border and a solid 6px shadow offset to the bottom-right (6px 6px 0px 0px #701A75).
- **Interactive State:** When an element is pressed or hovered, the shadow offset should decrease to 2px, simulating the physical "pressing" of paper against the surface.
- **Layers:** Use overlapping cardstock panels to group related information, ensuring every layer has a distinct Plum border.

## Shapes
The shape language is strictly sharp and geometric. Every corner must be 90 degrees to reinforce the "die-cut" paper aesthetic. There are no exceptions for buttons, inputs, or cards. This sharpness provides the necessary contrast to the "soft" pink background color.

## Components
- **Buttons:** Large, sharp rectangles with 3px Deep Plum borders. Primary buttons use a Rose Pink fill; secondary buttons use Royal Gold. On hover, the 6px shadow "shrinks" as the button moves 4px down and right.
- **Cards:** White background, Plum border, 6px offset shadow. Headers within cards should be separated by a 3px Plum horizontal rule.
- **Inputs:** White background with a 3px Plum border. When focused, the border remains plum, but a 4px internal margin "Royal Gold" frame appears inside the border.
- **Chips/Tags:** Small rectangles with Plum borders. Use Rose Pink for active states and White for inactive states.
- **Checkboxes:** Sharp squares. When checked, they fill with Deep Plum and show a white "X" rather than a soft checkmark, maintaining the brutalist feel.
- **Lists:** Items are separated by heavy 3px horizontal lines. Hovering a list item changes its background to a very light tint of Royal Gold.