# EcommSuite.AI

> E-Commerce Marketing Automation SaaS Platform

![Brand Colors](https://img.shields.io/badge/Brand-FF3131%20→%20FF914D-orange?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?style=for-the-badge&logo=typescript)

## Overview

EcommSuite.AI is an all-in-one marketing automation platform for e-commerce businesses. Connect your Shopify store and manage all your marketing from a single dashboard.

### Key Features

- **Shopify Integration** - Auto-sync products, customers, and orders
- **Paid Media Hub** - Manage Meta, Google, and TikTok ads
- **Email Marketing** - Automated campaigns and flows
- **Creative Studio** - AI-powered banner and video creation
- **Analytics Dashboard** - Unified marketing metrics

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis (optional, for queues)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/ecommsuite-ai.git
cd ecommsuite-ai/app

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Set up the database
npx prisma db push
npx prisma generate

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
app/
├── prisma/
│   └── schema.prisma      # Database schema
├── public/                # Static assets
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── dashboard/    # Main dashboard
│   │   ├── ads/          # Ads manager
│   │   ├── emails/       # Email marketing
│   │   ├── creative/     # Creative studio
│   │   ├── analytics/    # Analytics
│   │   ├── settings/     # Settings
│   │   ├── login/        # Authentication
│   │   └── register/     # Registration
│   ├── components/       # React components
│   │   ├── ui/          # Base UI components
│   │   ├── layout/      # Layout components
│   │   ├── dashboard/   # Dashboard widgets
│   │   └── forms/       # Form components
│   ├── lib/             # Utility functions
│   ├── hooks/           # Custom React hooks
│   ├── styles/          # Global styles
│   └── types/           # TypeScript types
├── .env.example         # Environment template
├── package.json
├── tailwind.config.js   # Tailwind + brand colors
└── tsconfig.json
```

## Brand Guidelines

### Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Brand Red | `#FF3131` | Primary buttons, CTAs |
| Brand Orange | `#FF914D` | Gradient end, accents |
| Dark | `#1A1A2E` | Text, headings |
| Gray | `#636366` | Secondary text |

### Gradient

```css
background: linear-gradient(135deg, #FF3131 0%, #FF914D 100%);
```

### Typography

- **Headlines:** Inter Bold
- **Body:** Inter Regular
- **Numbers:** Space Grotesk

## Available Scripts

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npm run db:push      # Push schema to database
npm run db:studio    # Open Prisma Studio
npm run db:generate  # Generate Prisma client
```

## Environment Variables

See `.env.example` for all required environment variables.

### Required for MVP:

- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Auth encryption key
- `SHOPIFY_API_KEY` - Shopify app credentials
- `SENDGRID_API_KEY` - Email service

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/*` | * | Authentication (NextAuth) |
| `/api/shopify/connect` | POST | Connect Shopify store |
| `/api/shopify/sync` | POST | Sync store data |
| `/api/campaigns` | GET/POST | Ad campaigns |
| `/api/emails` | GET/POST | Email campaigns |
| `/api/creatives` | GET/POST | Creative assets |
| `/api/analytics` | GET | Aggregated metrics |

## Integrations

### Shopify
- OAuth 2.0 authentication
- Webhooks for real-time updates
- Product, order, customer sync

### Meta Ads
- Marketing API v18.0
- Campaign management
- Audience creation

### Google Ads
- Search, Shopping, Display
- Merchant Center integration
- Conversion tracking

### TikTok Ads
- Marketing API
- Video ad creation
- Spark Ads support

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Docker

```bash
# Build image
docker build -t ecommsuite-ai .

# Run container
docker run -p 3000:3000 ecommsuite-ai
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing`)
5. Open a Pull Request

## License

Proprietary - All rights reserved.

---

Built with ❤️ for e-commerce entrepreneurs.

**EcommSuite.AI** - Your Marketing on Autopilot
