# MarketFlow - Technical Architecture (Explained Simply)

## How The System Works - The Big Picture

Think of MarketFlow like a **smart assistant** that connects to all your marketing tools and manages them for you.

```
                    ┌─────────────────────────────────────┐
                    │         YOUR CUSTOMERS              │
                    │    (visit your Shopify store)       │
                    └─────────────────┬───────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                         MARKETFLOW                               │
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                    FRONTEND                              │   │
│   │              (What You See & Click)                      │   │
│   │                                                          │   │
│   │   Dashboard │ Ad Manager │ Email Builder │ Creative      │   │
│   └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                    API LAYER                             │   │
│   │            (The Communication Highway)                   │   │
│   │                                                          │   │
│   │   Receives your commands → Processes them → Returns data │   │
│   └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│          ┌───────────────────┼───────────────────┐              │
│          ▼                   ▼                   ▼              │
│   ┌────────────┐     ┌────────────┐     ┌────────────┐         │
│   │   AI      │     │  DATABASE  │     │   QUEUE    │         │
│   │  ENGINE   │     │  (Storage) │     │  (Tasks)   │         │
│   └────────────┘     └────────────┘     └────────────┘         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────────┐
          ▼                   ▼                       ▼
    ┌──────────┐       ┌──────────┐            ┌──────────┐
    │ SHOPIFY  │       │META/GOOGLE│           │  EMAIL   │
    │   API    │       │ TIKTOK    │           │ SERVICE  │
    └──────────┘       └──────────┘            └──────────┘
```

---

## Components Explained (Like Building Blocks)

### 1. Frontend (The User Interface)

**What it is:** Everything you see and interact with in your browser.

**Technology Used:**
- **Next.js 14** - A framework that makes websites fast
- **React 18** - Building blocks for the interface
- **Tailwind CSS** - Makes everything look beautiful
- **TypeScript** - Prevents bugs by checking code

**Key Pages:**
| Page | Purpose |
|------|---------|
| `/dashboard` | Overview of all your marketing |
| `/ads` | Create and manage ad campaigns |
| `/emails` | Build and send email campaigns |
| `/creative` | Design banners and videos |
| `/analytics` | See detailed reports |
| `/settings` | Configure your account |

**How it works:**
1. You click a button (e.g., "Create Ad")
2. Frontend sends a request to the API
3. API processes the request
4. Data comes back
5. Frontend shows you the result

---

### 2. API Layer (The Brain)

**What it is:** The server that processes all your requests and talks to external services.

**Technology Used:**
- **Node.js** - Runs JavaScript on the server
- **Express.js** - Handles web requests
- **TypeScript** - Type-safe code

**Main Functions:**

```
API ENDPOINTS (Where commands are sent)

/api/auth          → Login, logout, user management
/api/shopify       → Connect and sync your store
/api/ads           → Create, update, delete ad campaigns
/api/emails        → Email campaigns and automation
/api/creative      → Banner and video generation
/api/analytics     → Get reports and metrics
/api/ai            → AI-powered features
```

**Example Flow - Creating an Ad:**
```
1. You click "Create Ad"
2. Frontend calls: POST /api/ads/create
3. API validates your request
4. API calls Meta/Google/TikTok
5. Ad is created on the platform
6. API saves record to database
7. Response sent back to you
8. You see "Ad Created Successfully!"
```

---

### 3. Database (Where Everything is Stored)

**What it is:** A secure place where all your data lives.

**Technology Used:**
- **PostgreSQL** - Main database (reliable, fast)
- **Redis** - Quick storage for temporary data

**What's Stored:**

| Table | Contains |
|-------|----------|
| `users` | Your account info |
| `stores` | Shopify connections |
| `products` | Synced product data |
| `campaigns` | Ad campaigns |
| `emails` | Email templates and sends |
| `analytics` | Performance data |
| `assets` | Creative files info |

**Database Diagram (Simplified):**
```
┌─────────────┐       ┌─────────────┐
│   USERS     │──────▶│   STORES    │
│  - id       │       │  - id       │
│  - email    │       │  - user_id  │
│  - plan     │       │  - shop_url │
└─────────────┘       └──────┬──────┘
                             │
          ┌──────────────────┼──────────────────┐
          ▼                  ▼                  ▼
    ┌───────────┐     ┌───────────┐     ┌───────────┐
    │ PRODUCTS  │     │ CAMPAIGNS │     │  EMAILS   │
    │ - id      │     │ - id      │     │ - id      │
    │ - store_id│     │ - store_id│     │ - store_id│
    │ - title   │     │ - platform│     │ - subject │
    │ - price   │     │ - budget  │     │ - status  │
    └───────────┘     └───────────┘     └───────────┘
```

---

### 4. Queue System (Background Tasks)

**What it is:** Handles tasks that take time, so you don't have to wait.

**Technology Used:**
- **BullMQ** - Job queue system
- **Redis** - Stores the queue

**Tasks That Run in Background:**
- Syncing products from Shopify
- Sending bulk emails
- Generating AI content
- Updating ad performance data
- Creating video exports

**How it works:**
```
You: "Sync my 500 products"
        │
        ▼
    API receives request
        │
        ▼
    Adds job to queue
        │
        ▼
    Returns immediately: "Syncing started!"
        │
        ▼ (in background)
    Queue worker processes products one by one
        │
        ▼
    When done: You get notified "Sync complete!"
```

---

### 5. AI Engine (The Smart Part)

**What it is:** Uses artificial intelligence to automate and optimize marketing.

**AI Features:**

| Feature | What It Does | Technology |
|---------|--------------|------------|
| Copy Writer | Writes ad text & emails | OpenAI GPT-4 |
| Image Enhancer | Improves product photos | Stable Diffusion |
| Audience Finder | Suggests who to target | Custom ML Model |
| Budget Optimizer | Distributes ad budget | Optimization Algorithm |
| Performance Predictor | Forecasts results | Time Series ML |

**Example - AI Writing an Ad:**
```
INPUT:
- Product: "Summer Beach Towel"
- Price: $29.99
- Features: Quick dry, sand resistant, oversized

AI GENERATES:
"☀️ Beach days just got better!
Our quick-dry, sand-resistant towel
keeps you comfortable all day long.
Only $29.99 - Shop Now!"
```

---

### 6. External Integrations (Connections to Other Services)

**Shopify Connection:**
```
MarketFlow ←→ Shopify REST/GraphQL API
             └→ Products, Orders, Customers
```

**Meta (Facebook/Instagram) Connection:**
```
MarketFlow ←→ Meta Marketing API
             └→ Create Ads, Get Results, Manage Audiences
```

**Google Ads Connection:**
```
MarketFlow ←→ Google Ads API
             └→ Search Ads, Shopping, Display, YouTube
```

**TikTok Connection:**
```
MarketFlow ←→ TikTok Marketing API
             └→ Video Ads, Spark Ads, Audiences
```

**Email Service:**
```
MarketFlow ←→ SendGrid API
             └→ Send Emails, Track Opens/Clicks
```

---

## Security (Keeping Your Data Safe)

### How We Protect You:

| Protection | What It Does |
|------------|--------------|
| **HTTPS** | All data encrypted in transit |
| **JWT Tokens** | Secure login sessions |
| **Password Hashing** | Passwords are scrambled |
| **API Rate Limiting** | Prevents abuse |
| **Data Encryption** | Sensitive data encrypted at rest |
| **SOC 2 Compliance** | Industry security standards |

### Data Flow Security:
```
Your Browser ──[HTTPS]──▶ CloudFlare (Protection)
                              │
                              ▼
                         Load Balancer
                              │
                              ▼
                         API Server ──▶ Encrypted Database
```

---

## Infrastructure (Where Everything Runs)

### Cloud Setup:

**AWS (Amazon Web Services)**
- **EC2** - Runs our servers
- **RDS** - Manages the database
- **S3** - Stores files (images, videos)
- **CloudFront** - Delivers content fast globally
- **Lambda** - Runs small background tasks

**Vercel**
- Hosts the frontend (super fast)
- Automatic scaling
- Global CDN

### Why This Matters to You:
- **99.9% Uptime** - Always available
- **Fast Globally** - Works quick everywhere
- **Auto-scaling** - Handles traffic spikes
- **Daily Backups** - Your data is safe

---

## Development Workflow (How We Build It)

### Code Organization:
```
marketflow/
├── apps/
│   ├── web/          # Frontend (Next.js)
│   └── api/          # Backend (Node.js)
├── packages/
│   ├── ui/           # Shared components
│   ├── database/     # Database schemas
│   └── integrations/ # External API connections
└── docs/             # Documentation
```

### Development Process:
```
1. Write Code
      │
      ▼
2. Automated Tests Run
      │
      ▼
3. Code Review by Team
      │
      ▼
4. Deploy to Test Environment
      │
      ▼
5. Quality Assurance Testing
      │
      ▼
6. Deploy to Production (Live)
```

---

## Scaling Plan (Growing With You)

### Phase 1: Launch (1,000 users)
- 2 API servers
- 1 Database (with replica)
- Basic caching

### Phase 2: Growth (10,000 users)
- 4 API servers
- Dedicated database cluster
- Advanced caching
- Multiple regions

### Phase 3: Scale (100,000+ users)
- Auto-scaling servers
- Global database distribution
- Enterprise-grade infrastructure
- 24/7 monitoring

---

## Summary for Non-Technical Readers

**Think of MarketFlow like a house:**

- **Frontend** = The rooms you live in (what you see)
- **API** = The electrical system (makes everything work)
- **Database** = The filing cabinets (stores everything)
- **Queue** = The mailbox (handles incoming tasks)
- **AI** = A smart assistant living in the house
- **Integrations** = Doors connecting to other houses (Shopify, Meta, etc.)
- **Security** = Locks, alarms, and guards
- **Infrastructure** = The foundation and land

**The key point:** You don't need to understand HOW it works, just know that it's built with modern, reliable technology used by companies like Netflix, Airbnb, and Shopify themselves.

---

*Technical Architecture Document v1.0*
*MarketFlow - E-Commerce Marketing Automation*
