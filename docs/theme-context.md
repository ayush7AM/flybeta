# FlyBeta Theme System — Developer Blueprint

> This document defines the standard for adding and integrating visual themes into FlyBeta.
> All themes follow a consistent pattern: CSS custom properties for colors, image assets for
> domain cards, and an optional full-page background with a legibility overlay.

---

## 1. Asset Directory Standard

Every theme must store its assets in a dedicated folder inside `frontend/public/`:

```
frontend/public/
├── doremon-theme/            ← Doraemon Blue theme assets
│   ├── doremon.png           ← Cloud domain character
│   ├── sizuka.png            ← AI domain character
│   ├── suniyo.png            ← Data Science domain character
│   └── doremon_flybeta.png   ← Full-page background image
├── shinchan-theme/           ← (future) Shinchan theme
│   ├── cloud.png
│   ├── ai.png
│   ├── data.png
│   └── shinchan_bg.png
└── one-piece-theme/          ← (future) One Piece theme
    ├── cloud.png
    ├── ai.png
    ├── data.png
    └── onepiece_bg.png
```

**Naming convention for the folder:** `[theme-name]-theme/`

---

## 2. Domain Image Naming Conventions

Each theme can either:

### Option A: Use standard domain filenames
Name your images exactly `cloud.png`, `ai.png`, and `data.png` to match the database domain names directly.

### Option B: Use custom character filenames with a code mapping
If using character images (like Doraemon), create a mapping object in `TrackCard.jsx`:

```js
const DORAEMON_IMAGES = {
  'cloud': '/doremon-theme/doremon.png',
  'ai':    '/doremon-theme/sizuka.png',
  'data':  '/doremon-theme/suniyo.png',
};
```

The keys **must** match the `domain.name` values from the backend database: `cloud`, `ai`, `data`.

---

## 3. Background Image Strategy

### Full-Page Background
When a theme provides a global background image (e.g., `doremon_flybeta.png`), it is applied
to the root layout wrapper in `Layout.jsx` with these CSS properties:

```css
background-image: url('/[theme]-theme/background.png');
background-size: cover;
background-position: center;
background-attachment: fixed;
```

### Critical: Legibility Overlay
Every theme background **must** include a cream-colored overlay to preserve Neo-Brutalist text contrast:

```jsx
<div
  className="fixed inset-0"
  style={{ background: '#F9F8F6', opacity: 0.9, zIndex: 0 }}
/>
```

| Property | Value | Rationale |
|----------|-------|-----------|
| Color | `#F9F8F6` | Matches `--color-canvas` in the Neo-Brutalism base theme |
| Opacity | `0.9` (90%) | Keeps the background subtly visible while ensuring WCAG AA text contrast |
| Position | `fixed inset-0` | Covers the full viewport, stays fixed during scroll |
| z-index | `0` | All app content uses `z-10` to sit above the overlay |

---

## 4. Component Integration

### TrackCard.jsx
Located at: `frontend/src/components/TrackCard.jsx`

```jsx
const { themeKey } = useTheme();
const isDoraemon = themeKey === 'doraemon-blue';
const characterImg = DORAEMON_IMAGES[domain.name];

// In the header section:
{isDoraemon && characterImg ? (
  <img src={characterImg} alt="..." className="h-48 w-full object-contain ..." />
) : (
  <IconComponent size={72} ... />
)}
```

**Pattern for future themes:**
```jsx
const THEME_IMAGES = {
  'doraemon-blue': { 'cloud': '/doremon-theme/doremon.png', ... },
  'shinchan':      { 'cloud': '/shinchan-theme/shinchan.png', ... },
};

const images = THEME_IMAGES[themeKey];
const characterImg = images?.[domain.name];
```

### Layout.jsx
Located at: `frontend/src/components/layout/Layout.jsx`

```jsx
const { themeKey } = useTheme();
const isDoraemon = themeKey === 'doraemon-blue';

// Root div: conditionally apply background image
// Overlay div: conditionally rendered inside root
// Content div: always relative z-10
```

---

## 5. Adding a New Theme — Checklist

### Step 1: Register the theme in `ThemeContext.jsx`
Add a new entry to the `THEMES` object with CSS custom property overrides:

```js
'shinchan': {
  label: 'Shinchan',
  icon: '🖍️',
  vars: {
    '--color-primary': '#FF6B35',
    '--color-primary-dark': '#E55A2B',
    '--color-ink': '#2D1B00',
    '--color-canvas': '#FFF8F0',
    // ... other overrides
  },
},
```

### Step 2: Add assets to `/public/[theme-name]-theme/`
- Domain character/icon images (3 files minimum)
- Background image (optional, but recommended)

### Step 3: Add image mapping in `TrackCard.jsx`
Add your theme to the image resolution logic.

### Step 4: Add layout conditional in `Layout.jsx`
If your theme has a background image, add its condition alongside the Doraemon check.
Consider refactoring into a config map:

```js
const THEME_BACKGROUNDS = {
  'doraemon-blue': '/doremon-theme/doremon_flybeta.png',
  'shinchan':      '/shinchan-theme/shinchan_bg.png',
};
```

### Step 5: Test the toggle
- Switch between all themes using the navbar toggle
- Verify TrackCard images swap correctly
- Verify background + overlay appears/disappears
- Verify all text remains legible (especially headings and buttons)

---

## 6. Current Theme Registry

| Theme Key | Label | Primary Color | Background Image | Status |
|-----------|-------|--------------|-----------------|--------|
| `neo-brutalism` | Neo-Brutalism | `#E52E2E` (Red) | None (grid-bg) | ✅ Active |
| `doraemon-blue` | Doraemon Blue | `#3182ce` (Blue) | `doremon_flybeta.png` | ✅ Active |
