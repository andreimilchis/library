# MarketFlow - Detailed Feature Specifications

## Module 1: Dashboard & Overview

### 1.1 Main Dashboard

**Purpose:** Give users a quick snapshot of their entire marketing performance in one view.

#### Key Metrics Cards (Top Row)

```
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   TOTAL         │ │   AD SPEND      │ │   ROAS          │ │   EMAIL         │
│   REVENUE       │ │                 │ │                 │ │   SUBSCRIBERS   │
│   $24,567       │ │   $4,230        │ │   5.8x          │ │   12,456        │
│   ▲ 18% ↗       │ │   ▼ 3% ↘        │ │   ▲ 0.8 ↗       │ │   ▲ 234 new     │
└─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────────┘
```

**Metrics Explained:**
| Metric | What It Shows | Calculation |
|--------|---------------|-------------|
| Total Revenue | Money earned from marketing | Sum of attributed sales |
| Ad Spend | Money spent on ads | Total across all platforms |
| ROAS | Return on Ad Spend | Revenue ÷ Ad Spend |
| Email Subscribers | Active email list size | Total - Unsubscribed |

#### Revenue Chart

- **Type:** Area chart with gradient fill
- **Time Range:** 7 days, 30 days, 90 days, 12 months
- **Data:** Daily revenue with comparison line to previous period
- **Hover:** Shows exact amount for each day

#### Platform Performance Breakdown

```
PERFORMANCE BY PLATFORM

Facebook     ████████████████████░░░░  $12,340 (45%)
Google       ████████████░░░░░░░░░░░░  $8,230  (30%)
TikTok       ██████░░░░░░░░░░░░░░░░░░  $4,120  (15%)
Email        ████░░░░░░░░░░░░░░░░░░░░  $2,750  (10%)
```

#### Quick Actions Panel

| Action | Icon | What It Does |
|--------|------|--------------|
| Create Campaign | + | Opens new campaign wizard |
| Send Email | ✉️ | Opens email composer |
| Make Banner | 🎨 | Opens creative studio |
| View Reports | 📊 | Goes to analytics |

#### Recent Activity Feed

Shows last 10 activities:
- "Campaign 'Summer Sale' reached 10,000 people"
- "Email 'Welcome Series #1' sent to 234 subscribers"
- "New product 'Beach Towel' synced from Shopify"

---

### 1.2 Notifications Center

**Bell Icon in Header** → Click to see:

| Notification Type | Priority | Example |
|-------------------|----------|---------|
| Performance Alert | High | "Campaign X ROAS dropped below 2x" |
| Budget Warning | High | "Ad account reaching daily limit" |
| Sync Complete | Medium | "Shopify products synced (45 items)" |
| Tips & Suggestions | Low | "Try A/B testing your email subject" |

---

## Module 2: Paid Media Hub

### 2.1 Campaign Manager

**Main View - Campaign List**

```
┌──────────────────────────────────────────────────────────────────────────┐
│  CAMPAIGNS                                           [+ New Campaign]    │
├──────────────────────────────────────────────────────────────────────────┤
│  Filter: [All Platforms ▼] [Active ▼] [Last 30 Days ▼]    🔍 Search     │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────┐ Summer Sale 2024                    ● Active                   │
│  │ FB  │ Facebook • Started Jun 1            Spend: $1,234              │
│  └─────┘ 45,234 reach • 2,341 clicks         Revenue: $6,789 (5.5x)    │
│                                              [Edit] [Pause] [Duplicate] │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                          │
│  ┌─────┐ Best Sellers - Search               ● Active                   │
│  │  G  │ Google • Started May 15             Spend: $890               │
│  └─────┘ 12,456 impressions • 567 clicks     Revenue: $3,456 (3.9x)    │
│                                              [Edit] [Pause] [Duplicate] │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Campaign Creation Wizard

**Step 1: Choose Objective**

```
What's your goal?

┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│     🛒          │  │     👁️          │  │     👥          │
│                 │  │                 │  │                 │
│     SALES       │  │   AWARENESS     │  │    TRAFFIC      │
│                 │  │                 │  │                 │
│  Get purchases  │  │  Reach new      │  │  Drive visits   │
│  on your store  │  │  people         │  │  to your site   │
└─────────────────┘  └─────────────────┘  └─────────────────┘
      ✓ Selected
```

**Step 2: Select Platform(s)**

```
Where do you want to advertise?

☑️ Facebook & Instagram
   Best for: Visual products, broad audiences
   Your audience: 2.4M people available

☑️ Google Search
   Best for: People actively searching
   Your keywords reach: 45K searches/month

☐ Google Shopping
   Best for: Product images in search
   Requires: Product feed (Ready ✓)

☐ TikTok
   Best for: Younger audience, viral content
   Your audience: 890K people available
```

**Step 3: Select Products**

```
Which products do you want to promote?

🔍 Search products...

Best Sellers (Recommended)
┌─────────────────────────────────────────────────────┐
│ ☑️ [IMG] Summer Beach Towel      $29.99   ⭐ Best   │
│ ☑️ [IMG] Wireless Earbuds        $49.99   ⭐ Best   │
│ ☐  [IMG] Phone Case - Clear      $12.99            │
│ ☐  [IMG] Travel Mug - 16oz       $19.99            │
└─────────────────────────────────────────────────────┘

AI Suggestion: "Based on your sales data, Beach Towel
and Earbuds have the highest conversion rates. We
recommend focusing your budget on these."
```

**Step 4: Set Audience**

```
Who should see your ads?

┌─ QUICK SETUP ─────────────────────────────────────┐
│                                                    │
│ ◉ Let AI find your best audience (Recommended)    │
│   Uses your customer data to find similar people  │
│                                                    │
│ ○ Use a saved audience                            │
│   [Select audience ▼]                             │
│                                                    │
│ ○ Create custom audience                          │
│   Define demographics, interests, behaviors       │
│                                                    │
└────────────────────────────────────────────────────┘

AI Audience Preview:
"Women 25-44, interested in beach activities,
home decor, and online shopping. Located in
US coastal states."

Estimated reach: 2.4 million people
```

**Step 5: Set Budget**

```
How much do you want to spend?

Daily Budget: [$50     ]  per day

   $25/day = ~750 people reached
   $50/day = ~1,500 people reached (Good for testing)
   $100/day = ~3,000 people reached

Duration:
◉ Run continuously until I stop it
○ Run for specific dates: [Jun 1] to [Jun 30]

Estimated Results (based on your data):
┌────────────────────────────────────┐
│ Daily Spend:     $50               │
│ Expected Clicks: 150-200           │
│ Expected Sales:  3-5               │
│ Expected ROAS:   3-5x              │
└────────────────────────────────────┘
```

**Step 6: Create Ad Content**

```
Create your ad

┌─ AD PREVIEW ─────────────────────────────────────────────────────┐
│                                                                   │
│  ┌──────────────────┐                                            │
│  │                  │   Your Store Name                          │
│  │    [PRODUCT      │   Sponsored                                │
│  │     IMAGE]       │                                            │
│  │                  │   ☀️ Beach days just got better!           │
│  └──────────────────┘   Our quick-dry towel is a summer must-    │
│                         have. Shop now and save 20%!             │
│                                                                   │
│                         [Shop Now]                                │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘

Primary Text:
[☀️ Beach days just got better! Our quick-dry towel is a summer...]
[🪄 Generate with AI]

Headline:
[Summer Beach Towel - 20% Off                                    ]
[🪄 Generate with AI]

Call to Action: [Shop Now ▼]

💡 AI Suggestion: "Add urgency with limited-time language"
   [Apply Suggestion]
```

**Step 7: Review & Launch**

```
Review Your Campaign

Campaign Name: Summer Beach Towel Promotion
Platform:      Facebook & Instagram
Objective:     Sales
Products:      Summer Beach Towel, Wireless Earbuds
Audience:      AI-optimized (2.4M reach)
Budget:        $50/day continuously
Ad Creative:   1 ad set, 2 products

Estimated Monthly:
- Spend: $1,500
- Revenue: $4,500-$7,500
- ROAS: 3-5x

☑️ I understand this will charge my connected ad account

        [Save as Draft]    [🚀 Launch Campaign]
```

---

### 2.3 Ad Performance Dashboard

```
CAMPAIGN: Summer Beach Towel Promotion

Date Range: [Last 7 Days ▼]                      [Export] [Edit Campaign]

┌─────────────────────────────────────────────────────────────────────────┐
│  PERFORMANCE METRICS                                                     │
├─────────────┬─────────────┬─────────────┬─────────────┬─────────────────┤
│   SPEND     │   REVENUE   │    ROAS     │   CLICKS    │  CONVERSIONS   │
│   $347      │   $1,892    │    5.5x     │   1,234     │      28        │
│   ↓ $12     │   ↑ $234    │   ↑ 0.3x    │   ↑ 145     │     ↑ 5        │
│  vs last wk │  vs last wk │  vs last wk │  vs last wk │   vs last wk   │
└─────────────┴─────────────┴─────────────┴─────────────┴─────────────────┘

[CHART: Daily spend vs revenue line graph]

TOP PERFORMING ADS
┌─────────────────────────────────────────────────────────────────────────┐
│ Rank │ Ad Name              │ Spend   │ Revenue │ ROAS  │ CTR    │     │
├──────┼──────────────────────┼─────────┼─────────┼───────┼────────┼─────┤
│  1   │ Beach Towel - Video  │ $156    │ $987    │ 6.3x  │ 2.4%   │ ⭐  │
│  2   │ Beach Towel - Image  │ $123    │ $623    │ 5.1x  │ 1.8%   │     │
│  3   │ Earbuds - Carousel   │ $68     │ $282    │ 4.1x  │ 1.5%   │     │
└──────┴──────────────────────┴─────────┴─────────┴───────┴────────┴─────┘

AI INSIGHTS
┌─────────────────────────────────────────────────────────────────────────┐
│ 💡 Your video ad is outperforming images by 24%. Consider creating     │
│    more video content.                                                  │
│                                                 [Create Similar Video]  │
├─────────────────────────────────────────────────────────────────────────┤
│ ⚠️ CTR is below average for "Earbuds - Carousel". Try refreshing the  │
│    creative or adjusting the audience.                                  │
│                                                      [Get Suggestions]  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Module 3: Email Marketing

### 3.1 Email Dashboard

```
EMAIL OVERVIEW                                          [+ New Email]

┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│   12,456    │ │    42%      │ │    3.2%     │ │   $4,230    │
│ Subscribers │ │  Open Rate  │ │ Click Rate  │ │  Revenue    │
│   ↑ 234     │ │  ↑ 2%       │ │  ↑ 0.4%     │ │  ↑ $456     │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘

AUTOMATED FLOWS
┌─────────────────────────────────────────────────────────────────────────┐
│ Flow Name          │ Status  │ Sent/Week │ Revenue  │ Actions          │
├────────────────────┼─────────┼───────────┼──────────┼──────────────────┤
│ Welcome Series     │ ● On    │ 234       │ $1,234   │ [Edit] [Stats]   │
│ Abandoned Cart     │ ● On    │ 156       │ $2,345   │ [Edit] [Stats]   │
│ Post-Purchase      │ ● On    │ 89        │ $456     │ [Edit] [Stats]   │
│ Win-Back           │ ○ Off   │ -         │ -        │ [Edit] [Turn On] │
└─────────────────────────────────────────────────────────────────────────┘

RECENT CAMPAIGNS
┌─────────────────────────────────────────────────────────────────────────┐
│ Campaign            │ Sent      │ Opens   │ Clicks  │ Revenue │        │
├─────────────────────┼───────────┼─────────┼─────────┼─────────┼────────┤
│ June Newsletter     │ 12,456    │ 48%     │ 4.2%    │ $1,890  │ [View] │
│ Flash Sale Alert    │ 10,234    │ 52%     │ 6.8%    │ $3,456  │ [View] │
│ New Arrivals        │ 11,890    │ 38%     │ 2.9%    │ $987    │ [View] │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Email Builder

```
CREATE EMAIL                                                    [Preview]

┌─ SETTINGS ──────────────────────────────────────────────────────────────┐
│                                                                          │
│ Subject Line: [Summer is here! ☀️ Check out our new arrivals      ]    │
│               [🪄 Generate with AI]                                      │
│                                                                          │
│ Preview Text: [Fresh styles for the sunny season...                ]    │
│                                                                          │
│ From Name:    [Your Store Name ▼]                                        │
│ Reply To:     [hello@yourstore.com                              ]       │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘

┌─ DESIGN ────────────────────────────────────────────────────────────────┐
│                                                                          │
│  BLOCKS              │            PREVIEW                               │
│  ─────────           │  ┌────────────────────────────────────┐         │
│  [+ Header    ]      │  │         YOUR LOGO                   │         │
│  [+ Text      ]      │  │  ──────────────────────────────────│         │
│  [+ Image     ]      │  │                                     │         │
│  [+ Button    ]      │  │  Summer is here! ☀️                │         │
│  [+ Products  ]      │  │                                     │         │
│  [+ Divider   ]      │  │  Check out our latest arrivals     │         │
│  [+ Social    ]      │  │  perfect for the sunny season.     │         │
│  [+ Footer    ]      │  │                                     │         │
│                      │  │  ┌──────┐ ┌──────┐ ┌──────┐        │         │
│  AI TOOLS            │  │  │ PROD │ │ PROD │ │ PROD │        │         │
│  ─────────           │  │  │  1   │ │  2   │ │  3   │        │         │
│  [🪄 Write copy]     │  │  │$29.99│ │$49.99│ │$19.99│        │         │
│  [🪄 Suggest products]│  │  └──────┘ └──────┘ └──────┘        │         │
│  [🪄 Improve design] │  │                                     │         │
│                      │  │      [ SHOP NOW ]                   │         │
│                      │  │                                     │         │
│                      │  │  ──────────────────────────────────│         │
│                      │  │        Unsubscribe | View Online    │         │
│                      │  └────────────────────────────────────┘         │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘

        [Save Draft]    [Schedule]    [📧 Send Now]
```

### 3.3 Automation Flow Builder

```
FLOW: ABANDONED CART RECOVERY

Trigger: Cart abandoned for 1 hour
         ↓
    ┌─────────────────────┐
    │   Wait 1 hour       │
    └──────────┬──────────┘
               ↓
    ┌─────────────────────┐
    │   EMAIL 1           │
    │   "Forgot something?"│
    │   Show cart items   │
    └──────────┬──────────┘
               ↓
         Did they buy?
        /            \
      Yes             No
       │               │
    [END]        ┌─────────────────────┐
                 │   Wait 24 hours     │
                 └──────────┬──────────┘
                            ↓
                 ┌─────────────────────┐
                 │   EMAIL 2           │
                 │   "Still thinking?" │
                 │   Add 10% discount  │
                 └──────────┬──────────┘
                            ↓
                      Did they buy?
                     /            \
                   Yes             No
                    │               │
                 [END]        ┌─────────────────────┐
                              │   Wait 48 hours     │
                              └──────────┬──────────┘
                                         ↓
                              ┌─────────────────────┐
                              │   EMAIL 3           │
                              │   "Last chance!"    │
                              │   Final reminder    │
                              └──────────┬──────────┘
                                         ↓
                                      [END]

[+ Add Step]  [Edit Emails]  [View Stats]  [● Flow is ON]
```

---

## Module 4: Creative Studio

### 4.1 Banner Creator

```
CREATIVE STUDIO - BANNER                          [My Designs] [Templates]

┌─ CANVAS ──────────────────────────────────────────────────────────────┐
│                                                                        │
│    ┌─────────────────────────────────────────────────────────────┐    │
│    │                                                             │    │
│    │         [Your Product Image Here]                          │    │
│    │                                                             │    │
│    │         SUMMER SALE                                        │    │
│    │         Up to 50% Off                                      │    │
│    │                                                             │    │
│    │         [ SHOP NOW ]                                       │    │
│    │                                                             │    │
│    └─────────────────────────────────────────────────────────────┘    │
│                                                                        │
│    Size: Facebook Feed (1200x628)  [Change Size ▼]                    │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘

┌─ TOOLS ─────────────┐  ┌─ LAYERS ──────────────┐
│                     │  │                        │
│ [T] Add Text        │  │ 📷 Product Image       │
│ [□] Add Shape       │  │ T  "SUMMER SALE"       │
│ [🖼] Add Image       │  │ T  "Up to 50% Off"     │
│ [○] Add Button      │  │ □  Button              │
│ [📦] Add Product    │  │ □  Background          │
│                     │  │                        │
│ ─────────────────── │  └────────────────────────┘
│                     │
│ 🪄 AI ASSIST        │  ┌─ BRAND KIT ────────────┐
│                     │  │                        │
│ [Generate Layout]   │  │ Colors:                │
│ [Write Headlines]   │  │ ■ #FF3131  ■ #FF914D   │
│ [Suggest Images]    │  │ ■ #1A1A2E  ■ #FFFFFF   │
│                     │  │                        │
└─────────────────────┘  │ Font: Inter            │
                         │ Logo: [Your Logo]      │
                         └────────────────────────┘

[Export for: Facebook ▼]    [Save]    [Download]
```

### 4.2 Video Creator

```
VIDEO CREATOR                                              [My Videos]

┌─ TIMELINE ────────────────────────────────────────────────────────────┐
│                                                                        │
│  0s          3s          6s          9s         12s         15s       │
│  │───────────│───────────│───────────│───────────│───────────│        │
│  ┌─────────────────┐                                                   │
│  │ Scene 1: Product│                                                   │
│  │ Zoom In         │                                                   │
│  └─────────────────┘                                                   │
│              ┌─────────────────┐                                       │
│              │ Scene 2: Features                                       │
│              │ Text Overlay    │                                       │
│              └─────────────────┘                                       │
│                          ┌─────────────────┐                          │
│                          │ Scene 3: CTA    │                          │
│                          │ Shop Now        │                          │
│                          └─────────────────┘                          │
│                                                                        │
│  🔊 ████████████████████░░░░░░░░░░░░░░░░░░░░░░░  Music: Summer Vibes  │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘

┌─ PREVIEW ───────────────┐  ┌─ SCENES ────────────────────────────────┐
│                         │  │                                          │
│   ┌───────────────┐     │  │ Scene 1: Product Showcase               │
│   │               │     │  │ [Product image with zoom animation]     │
│   │   [PRODUCT]   │     │  │ Duration: 3s    [Edit] [Delete]        │
│   │               │     │  │ ───────────────────────────────────── │
│   │  SUMMER SALE  │     │  │ Scene 2: Features                       │
│   │               │     │  │ [Text: "Quick Dry • Sand Free"]        │
│   └───────────────┘     │  │ Duration: 3s    [Edit] [Delete]        │
│                         │  │ ───────────────────────────────────── │
│   ▶️  ■  │────────│     │  │ Scene 3: Call to Action                 │
│                         │  │ [Shop Now button animation]             │
│   9:16 TikTok/Reels     │  │ Duration: 3s    [Edit] [Delete]        │
│                         │  │                                          │
└─────────────────────────┘  │ [+ Add Scene]                           │
                             │                                          │
                             └──────────────────────────────────────────┘

[🪄 Auto-Generate Video from Product]    [Save]    [Export]
```

### 4.3 Template Library

```
TEMPLATES                                      [Filter: All ▼] 🔍 Search

┌─ CATEGORIES ────────────────────────────────────────────────────────────┐
│                                                                          │
│  [All]  [Sale]  [New Arrival]  [Seasonal]  [Product Feature]  [Social]  │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘

POPULAR TEMPLATES

┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   [PREVIEW]  │ │   [PREVIEW]  │ │   [PREVIEW]  │ │   [PREVIEW]  │
│              │ │              │ │              │ │              │
│   Flash Sale │ │  New Arrival │ │ Best Seller  │ │   Seasonal   │
│   Template   │ │   Template   │ │  Template    │ │   Template   │
│              │ │              │ │              │ │              │
│  ⭐ 4.8 (234)│ │  ⭐ 4.9 (189)│ │  ⭐ 4.7 (156)│ │  ⭐ 4.6 (98) │
│  [Use This]  │ │  [Use This]  │ │  [Use This]  │ │  [Use This]  │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘

VIDEO TEMPLATES

┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   ▶ [VIDEO]  │ │   ▶ [VIDEO]  │ │   ▶ [VIDEO]  │ │   ▶ [VIDEO]  │
│              │ │              │ │              │ │              │
│   TikTok     │ │   Instagram  │ │   YouTube    │ │   Story      │
│   Product    │ │   Reel       │ │   Short      │ │   Ad         │
│              │ │              │ │              │ │              │
│  15 seconds  │ │  30 seconds  │ │  60 seconds  │ │  15 seconds  │
│  [Use This]  │ │  [Use This]  │ │  [Use This]  │ │  [Use This]  │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

---

## Module 5: Analytics Center

### 5.1 Overview Report

```
ANALYTICS                                   [Date: Last 30 Days ▼] [Export]

┌─ SUMMARY ───────────────────────────────────────────────────────────────┐
│                                                                          │
│  Total Marketing Revenue    Total Spend    Overall ROAS    Efficiency   │
│       $67,890                 $12,345         5.5x           A+         │
│       ↑ 23% vs prev period   ↓ 5%           ↑ 0.8x                      │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘

┌─ REVENUE BY CHANNEL ────────────────────────────────────────────────────┐
│                                                                          │
│  [PIE CHART]                  │  Facebook/Instagram    $32,456  (48%)   │
│                               │  Google Ads            $18,234  (27%)   │
│      48%  27%                 │  Email Marketing       $12,890  (19%)   │
│           19%                 │  TikTok                 $4,310  (6%)    │
│             6%                │                                          │
│                               │                                          │
└──────────────────────────────────────────────────────────────────────────┘

┌─ PERFORMANCE TREND ─────────────────────────────────────────────────────┐
│                                                                          │
│  Revenue                                                                 │
│  $3K │                              ╱╲                                   │
│      │                    ╱╲      ╱    ╲    ╱╲                          │
│  $2K │          ╱╲      ╱    ╲  ╱        ╲╱    ╲                        │
│      │    ╱╲  ╱    ╲  ╱                          ╲                      │
│  $1K │  ╱    ╲                                                          │
│      │╱                                                                  │
│   $0 └──────────────────────────────────────────────────────────────    │
│       Jun 1      Jun 8      Jun 15      Jun 22      Jun 30              │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘

┌─ TOP PRODUCTS BY MARKETING REVENUE ─────────────────────────────────────┐
│                                                                          │
│  Rank  Product                    Revenue    Orders    Avg Order Value  │
│  ────────────────────────────────────────────────────────────────────── │
│   1    Summer Beach Towel         $12,456    456       $27.31           │
│   2    Wireless Earbuds           $9,876     234       $42.21           │
│   3    Travel Mug                 $7,654     389       $19.68           │
│   4    Phone Case Bundle          $5,432     567       $9.58            │
│   5    Yoga Mat                   $4,321     189       $22.86           │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Detailed Reports

**Available Reports:**

| Report | What It Shows |
|--------|---------------|
| Campaign Performance | All campaigns with detailed metrics |
| Product Performance | Which products sell best from marketing |
| Audience Insights | Who is buying, demographics |
| Email Analytics | Open rates, clicks, revenue by email |
| Attribution | Where your sales really come from |
| Comparison | This period vs. last period |

---

## Module 6: Settings & Account

### 6.1 Settings Menu

```
SETTINGS

┌─ NAVIGATION ─────────────────────────────────────────────────────────────┐
│                                                                           │
│  > Account                                                                │
│  > Integrations                                                           │
│  > Billing                                                                │
│  > Team Members                                                           │
│  > Notifications                                                          │
│  > Brand Kit                                                              │
│  > API Keys                                                               │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Brand Kit Settings

```
BRAND KIT                                              [Save Changes]

┌─ LOGO ──────────────────────────────────────────────────────────────────┐
│                                                                          │
│  Primary Logo:      [IMG]        [Upload New]                           │
│  Secondary Logo:    [IMG]        [Upload New]                           │
│  Favicon:           [IMG]        [Upload New]                           │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘

┌─ COLORS ────────────────────────────────────────────────────────────────┐
│                                                                          │
│  Primary:    [#FF3131 ■]    Secondary:  [#FF914D ■]                     │
│  Text:       [#1A1A2E ■]    Background: [#FFFFFF ■]                     │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘

┌─ FONTS ─────────────────────────────────────────────────────────────────┐
│                                                                          │
│  Headlines: [Inter ▼]                                                    │
│  Body Text: [Inter ▼]                                                    │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘

┌─ DEFAULT CONTENT ───────────────────────────────────────────────────────┐
│                                                                          │
│  Store Name:        [Your Store Name                          ]         │
│  Tagline:           [Quality products for everyday life       ]         │
│  Website URL:       [https://yourstore.com                    ]         │
│  Contact Email:     [hello@yourstore.com                      ]         │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## AI Features Summary

### What AI Does in MarketFlow

| Feature | What It Does | Where It's Used |
|---------|--------------|-----------------|
| Copy Generator | Writes ad text, email subjects, headlines | Ads, Emails, Banners |
| Audience Finder | Suggests who to target based on your customers | Ad campaigns |
| Product Recommender | Picks best products to promote | Campaigns, Emails |
| Performance Predictor | Estimates results before launching | Campaign creation |
| Budget Optimizer | Distributes budget for best results | Active campaigns |
| Image Enhancer | Improves product photos | Creative studio |
| A/B Test Suggester | Recommends what to test | Emails, Ads |
| Insight Generator | Explains what's working and why | Analytics |

---

*Feature Specifications v1.0*
*MarketFlow - E-Commerce Marketing Automation*
