---
name: Bounty Poster Neo-Brutalism
colors:
  surface: '#fff8f5'
  surface-dim: '#e0d8d5'
  surface-bright: '#fff8f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#faf2ee'
  surface-container: '#f4ece8'
  surface-container-high: '#eee7e3'
  surface-container-highest: '#e9e1dd'
  on-surface: '#1e1b19'
  on-surface-variant: '#5b403d'
  inverse-surface: '#33302d'
  inverse-on-surface: '#f7efeb'
  outline: '#8f6f6c'
  outline-variant: '#e4beb9'
  surface-tint: '#b91c1c'
  primary: '#93000b'
  on-primary: '#ffffff'
  primary-container: '#b91c1c'
  on-primary-container: '#ffcdc7'
  inverse-primary: '#ffb4ab'
  secondary: '#006399'
  on-secondary: '#ffffff'
  secondary-container: '#7bc2ff'
  on-secondary-container: '#004f7b'
  tertiary: '#5a4300'
  on-tertiary: '#ffffff'
  tertiary-container: '#775a00'
  on-tertiary-container: '#ffd36c'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad6'
  primary-fixed-dim: '#ffb4ab'
  on-primary-fixed: '#410002'
  on-primary-fixed-variant: '#93000b'
  secondary-fixed: '#cde5ff'
  secondary-fixed-dim: '#94ccff'
  on-secondary-fixed: '#001d32'
  on-secondary-fixed-variant: '#004b74'
  tertiary-fixed: '#ffdf9a'
  tertiary-fixed-dim: '#f7be1d'
  on-tertiary-fixed: '#251a00'
  on-tertiary-fixed-variant: '#5a4300'
  background: '#fff8f5'
  on-background: '#1e1b19'
  surface-variant: '#e9e1dd'
typography:
  display-lg:
    fontFamily: Anton
    fontSize: 84px
    fontWeight: '400'
    lineHeight: 90px
    letterSpacing: 0.02em
  headline-lg:
    fontFamily: Anton
    fontSize: 48px
    fontWeight: '400'
    lineHeight: 52px
    letterSpacing: 0.01em
  headline-lg-mobile:
    fontFamily: Anton
    fontSize: 32px
    fontWeight: '400'
    lineHeight: 36px
  headline-md:
    fontFamily: Anton
    fontSize: 32px
    fontWeight: '400'
    lineHeight: 38px
  body-lg:
    fontFamily: Chivo
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-md:
    fontFamily: Chivo
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-caps:
    fontFamily: Space Grotesk
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 16px
spacing:
  base: 8px
  border-thick: 4px
  border-heavy: 8px
  shadow-offset: 6px
  gutter: 24px
  margin-page: 40px
---

## Brand & Style
This design system embodies a rugged, nautical adventure aesthetic through the lens of Neo-Brutalism. The brand personality is bold, authoritative, and tactile, mimicking the physical presence of a high-seas bounty hunter's office. It rejects modern digital softness—blurs, gradients, and transparency are replaced by raw textures, hard lines, and high-contrast ink.

The UI evokes the feeling of "Wanted" posters nailed to wooden docks. It uses a physical metaphor where every element has weight and permanence. The target audience is learners who crave an immersive, gamified experience that feels like a tangible quest rather than a clinical software application.

## Colors
The palette is rooted in a weathered, historical atmosphere.
- **Background**: A warm, parchment-toned tan (#FDE68A) serves as the "paper." It should be overlaid with a subtle, low-opacity repeating pattern of a nautical compass or map grid.
- **Primary (Pirate Crimson)**: Used for high-stakes actions, errors, and "Danger" zones.
- **Secondary (Ocean Blue)**: Used for navigation, links, and informational progression.
- **Tertiary (Treasure Gold)**: Reserved for achievements, rewards, and highlights.
- **Neutral (Deep Ink)**: The foundational color for all borders, shadows, and body text. It must feel like heavy, dry ink.

## Typography
The typography is designed to command attention. Headlines use **Anton** (a bold, condensed stand-in for the "Wanted" aesthetic) to maximize impact and horizontal space efficiency. 

Body text uses **Chivo**, a high-legibility grotesque that maintains a rugged, utilitarian feel. Labels and technical metadata use **Space Grotesk** to inject a slightly "navigational instrument" vibe. All headlines should ideally be presented in uppercase to reinforce the brutalist, urgent nature of a bounty poster.

## Layout & Spacing
The layout follows a strict, non-fluid grid that mimics physical planks and posters. Elements are locked to an 8px rhythmic grid. 

- **Grid**: A 12-column layout for desktop with wide 24px gutters. Elements should not "float"; they should feel heavy and anchored.
- **Margins**: Generous page margins (40px+) to allow the parchment background pattern to frame the content.
- **Mobile**: On mobile, the 12 columns collapse to 4, and the hard shadows are reduced slightly (to 4px) to save horizontal screen real estate while maintaining the brutalist aesthetic.

## Elevation & Depth
This system completely ignores Z-axis lighting and blurs. Depth is communicated through **Hard Solid Shadows**:
- All primary containers (cards, buttons) must have a solid #1C1917 shadow offset to the bottom-right.
- The shadow is not a blur; it is a solid block of color that creates a 2.5D "pop-out" effect.
- **Active State**: When a button is pressed, the shadow offset should decrease to 0px, and the element should translate X and Y to "sink" into the page.
- **Borders**: Every interactive or container element must have a minimum 4px solid border in Deep Ink.

## Shapes
Sharp corners only. In keeping with the Neo-Brutalist and rugged theme, there are no rounded corners in this design system. Rectangles represent the cut edges of paper and the straight saw-lines of wooden planks.

- **Exceptions**: Perfect circles may be used exclusively for "Coin" icons (Treasure Gold) or "Compass" indicators to provide a visual break from the rigid rectangular grid.

## Components
- **Bounty Cards**: The primary container. Features a thick 8px border, a 6px solid shadow, and a "Header" section separated by a horizontal rule. The background is a slightly lighter shade than the parchment base to make it "pop."
- **Action Buttons**: Solid Pirate Crimson background with white Anton text. 4px solid border. When hovered, the button should shift its shadow color to Treasure Gold.
- **Progress Bars**: Styled as "Treasure Maps." A thick border container where the progress is filled with Ocean Blue. Use a "X marks the spot" icon as the progress indicator head.
- **Checkboxes**: Large 32px square boxes. When checked, they are filled with a solid Deep Ink "X" that looks hand-drawn.
- **Input Fields**: Thick-bordered rectangles with a subtle internal "grid" line pattern. Focus state changes the border from Deep Ink to Ocean Blue.
- **Nautical Chips**: Small, high-contrast labels used for tagging "Difficulties" (e.g., "Easy" = Gold, "Legendary" = Crimson).
- **Navigation**: Side-mounted or top-mounted "Plank" navigation, where each link is a full-width block with a hard bottom-border.