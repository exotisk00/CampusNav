---
name: CampusNav Design System
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#594138'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#8d7166'
  outline-variant: '#e1bfb3'
  surface-tint: '#a63b00'
  primary: '#a63b00'
  on-primary: '#ffffff'
  primary-container: '#f26522'
  on-primary-container: '#4f1800'
  inverse-primary: '#ffb599'
  secondary: '#006a61'
  on-secondary: '#ffffff'
  secondary-container: '#86f2e4'
  on-secondary-container: '#006f66'
  tertiary: '#545f73'
  on-tertiary: '#ffffff'
  tertiary-container: '#8691a7'
  on-tertiary-container: '#1f2a3c'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbce'
  primary-fixed-dim: '#ffb599'
  on-primary-fixed: '#370e00'
  on-primary-fixed-variant: '#7f2b00'
  secondary-fixed: '#89f5e7'
  secondary-fixed-dim: '#6bd8cb'
  on-secondary-fixed: '#00201d'
  on-secondary-fixed-variant: '#005049'
  tertiary-fixed: '#d8e3fb'
  tertiary-fixed-dim: '#bcc7de'
  on-tertiary-fixed: '#111c2d'
  on-tertiary-fixed-variant: '#3c475a'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.025em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '800'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.005em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system establishes an institutional yet dynamic visual language engineered for higher education SaaS environments. It balances the rigor, utility, and dependability required by campus administrators with the vibrant, approachable clarity demanded by modern students navigating dense academic landscapes.

The design movement merges **Modern Corporate SaaS** with **Tactile Wayfinding Cues**. The visual tone rejects clinical corporate sterility in favor of high-energy navigational utility: crisp surface framing, high-legibility typographic scannability, elevated map chrome, and distinct color accents that translate directly into directional urgency and spatial confidence.

### Emotional Goals
- **Orientation & Confidence:** Immediate geographical and operational clarity, reducing arrival anxiety for new students and staff.
- **Academic Vitality:** High-contrast warmth and institutional authority through deep slate structures illuminated by an energetic collegiate amber.
- **Dependability:** Utilitarian, predictable interactions across high-stress environments such as finals week schedules, bus route transitions, and event check-ins.

## Colors

The palette leverages a structured light-mode foundation reinforced by dark slate navigation shells. Color acts as an informational beacon: warm amber directs real-time attention and critical focus, teal confirms successful states and secondary utilities, and dense slate anchors foundational hierarchies.

### Color Tokens & Roles

- **Primary Accent (`#F26522`):** Reserved for primary calls-to-action, active wayfinding nodes, destination pins, live step-by-step progress, and high-priority notices.
- **Secondary Action (`#0D9488`):** Applied to transit badges, open/closed facility markers, study space availability metrics, secondary action confirmations, and alternative pathway highlights.
- **Surface Dark / Chrome Neutral (`#0F172A`):** The master canvas tone for navigation bars, sidebar shells, floating map tool headers, and primary text elements.
- **Surface Dark Muted (`#1E293B`):** Supporting dark chrome for segmented controls inside map views, tooltips, dark card elevated containers, and sub-navigation trays.
- **Neutral Canvas & Surfaces:**
  - Background Canvas: `#F8FAFC` (Slate 50)
  - Card & Container Surface: `#FFFFFF` (Pure White)
  - Sub-surface / Inactive Fill: `#F1F5F9` (Slate 100)
  - Border Subtle: `#E2E8F0` (Slate 200)
  - Border Strong: `#CBD5E1` (Slate 300)
- **Atmospheric Tints:**
  - Primary Subtle Fill: `rgba(242, 101, 34, 0.08)` for active tab states and event badge backgrounds.
  - Secondary Subtle Fill: `rgba(13, 148, 136, 0.08)` for amenity tags and live bus tracker pills.

## Typography

Typography pairs the structural warmth and geometric authority of **Plus Jakarta Sans** for headlines with the neutral, hyper-legible performance of **Inter** for dense tabular interfaces, dynamic directories, and interactive wayfinding overlays.

### Typographic Rules
- **Display & Headlines:** Use Plus Jakarta Sans exclusively for page headings, building names, route overviews, and modal headers. Maintain tight letter-spacing to create sturdy anchor points.
- **Body & Labels:** Use Inter for campus directories, schedules, interactive forms, and navigation metrics (e.g., "7 min walk • 0.3 mi").
- **Wayfinding Numbers & Stat Readouts:** Render numerical values (room numbers, transit ETAs, occupancy rates) in semi-bold or bold weights using tabular figures (`font-variant-numeric: tabular-nums`) to prevent layout jitter during live updates.

## Layout & Spacing

The design system operates on an 8pt base grid system (`space-xs` = 4px, `space-sm` = 8px, `space-md` = 16px, `space-lg` = 24px, `space-xl` = 32px), guaranteeing mathematical alignment across desktop administrative portals and mobile field navigation.

### Viewport Architecture
- **Desktop (1024px and up):** 12-column fluid responsive grid with `margin: 2rem` and `gutter: 1.5rem`. Split-screen mode dedicates a fixed 420px left navigation/results panel and a fluid canvas for interactive vector maps or analytical dashboards.
- **Tablet (768px - 1023px):** 8-column layout. The results panel shifts to an expandable side-drawer (360px wide) or top overlay.
- **Mobile (320px - 767px):** 4-column layout with `margin-mobile: 1rem` and `gutter-mobile: 1rem`. Map interfaces adopt full viewport height with anchored bottom sheets that snap between three distinct states: peek (72px), mid-view (40vh for routes/lists), and full expansion (90vh for detailed building directories).

## Elevation & Depth

Visual hierarchy uses a hybrid architecture of crisp structural borders combined with soft, slate-tinted ambient drop shadows. This prevents map layers and complex interactive UI elements from flattening into one another.

### Tonal Tiers & Shadow Specs
- **Level 0 (Base Canvas):** `#F8FAFC`. Zero elevation. Houses background map canvases, foundational layouts, and inert dashboard backdrops.
- **Level 1 (Card & Content Surface):** `#FFFFFF` with border `1px solid #E2E8F0` and shadow `0 1px 3px 0 rgba(15, 23, 42, 0.05)`. Used for directory lists, class schedule items, and profile summaries.
- **Level 2 (Interactive Floating UI & POI Markers):** `#FFFFFF` with border `1px solid #CBD5E1` and shadow `0 4px 12px -2px rgba(15, 23, 42, 0.08), 0 2px 6px -1px rgba(15, 23, 42, 0.04)`. Applied to map search bars, layer switchers, and hover cards.
- **Level 3 (Overlays, Drawers & Bottom Sheets):** `#FFFFFF` (or `#0F172A` for dark modals) with shadow `0 20px 25px -5px rgba(15, 23, 42, 0.12), 0 8px 10px -6px rgba(15, 23, 42, 0.06)`.
- **Level 4 (Toasts & Urgent Navigation Alerts):** Elevated system notices featuring a left accent border (`3px solid #F26522` or `#0D9488`) and heavy ambient shadow `0 25px 50px -12px rgba(15, 23, 42, 0.25)`.

## Shapes

The interface balances soft modern curves with structured enterprise geometry. The system commits to **Level 2 Roundedness** (base 0.5rem / 8px), scaling up to `rounded-xl` (1.5rem / 24px) for primary containers to create a welcoming, student-centric feel without sacrificing data density.

### Shape Hierarchy
- **Base Elements (0.5rem / 8px):** Form inputs, buttons, segmented controls, table containers, and dropdown lists.
- **Medium Panels (`rounded-lg` - 1rem / 16px):** Dialog windows, popover cards, POI detail cards, and campus news modules.
- **Structural Shells (`rounded-xl` - 1.5rem / 24px):** Mobile bottom sheets, floating map toolbars, dashboard metric tiles, and main content cards.
- **Full Rounded (Pill / 9999px):** Status chips, route number pills, transit tags, live notification dots, and quick-filter category selectors.

## Components

### Buttons
- **Primary:** Background `#F26522`, text `#FFFFFF`, font `label-lg`, radius `0.5rem`. Hover: `#D95316`. Active: `#C0440E`. Focus ring: `3px solid rgba(242, 101, 34, 0.35)`.
- **Secondary Action:** Background `#0D9488`, text `#FFFFFF`, font `label-lg`, radius `0.5rem`. Hover: `#0F766E`. Active: `#115E59`.
- **Neutral Outline:** Background `#FFFFFF`, border `1px solid #CBD5E1`, text `#0F172A`. Hover: background `#F1F5F9` with border `#94A3B8`.
- **Ghost Dark (Navigation Chrome):** Background transparent, text `#94A3B8`. Hover: background `rgba(255, 255, 255, 0.08)`, text `#FFFFFF`.

### Chips & Badges
- **Status Badges:** Fixed height 24px, pill-shaped (`border-radius: 9999px`), horizontal padding `0.5rem`, font `label-sm`.
  - Open / Available: Text `#0F766E`, background `rgba(13, 148, 136, 0.12)`.
  - Closing Soon / Warning: Text `#D95316`, background `rgba(242, 101, 34, 0.12)`.
  - Closed / Inactive: Text `#64748B`, background `#F1F5F9`.
- **Interactive Filter Chips:** Radius `9999px`, border `1px solid #E2E8F0`, background `#FFFFFF`, text `#0F172A`. Selected state: background `#0F172A`, text `#FFFFFF`, border `#0F172A`.

### Navigation Tabs
- **Segmented Control:** Contained in `#F1F5F9` track with 4px inner padding. Active tab has `#FFFFFF` background, subtle elevation `0 1px 3px rgba(15, 23, 42, 0.08)`, text `#0F172A` (`title-md`). Inactive tabs use text `#64748B`.
- **Underline Tabs:** Border-bottom `2px solid transparent`. Active state uses `border-color: #F26522`, text `#F26522` (`title-md`).

### Form Controls & Search Inputs
- **Search Bar (Wayfinding Engine):** Height 48px, background `#FFFFFF`, border `1px solid #CBD5E1`, radius `0.5rem`, shadow Level 2. Prepend search icon in `#64748B`. Focused state: border `#F26522`, ring `3px rgba(242, 101, 34, 0.2)`.
- **Text Inputs:** Height 40px, background `#FFFFFF`, border `1px solid #CBD5E1`, radius `0.5rem`, padding `0 0.75rem`, font `body-md`. Error state: border `#EF4444`, ring `3px rgba(239, 68, 68, 0.15)`.
- **Checkboxes & Radios:** 18px size. Unchecked: border `1.5px solid #94A3B8`. Checked: background `#F26522` or `#0D9488`, border-color matches fill, with clean white interior tick/dot.

### Cards & Container Panels
- **Standard Card:** Radius `rounded-xl` (24px), background `#FFFFFF`, border `1px solid #E2E8F0`, padding `1.5rem`, shadow Level 1.
- **Interactive Facility Card:** Radius `rounded-xl`, includes a top image or mini-map canvas, live occupancy progress bar (teal for `<70%`, amber for `>70%`), step-by-step CTA button, and accessible keyboard focus outline.

### Wayfinding Map UI Elements
- **Map Pin / Marker:** Teardrop anchor shape, background `#F26522` with a `#FFFFFF` center icon (or dark slate `#0F172A` with amber icon). Hover scales `1.1x` with transition `transform 150ms cubic-bezier(0.4, 0, 0.2, 1)`.
- **Turn-by-Turn Card:** Sticky header card resting at the top of the mobile viewport. Background `#0F172A`, text `#FFFFFF`, icon accent `#F26522`, border-radius `0.75rem`, shadow Level 3.
- **Compass & Layer Controls:** Circular floating action buttons (40px x 40px), radius `9999px`, background `#FFFFFF`, border `1px solid #E2E8F0`, shadow Level 2. Hover background `#F8FAFC`.