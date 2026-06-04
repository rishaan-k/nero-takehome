# nero.fan — Design Specification
> Reverse-engineered from live screenshots + `<head>` tag. Feed this directly into Claude Code.

---

## 1. Aesthetic Direction

**Minimal dark-native product UI.** nero reads as a focused SaaS tool built for creators — not a marketing site. The design language is restraint-forward: very few accent colors, generous negative space, and micro-typography doing most of the visual work. Think "Vercel / Linear meets underground DJ software." The light mode is equally clean but feels softer and slightly warmer.

---

## 2. Color Palette

### Dark Mode (primary)
| Role | Value | Notes |
|---|---|---|
| Background | `#141414` / `#111111` | Near-black, not pure black |
| Surface / Card | `#1c1c1c` – `#222222` | Subtle lift from bg |
| Nav bar bg | `#1e1e1e` with slight border | Pill-shaped, slightly lighter than page bg |
| Border / Divider | `#2e2e2e` – `#333333` | Low-contrast, hairline |
| Text primary | `#f0f0f0` / `#efefef` | Off-white, not pure white |
| Text secondary | `#888888` – `#999999` | Muted labels, captions |
| Text tertiary | `#555555` | Placeholder, disabled |
| Accent green | `#22c55e` (approx) | "LIVE" badge, "watch live" button, skip icons |
| Accent red/error | `#7f1d1d` bg / `#fca5a5` text (dark mode) | Stripe connect warning banner |
| Accent red/error light | `#fff1f2` bg / `#e11d48` text (light mode) | Same banner, light variant |
| Super Skip badge | `#166534` bg / `#86efac` text | Green pill on queue items |
| Skip badge | `#1c1917` bg / `#a8a29e` text | Neutral stone pill |
| Overlay URL field | `#1a1a1a` bg, `#3a3a3a` border | Input-like display box |

### Light Mode
| Role | Value |
|---|---|
| Background | `#f5f5f5` – `#ffffff` |
| Surface | `#ffffff` |
| Nav bar bg | `#eeeeee` / `#e8e8e8` |
| Border | `#e0e0e0` |
| Text primary | `#111111` |
| Text secondary | `#666666` |

### Theme Color
```
meta[name="theme-color"] = #000000
```

---

## 3. Typography

### Font Families
| Family | Source | Usage |
|---|---|---|
| **Aileron** | `fonts.cdnfonts.com/css/aileron` | **Primary UI font** — used for all body, nav, labels, and most headings |
| **DM Sans** | Google Fonts (`wght@400;500;700`) | Secondary / alternative body weight |
| **Source Serif 4** | Google Fonts (`ital,opsz,wght@0..1,8..60,400..500`) | Editorial / display contexts (likely landing page headings) |

### Scale (inferred from screenshots)

| Element | Font | Size | Weight | Notes |
|---|---|---|---|---|
| Logo wordmark "nero" | Aileron | ~18px | 500 | Inline with flame icon |
| Page H1 (username) | Aileron | ~28–32px | 400–500 | `rishaan` on profile page |
| Session title | Aileron | ~16px | 500 | "Music Review Twayne" |
| Nav links | Aileron | ~13px | 400 | "View streams →" |
| Body / labels | Aileron | ~13–14px | 400 | Queue artist names, descriptions |
| Song title | Aileron | ~14px | 500 | "Words are just words" |
| Artist/submitter | Aileron | ~12px | 400 | "NorthernFlanker" — muted color |
| Badge text | Aileron | ~10–11px | 600 | "SUPER SKIP", "SKIP", "LIVE" — all caps or small caps |
| Caption / meta | Aileron | ~11–12px | 400 | "106 in queue", overlay instructions |
| Button text | Aileron | ~13–14px | 500 | "submit", "watch live", "set up →" |
| Modal title | Aileron | ~16px | 600 | "Overlays" |
| URL input | Aileron / monospace fallback | ~12px | 400 | Overlay URL display |

### Line Height
- Body text: `1.4–1.5`
- Labels and badges: `1`
- Headings: `1.2`

---

## 4. Spacing System

nero uses a **base-4 / base-8 grid** with consistent multiples:

| Token | Value | Use |
|---|---|---|
| `xs` | 4px | Icon gaps, badge internal padding |
| `sm` | 8px | Tight label stacks, list item internal padding |
| `md` | 12px | Component inner padding (cards, input fields) |
| `lg` | 16px | Standard card padding, section padding |
| `xl` | 24px | Between sections, modal padding |
| `2xl` | 32px | Page-level breathing room |
| `3xl` | 48px | Top-level vertical rhythm |

### Layout
- Content is **center-constrained** — max-width appears ~`760px` on desktop (the dashboard card + overlays modal both live in this band)
- Nav bar is a **floating pill** horizontally centered, full-width up to a max, with ~`24px` horizontal padding inside
- Cards have `16px` internal padding
- Queue items use `12–16px` vertical padding, `16px` horizontal
- Modal max-width: ~`540px`, centered

---

## 5. Component Inventory

### Nav Bar
- **Shape**: Pill / stadium (full border-radius, `border-radius: 9999px`)
- **Background**: `#1e1e1e` dark / `#e8e8e8` light
- **Height**: ~`52px`
- **Content**: search icon left → LIVE badge + "View streams →" → logo center → hamburger right
- **LIVE badge**: `#22c55e` text, no background fill in dark; small green dot or text label
- **No box shadow** visible; relies on bg contrast

### Buttons

| Variant | Shape | BG | Text | Notes |
|---|---|---|---|---|
| Primary (submit) | Pill (`border-radius: 9999px`) | `#ffffff` (light on dark bg) | `#111111` | ~`44px` tall, ~`120px` wide |
| Watch Live | Pill | `#16a34a` (green) | `#ffffff` | Has green dot icon prefix |
| Ghost / Outline | Rounded rect or pill, dashed border | Transparent | Muted white | "create your first session +" — dashed `border: 1.5px dashed #444` |
| CTA text link | Inline | None | `#e11d48` or muted | "set up →" in error banner |
| Tab / Segment | Rounded pill segment | Active: `#2a2a2a` | Active: white; Inactive: `#666` | Queue / Now Playing / Alerts / Bracket tabs in Overlays modal |
| Icon button | Square, no visible border | Transparent | Icon color `#888` | Toolbar icons on profile page |

### Cards / Panels
- **Queue item card**: `border-radius: 12px`, bg `#1e1e1e` dark / `#f5f5f5` light, `1px solid #2e2e2e` border, `12–16px` padding
- **Now Playing card**: same style but visually elevated — playing indicator (animated bars icon)
- **Session card**: same card shell, dashed outline variant for empty state
- **Modal / Dialog**: `border-radius: 16px`, bg `#191919`, padding `24px`, has close `×` button top-right

### Badges / Pills
- Small pill shape (`border-radius: 9999px`)
- `padding: 2px 8px`
- Font: ~`10px`, `font-weight: 600`, all-caps or title case
- Variants: Green (SUPER SKIP), Stone/gray (SKIP), Green text on dark (LIVE)

### Warning / Error Banner
- Full width within content area
- `border-radius: 12px`
- Dark mode: `bg: rgba(127,29,29,0.4)`, `border: 1px solid #7f1d1d`, text `#fca5a5`
- Light mode: `bg: #fff1f2`, `border: 1px solid #fecdd3`, text `#be123c`
- Icon: `ⓘ` circle left, action link right

### Forms / Inputs
- Text input: `border-radius: 8px`, `bg: #1a1a1a`, `border: 1px solid #3a3a3a`, `padding: 10px 14px`
- URL display (read-only): same, with copy icon button on right (`border-radius: 8px`)
- Search input: inside nav pill, borderless, placeholder text

### Overlay Tab Bar (segmented control)
- Container: `border-radius: 9999px`, `bg: #111`
- Active tab: `border-radius: 9999px`, `bg: #2a2a2a`, transitions smoothly
- Gap between: `4px`

### Avatar
- Circle crop (`border-radius: 50%`)
- Size: ~`64px` on profile page, ~`48px` on session card
- Has a subtle `2px` border in some contexts

### Icons
- Style: **outline/stroke**, 1.5px stroke weight, rounded line-caps — consistent with Lucide or similar
- Size: `18–20px` for toolbar, `16px` inline

---

## 6. Border Radius

| Context | Value |
|---|---|
| Pill / nav / buttons | `9999px` |
| Modal / large card | `16px` |
| Card / queue item | `12px` |
| Input fields | `8px` |
| Badge | `9999px` |
| Avatar | `50%` |
| Tab bar container | `9999px` |
| Small utility chip | `6px` |

---

## 7. Shadow Styles

Nero uses **almost no shadows** — depth is created through background color layering (darker bg → slightly lighter card surface). The only visible shadow context:

- Modal overlay: `box-shadow: 0 24px 48px rgba(0,0,0,0.6)` (inferred — heavy backdrop)
- Scrim / overlay backdrop: `background: rgba(0,0,0,0.6)` behind modal
- Nav pill: no visible drop shadow; relies on bg contrast

**No card shadows.** Flat surfaces with border delineation only.

---

## 8. Motion / Animation

- **Theme toggle button** (bottom-left sun/moon icon): present in all views — implies animated color scheme transitions, likely `transition: background 0.2s, color 0.2s` on `:root`
- **Now Playing bars animation**: animated equalizer bars icon on currently-playing queue item (CSS keyframe `@keyframes bar-bounce` style)
- **Tab switcher**: smooth background pill slide (likely CSS transition on the active indicator)
- **Toast notifications**: Sonner toast library used (`[data-sonner-toaster]`) — slide + fade animations, `transition: transform .4s, opacity .4s`
- **General transitions**: `0.2s ease` for hover states, `0.4s` for larger state changes
- **No page-level transitions** visible; feels like SPA with instant route changes

---

## 9. Iconography

- **Logo**: flame/droplet SVG + wordmark "nero" in Aileron
- **Toolbar icons on profile**: overlay/monitor icon, image-add icon, share/export icon — all outline style
- **Nav**: search (magnifier), hamburger (three lines)
- **Queue**: lightning bolt `⚡` for skip tiers, play bars for now-playing
- **Overlay**: monitor with play icon
- **Copy**: clipboard icon

Icon system is consistent with **Lucide Icons** or a close equivalent (outline, 1.5px stroke, 24px viewBox).

---

## 10. Dark / Light Mode

Both modes are fully supported via a toggle (bottom-left corner, persisted). The switch is **not** system-preference-only — it's a manual toggle.

CSS architecture: likely uses `[data-theme="dark"]` or `.dark` class on `<html>` with CSS custom properties for all color tokens.

---

## 11. Key CSS Variable Suggestions

```css
:root {
  /* Colors */
  --bg: #141414;
  --bg-surface: #1c1c1c;
  --bg-elevated: #222222;
  --border: #2e2e2e;
  --text-primary: #f0f0f0;
  --text-secondary: #888888;
  --text-tertiary: #555555;
  --accent-green: #22c55e;
  --accent-green-bg: #166534;
  --accent-red: #e11d48;
  --accent-red-bg: rgba(127,29,29,0.4);

  /* Typography */
  --font-sans: 'Aileron', 'DM Sans', sans-serif;
  --font-serif: 'Source Serif 4', Georgia, serif;

  /* Radii */
  --radius-pill: 9999px;
  --radius-lg: 16px;
  --radius-md: 12px;
  --radius-sm: 8px;
  --radius-xs: 6px;

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;

  /* Layout */
  --content-width: 760px;
  --nav-height: 52px;
}

[data-theme="light"] {
  --bg: #f5f5f5;
  --bg-surface: #ffffff;
  --bg-elevated: #eeeeee;
  --border: #e0e0e0;
  --text-primary: #111111;
  --text-secondary: #666666;
  --text-tertiary: #aaaaaa;
}
```

---

## 12. Font Import

```html
<link href="https://fonts.cdnfonts.com/css/aileron" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,500;1,8..60,400;1,8..60,500&display=swap" rel="stylesheet">
```

---

## 13. Summary for Claude Code

When building a new tool in the nero design language:

1. **Dark-first**, near-black backgrounds with layered surfaces — no shadows, just bg-color depth
2. **Aileron** as the primary font; clean, slightly geometric sans
3. **Pill shapes** for nav, buttons, and badges — everything is either a pill or has 12–16px radius
4. **No decorative elements** — no gradients, no illustrations, no textures; minimalism is the texture
5. **Green accent** (`#22c55e`) is the only real color; use it sparingly for live states, CTAs, and positive status
6. **Red/pink** for errors/warnings only — never decorative
7. **Center-constrained layout**, max ~760px, generous whitespace around content
8. **Dashed borders** for empty states / "create new" affordances
9. Typography does heavy lifting — size and weight contrast replaces color contrast
10. **Sonner** for toasts, subtle `0.2–0.4s ease` transitions everywhere
