# MarketFlow Design System

## Brand Identity

### Brand Name: **MarketFlow**
- **Market** = Marketing + Marketplace
- **Flow** = Automation + Smooth experience

### Tagline Options:
1. "Your Marketing on Autopilot"
2. "E-Commerce Marketing, Simplified"
3. "One Platform. All Your Marketing."

---

## Color Palette

### Primary Colors (Your Brand)

```
PRIMARY GRADIENT
┌────────────────────────────────────────────────────┐
│  #FF3131  ────────────────────────────▶  #FF914D  │
│  (Vibrant Red)                      (Warm Orange)  │
└────────────────────────────────────────────────────┘

CSS: background: linear-gradient(135deg, #FF3131 0%, #FF914D 100%);
```

**Color Codes:**
| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Primary Red | `#FF3131` | rgb(255, 49, 49) | CTAs, important buttons |
| Primary Orange | `#FF914D` | rgb(255, 145, 77) | Accents, highlights |
| Gradient Start | `#FF3131` | - | Gradient left/top |
| Gradient End | `#FF914D` | - | Gradient right/bottom |

### Secondary Colors

| Name | Hex | Usage |
|------|-----|-------|
| Dark Navy | `#1A1A2E` | Main text, headers |
| Charcoal | `#16213E` | Secondary text |
| Deep Blue | `#0F3460` | Tertiary elements |

### Neutral Colors

| Name | Hex | Usage |
|------|-----|-------|
| White | `#FFFFFF` | Backgrounds |
| Light Gray | `#F8F9FA` | Card backgrounds |
| Medium Gray | `#E9ECEF` | Borders, dividers |
| Dark Gray | `#6C757D` | Subtle text |
| Black | `#212529` | Strong emphasis |

### Semantic Colors

| Status | Hex | Usage |
|--------|-----|-------|
| Success | `#10B981` | Completed, positive |
| Warning | `#F59E0B` | Attention needed |
| Error | `#EF4444` | Problems, failures |
| Info | `#3B82F6` | Information, tips |

---

## Typography

### Font Family

**Primary Font: Inter**
- Clean, modern, highly readable
- Perfect for dashboards and data
- Free on Google Fonts

**Secondary Font: Space Grotesk**
- For numbers and metrics
- Distinctive, professional look

### Font Sizes

```
TYPOGRAPHY SCALE

Display:    48px / 3rem     ─ Hero headlines
H1:         36px / 2.25rem  ─ Page titles
H2:         30px / 1.875rem ─ Section headers
H3:         24px / 1.5rem   ─ Card titles
H4:         20px / 1.25rem  ─ Subsections
H5:         18px / 1.125rem ─ Small headers
Body:       16px / 1rem     ─ Regular text
Small:      14px / 0.875rem ─ Secondary text
Caption:    12px / 0.75rem  ─ Labels, hints
```

### Font Weights

| Weight | Name | Usage |
|--------|------|-------|
| 400 | Regular | Body text |
| 500 | Medium | Emphasis |
| 600 | Semi-Bold | Subheadings |
| 700 | Bold | Headings |

### CSS Implementation

```css
/* Primary Font */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Numbers/Metrics Font */
font-family: 'Space Grotesk', 'Inter', sans-serif;
```

---

## Spacing System

### Base Unit: 4px

```
SPACING SCALE

xs:   4px   ─ Tight spacing
sm:   8px   ─ Small gaps
md:   16px  ─ Standard spacing
lg:   24px  ─ Large gaps
xl:   32px  ─ Section spacing
2xl:  48px  ─ Major sections
3xl:  64px  ─ Page sections
```

### Usage Guidelines

| Element | Spacing |
|---------|---------|
| Button padding | 12px 24px |
| Card padding | 24px |
| Section margin | 48px |
| Input padding | 12px 16px |
| Icon gap | 8px |

---

## Component Library

### Buttons

```
PRIMARY BUTTON (Main actions)
┌────────────────────────────────┐
│     Create Campaign            │  ← Gradient background
└────────────────────────────────┘    White text, rounded

SECONDARY BUTTON (Secondary actions)
┌────────────────────────────────┐
│     Save as Draft              │  ← White background
└────────────────────────────────┘    Primary color border/text

GHOST BUTTON (Tertiary actions)
┌────────────────────────────────┐
│     Cancel                     │  ← Transparent background
└────────────────────────────────┘    Gray text

ICON BUTTON
┌──────┐
│  +   │  ← Square, gradient or outlined
└──────┘
```

**Button States:**
- Default: Normal appearance
- Hover: Slightly darker, subtle shadow
- Active: Pressed effect
- Disabled: 50% opacity, no interactions

### Cards

```
STANDARD CARD
╭─────────────────────────────────────╮
│                                     │
│  Card Title                         │
│  ─────────────────────────────      │
│  Card content goes here with        │
│  relevant information.              │
│                                     │
│  [Action Button]                    │
│                                     │
╰─────────────────────────────────────╯

Properties:
- Background: White
- Border radius: 12px
- Shadow: 0 1px 3px rgba(0,0,0,0.1)
- Padding: 24px
```

### Metric Cards

```
METRIC CARD
╭─────────────────────────────────────╮
│  Revenue                      ↗️    │
│                                     │
│  $12,450                            │  ← Large number
│  ▲ 23% vs last month                │  ← Comparison
│                                     │
╰─────────────────────────────────────╯

Color coding:
- Positive change: Green (#10B981)
- Negative change: Red (#EF4444)
- Neutral: Gray (#6C757D)
```

### Input Fields

```
TEXT INPUT
┌─────────────────────────────────────┐
│ Label                               │
│ ┌─────────────────────────────────┐ │
│ │ Placeholder text...             │ │
│ └─────────────────────────────────┘ │
│ Helper text or error message        │
└─────────────────────────────────────┘

States:
- Default: Gray border (#E9ECEF)
- Focus: Primary color border + shadow
- Error: Red border + error message
- Disabled: Light gray background
```

### Dropdowns

```
DROPDOWN/SELECT
┌─────────────────────────────────────┐
│ Select an option...            ▼    │
└─────────────────────────────────────┘
        │
        ▼
╭─────────────────────────────────────╮
│ Option 1                            │
│ Option 2                      ✓     │ ← Selected
│ Option 3                            │
╰─────────────────────────────────────╯
```

### Tables

```
DATA TABLE
┌────────────────────────────────────────────────────────┐
│  Campaign      │  Status   │  Spend    │  Revenue     │
├────────────────────────────────────────────────────────┤
│  Summer Sale   │ ● Active  │  $234     │  $1,245      │
│  New Arrivals  │ ● Paused  │  $156     │  $892        │
│  Flash Deal    │ ● Active  │  $89      │  $445        │
└────────────────────────────────────────────────────────┘

Features:
- Sortable columns (click header)
- Hover highlight on rows
- Alternating row colors (optional)
- Status indicators with colors
```

### Navigation

```
SIDEBAR NAVIGATION
╭───────────────────────╮
│  ◉ MARKETFLOW         │  ← Logo
├───────────────────────┤
│                       │
│  ▣  Dashboard         │  ← Active (highlighted)
│  ◫  Campaigns         │
│  ✉  Emails            │
│  🎨 Creative          │
│  📊 Analytics         │
│                       │
├───────────────────────┤
│  ⚙  Settings          │
│  ?  Help              │
╰───────────────────────╯

Active state:
- Background: gradient at 10% opacity
- Left border: 3px gradient
- Text: Primary color
```

---

## Iconography

### Icon Style
- **Style:** Outlined (not filled)
- **Size:** 24px default, 20px for small, 32px for large
- **Stroke:** 1.5px
- **Library:** Lucide Icons (recommended)

### Common Icons

| Icon | Usage | Name |
|------|-------|------|
| 📊 | Dashboard | `LayoutDashboard` |
| 📢 | Campaigns | `Megaphone` |
| ✉️ | Emails | `Mail` |
| 🎨 | Creative | `Palette` |
| 📈 | Analytics | `TrendingUp` |
| ⚙️ | Settings | `Settings` |
| 👤 | Profile | `User` |
| + | Add/Create | `Plus` |
| ✓ | Success | `Check` |
| ✕ | Close/Error | `X` |

---

## Layout System

### Grid System

```
12-COLUMN GRID

│ 1 │ 2 │ 3 │ 4 │ 5 │ 6 │ 7 │ 8 │ 9 │10 │11 │12 │

Common layouts:
- Full width: 12 columns
- Two equal: 6 + 6 columns
- Sidebar + Content: 3 + 9 columns
- Three equal: 4 + 4 + 4 columns
```

### Breakpoints

| Name | Width | Usage |
|------|-------|-------|
| Mobile | < 640px | Single column |
| Tablet | 640px - 1024px | Adjusted layout |
| Desktop | 1024px - 1280px | Full layout |
| Wide | > 1280px | Expanded layout |

### Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  HEADER (64px height)                                           │
│  Logo │ Navigation │ Search │ Notifications │ Profile           │
├──────────┬──────────────────────────────────────────────────────┤
│          │                                                      │
│  SIDEBAR │              MAIN CONTENT                            │
│  (240px) │              (fluid width)                           │
│          │                                                      │
│          │  ┌──────────────────────────────────────────────┐   │
│          │  │  Page Header                                  │   │
│          │  ├──────────────────────────────────────────────┤   │
│          │  │                                               │   │
│          │  │  Content Area                                 │   │
│          │  │                                               │   │
│          │  └──────────────────────────────────────────────┘   │
│          │                                                      │
└──────────┴──────────────────────────────────────────────────────┘
```

---

## Animation & Motion

### Timing

| Type | Duration | Usage |
|------|----------|-------|
| Instant | 0ms | Immediate feedback |
| Fast | 150ms | Micro-interactions |
| Normal | 300ms | Standard transitions |
| Slow | 500ms | Complex animations |

### Easing

```css
/* Standard easing */
transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);

/* Enter easing (appearing) */
transition-timing-function: cubic-bezier(0, 0, 0.2, 1);

/* Exit easing (disappearing) */
transition-timing-function: cubic-bezier(0.4, 0, 1, 1);
```

### Common Animations

| Element | Animation |
|---------|-----------|
| Button hover | Scale 1.02, shadow increase |
| Card hover | Subtle lift (translateY -2px) |
| Modal open | Fade in + scale from 0.95 |
| Dropdown | Slide down + fade in |
| Loading | Pulse or spinner |

---

## Data Visualization

### Chart Colors

```
CHART COLOR PALETTE

Primary Series:   #FF3131 (Red)
Secondary Series: #FF914D (Orange)
Tertiary Series:  #3B82F6 (Blue)
Fourth Series:    #10B981 (Green)
Fifth Series:     #8B5CF6 (Purple)
```

### Chart Types

| Data Type | Chart |
|-----------|-------|
| Trend over time | Line chart |
| Comparison | Bar chart |
| Distribution | Donut/Pie chart |
| Multiple metrics | Multi-line chart |
| Performance | Gauge chart |

---

## Logo Usage

### Primary Logo

```
┌─────────────────────────────────┐
│                                 │
│   ◉ MARKETFLOW                  │
│                                 │
└─────────────────────────────────┘

- Icon: Abstract "M" or flow symbol
- Text: "MARKETFLOW" in bold
- Colors: Gradient #FF3131 → #FF914D
```

### Logo Variations

| Version | Usage |
|---------|-------|
| Full color | Light backgrounds |
| White | Dark/colored backgrounds |
| Icon only | Favicon, small spaces |
| Horizontal | Headers, wide spaces |
| Stacked | Square spaces |

### Clear Space

```
     ┌─────────────┐
     │             │
 X   │   LOGO      │   X    ← Minimum clear space = logo height
     │             │
     └─────────────┘
            X
```

---

## Accessibility

### Color Contrast

All text must meet WCAG 2.1 AA standards:
- Normal text: 4.5:1 contrast ratio
- Large text: 3:1 contrast ratio

### Focus States

```css
/* Visible focus indicator */
:focus-visible {
  outline: 2px solid #FF3131;
  outline-offset: 2px;
}
```

### Text Guidelines

- Minimum body text: 16px
- Line height: 1.5 for body, 1.2 for headings
- Maximum line width: 80 characters

---

## Dark Mode (Future)

### Dark Mode Colors

| Light Mode | Dark Mode |
|------------|-----------|
| `#FFFFFF` (background) | `#1A1A2E` |
| `#F8F9FA` (card) | `#16213E` |
| `#1A1A2E` (text) | `#F8F9FA` |
| `#E9ECEF` (border) | `#2D3748` |

*Note: Primary gradient colors remain the same in dark mode*

---

## Design Tokens (CSS Variables)

```css
:root {
  /* Colors */
  --color-primary: #FF3131;
  --color-primary-light: #FF914D;
  --color-gradient: linear-gradient(135deg, #FF3131 0%, #FF914D 100%);

  --color-text-primary: #1A1A2E;
  --color-text-secondary: #6C757D;
  --color-background: #FFFFFF;
  --color-surface: #F8F9FA;
  --color-border: #E9ECEF;

  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-error: #EF4444;
  --color-info: #3B82F6;

  /* Typography */
  --font-family: 'Inter', sans-serif;
  --font-family-mono: 'Space Grotesk', monospace;

  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;

  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
}
```

---

*Design System v1.0*
*MarketFlow - E-Commerce Marketing Automation*
