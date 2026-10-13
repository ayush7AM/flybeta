# FLYBETA — DESIGN SYSTEM (TACTILE NEO-BRUTALISM)

## 1. VISUAL IDENTITY
- **Aesthetic:** Neo-Brutalism / Retro-Tech / Blueprint. Physical, stamped, high-contrast, and editorial.
- **Vibe:** "Builder / Maker" energy. No glassmorphism, no blurs, no soft translucent glows.
- **Canvas (Background):** Off-white/cream paper texture (`bg-[#F9F8F6]`) with a repeating crisp engineering/blueprint grid pattern.
- **Typography:** 
  - Headings/Buttons: Blocky, heavy sans-serif (`Impact`, `Anton`, or `Inter Black`).
  - Body: Clean `Inter` or `Helvetica`. 
  - Text Color: Deep ink black (`text-[#111111]`).

## 2. COMPONENT ELEVATION (Physical Layers)
- **Cards/Containers:** Solid fill colors (pure white `bg-white` or theme accents). 
- **Borders:** Thick, aggressive black borders on all interactive elements (`border-4 border-[#111111]`).
- **Shadows:** Solid, hard offset shadows (`shadow-[6px_6px_0px_#111111]`). Never use blurred drop-shadows.
- **Hover/Active States (Micro-interactions):** Elements simulate physical pressing by translating down and right, absorbing the shadow (`active:translate-x-[6px] active:translate-y-[6px] active:shadow-none transition-all`).

## 3. COLOR TOKENS
- **Base / Ink:** Deep Black (`#111111`).
- **Primary Action (Global):** Vivid Crimson Red (`#E52E2E`) for main CTAs, launch buttons, and high-stakes UI.
- **Track Accents:**
  - Data Science: Construction Emerald/Forest Green (`#059669`).
  - AI & ML: Deep Violet (`#6D28D9`).
  - Cloud Computing: Cobalt Blue (`#2563EB`).
- **Vision Suite Tokens:**
  - Oracle Accent: Vibrant Violet (`#7C3AED`).
  - Synapse UI: High-contrast ink border with white/cream backgrounds, accented by Violet/Emerald for correct/incorrect interaction states.
- **Gamification Tokens:**
  - Coins/Badges: Industrial Gold/Yellow (`#EAB308`).
  - Streaks: Flame Orange (`#EA580C`).

## 4. UI ELEMENTS
- **Buttons:** Look like satisfying physical arcade switches or industrial E-STOP buttons.
- **Gamification Header:** Stats look like physical die-cut stickers or stamped labels resting on a thick top bar.
- **Content:** Images/Icons should be tactile 3D renders (e.g., mechanical keyboards, servers, industrial machinery) placed within heavy-bordered boxes.

## 5. ASSET OPTIMIZATION & PERFORMANCE
- **Grid Backgrounds:** Use pure CSS (`linear-gradient`) rather than repeating raster images for the blueprint grids.
- **Theme Assets:** All heavy raster characters and backgrounds are compressed to `.webp` format at ~80% quality. (e.g., 56MB of PNGs compressed to 4.9MB of WebP).
- **EXIF Orientation:** When converting user or stock JPEGs to WebP, ensure EXIF orientation data is baked into the pixel array (e.g., using Pillow's `ImageOps.exif_transpose`), as WebP may strip this metadata, causing sideways rendering.