# EcommSuite.AI Integration Guide

## Overview

This document explains how EcommSuite.AI connects to external platforms in **simple terms**. Think of integrations as "bridges" that let EcommSuite.AI talk to other services.

---

## 1. SHOPIFY INTEGRATION

### What It Does

Shopify is your online store. EcommSuite.AI connects to it to get:
- Your products (names, descriptions, images, prices)
- Your customers (who bought what, email addresses)
- Your orders (what's selling, revenue data)
- Your inventory (what's in stock)

### How It Works (The Simple Version)

```
YOUR SHOPIFY STORE                    ECOMMSUITE.AI
      │                                   │
      │   1. You click "Connect"          │
      ├──────────────────────────────────▶│
      │                                   │
      │   2. Shopify asks: "Allow         │
      │◀──────────────────────────────────┤
      │      EcommSuite.AI access?"          │
      │                                   │
      │   3. You click "Yes, Allow"       │
      ├──────────────────────────────────▶│
      │                                   │
      │   4. Connection established!      │
      │◀─────────────────────────────────▶│
      │      Data flows automatically     │
```

### What Data We Access

| Data Type | What We Get | Why We Need It |
|-----------|-------------|----------------|
| Products | Title, description, images, price, variants | To create ads and emails about your products |
| Customers | Name, email, purchase history | To send personalized emails |
| Orders | Order details, revenue, dates | To track what's selling |
| Inventory | Stock levels | To avoid promoting out-of-stock items |

### Sync Schedule

| Data | How Often |
|------|-----------|
| Products | Every 1 hour |
| Orders | Every 15 minutes |
| Customers | Every 6 hours |
| Inventory | Every 30 minutes |

### Step-by-Step Setup

1. **Go to Settings → Integrations**
2. **Click "Connect Shopify"**
3. **Enter your store URL** (example: yourstore.myshopify.com)
4. **Click "Connect"**
5. **You'll be redirected to Shopify**
6. **Review permissions and click "Install App"**
7. **Done!** Your products will start syncing

### Permissions Requested

```
EcommSuite.AI will request access to:

✓ Read products         - See your product catalog
✓ Read orders          - See your sales data
✓ Read customers       - See customer information
✓ Read inventory       - See stock levels
✓ Read store info      - Basic store details

We NEVER request:
✗ Write access to products
✗ Financial information
✗ Store settings
```

---

## 2. META (FACEBOOK & INSTAGRAM) INTEGRATION

### What It Does

Meta integration lets you:
- Create and run Facebook & Instagram ads
- Target specific audiences
- Track ad performance
- Access your pixel data

### How It Works

```
FACEBOOK BUSINESS                     ECOMMSUITE.AI
      │                                   │
      │   1. Click "Connect Meta"         │
      ├──────────────────────────────────▶│
      │                                   │
      │   2. Login to Facebook            │
      │◀──────────────────────────────────┤
      │                                   │
      │   3. Select Ad Account            │
      ├──────────────────────────────────▶│
      │                                   │
      │   4. Grant permissions            │
      ├──────────────────────────────────▶│
      │                                   │
      │   5. Connection complete!         │
      │◀─────────────────────────────────▶│
```

### What You Can Do

| Feature | Description |
|---------|-------------|
| Create Campaigns | Launch new ad campaigns |
| Manage Budgets | Set and adjust spending |
| Target Audiences | Choose who sees your ads |
| Upload Creatives | Add images and videos |
| View Performance | See clicks, conversions, ROAS |
| Create Lookalikes | Find new customers like your best ones |

### Requirements

Before connecting, you need:
- A Facebook Business Manager account
- An active Ad Account
- Payment method set up in Meta
- Admin access to the Ad Account

### Step-by-Step Setup

1. **Go to Settings → Integrations → Meta**
2. **Click "Connect Meta Account"**
3. **Log in to your Facebook account**
4. **Select your Business Manager**
5. **Choose your Ad Account(s)**
6. **Select your Facebook Page(s)**
7. **Grant all requested permissions**
8. **Click "Connect"**

### Permissions Explained

```
EcommSuite.AI requests these Meta permissions:

ads_management        → Create and manage your ads
ads_read             → View ad performance data
pages_read           → Access your Facebook pages
pages_manage_ads     → Run ads from your pages
business_management  → Access Business Manager
instagram_basic      → Connect Instagram accounts
instagram_content    → Post to Instagram
```

### What Syncs

| Data | Direction | Frequency |
|------|-----------|-----------|
| Campaigns | Both ways | Real-time |
| Ad Sets | Both ways | Real-time |
| Ads | Both ways | Real-time |
| Performance | From Meta | Every 3 hours |
| Audiences | Both ways | On demand |

---

## 3. GOOGLE ADS INTEGRATION

### What It Does

Google Ads integration enables:
- Search ads (text ads in Google search)
- Shopping ads (product images in Google)
- Display ads (banners on websites)
- YouTube ads (video ads)

### How It Works

```
GOOGLE ADS                            ECOMMSUITE.AI
      │                                   │
      │   1. Click "Connect Google"       │
      ├──────────────────────────────────▶│
      │                                   │
      │   2. Sign in to Google            │
      │◀──────────────────────────────────┤
      │                                   │
      │   3. Select your Ads account      │
      ├──────────────────────────────────▶│
      │                                   │
      │   4. Approve access               │
      ├──────────────────────────────────▶│
      │                                   │
      │   5. Connected! Ready to go       │
      │◀─────────────────────────────────▶│
```

### Campaign Types Supported

| Type | What It Is | Best For |
|------|------------|----------|
| Search | Text ads in search results | People actively searching |
| Shopping | Product images with prices | E-commerce products |
| Display | Banner ads on websites | Brand awareness |
| Video | YouTube ads | Storytelling |
| Performance Max | AI-optimized across all | Automated approach |

### Requirements

- Google Ads account
- Verified payment method
- Merchant Center (for Shopping ads)
- Admin access to the account

### Step-by-Step Setup

1. **Go to Settings → Integrations → Google**
2. **Click "Connect Google Ads"**
3. **Sign in with your Google account**
4. **Select your Google Ads customer ID**
5. **Also connect Google Merchant Center (for Shopping)**
6. **Authorize access**
7. **You're connected!**

### For Shopping Ads (Extra Steps)

To run Shopping ads, you also need Google Merchant Center:

1. **Connect Merchant Center**
2. **Verify your website**
3. **Upload product feed** (EcommSuite.AI does this automatically from Shopify!)
4. **Link to Google Ads**

### Data That Syncs

| Data | From/To | Use |
|------|---------|-----|
| Campaigns | Both ways | Manage from EcommSuite.AI |
| Keywords | Both ways | Search ad targeting |
| Products | To Google | Shopping ads |
| Performance | From Google | Reporting |
| Conversions | From Google | Track sales |

---

## 4. TIKTOK ADS INTEGRATION

### What It Does

TikTok integration lets you:
- Create video ad campaigns
- Target younger audiences
- Use trending sounds and effects
- Track performance

### How It Works

```
TIKTOK BUSINESS                       ECOMMSUITE.AI
      │                                   │
      │   1. Click "Connect TikTok"       │
      ├──────────────────────────────────▶│
      │                                   │
      │   2. Log in to TikTok             │
      │◀──────────────────────────────────┤
      │                                   │
      │   3. Select Advertiser Account    │
      ├──────────────────────────────────▶│
      │                                   │
      │   4. Approve permissions          │
      ├──────────────────────────────────▶│
      │                                   │
      │   5. Ready to create TikToks!     │
      │◀─────────────────────────────────▶│
```

### Campaign Types

| Type | Description |
|------|-------------|
| In-Feed Ads | Appear in the For You feed |
| Spark Ads | Boost existing organic TikToks |
| TopView | First ad users see when opening |
| Branded Effects | Custom filters and effects |

### Requirements

- TikTok Business Center account
- TikTok Advertiser account
- Payment method added
- Verified business (recommended)

### Step-by-Step Setup

1. **Go to Settings → Integrations → TikTok**
2. **Click "Connect TikTok Ads"**
3. **Log in to TikTok Business Center**
4. **Select your Advertiser Account**
5. **Grant permissions**
6. **Connected!**

### Tips for TikTok Success

- Videos should be 15-60 seconds
- Use trending sounds
- Keep it authentic (not too polished)
- Hook viewers in first 3 seconds
- Include clear call-to-action

---

## 5. EMAIL SERVICE (SendGrid)

### What It Does

SendGrid powers all email sending:
- Transactional emails (order confirmations)
- Marketing emails (newsletters, promotions)
- Automated flows (abandoned cart, welcome series)

### How It Works

**This is automatic!** EcommSuite.AI handles the SendGrid connection for you. You don't need to set up anything.

```
ECOMMSUITE.AI                            SENDGRID
      │                                   │
      │   You create an email             │
      │   You click "Send"                │
      │                                   │
      │   EcommSuite.AI sends to SendGrid    │
      ├──────────────────────────────────▶│
      │                                   │
      │   SendGrid delivers to inboxes    │
      │                                   │──▶ 📧 Customer receives
      │                                   │
      │   SendGrid reports back           │
      │◀──────────────────────────────────┤
      │   (opens, clicks, bounces)        │
```

### What's Tracked

| Metric | Meaning |
|--------|---------|
| Sent | Emails successfully sent |
| Delivered | Emails that reached inbox |
| Opened | Emails that were opened |
| Clicked | Links that were clicked |
| Bounced | Emails that failed |
| Unsubscribed | People who opted out |

### Email Limits by Plan

| Plan | Emails/Month |
|------|--------------|
| Starter | 10,000 |
| Growth | 50,000 |
| Scale | 200,000 |
| Enterprise | Unlimited |

---

## 6. ANALYTICS CONNECTIONS

### Google Analytics 4

Track website visitors and behavior:

1. **Go to Settings → Integrations → Analytics**
2. **Click "Connect Google Analytics"**
3. **Select your GA4 property**
4. **Authorize**

### Facebook Pixel

Track conversions from Facebook ads:
- Automatically connected with Meta integration
- Pixel data flows into EcommSuite.AI

### TikTok Pixel

Track conversions from TikTok ads:
- Automatically connected with TikTok integration
- Events sync to EcommSuite.AI

---

## Integration Status Dashboard

```
INTEGRATION STATUS
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Shopify        ● Connected     Last sync: 5 mins ago      │
│  Meta Ads       ● Connected     Last sync: 2 hours ago     │
│  Google Ads     ● Connected     Last sync: 3 hours ago     │
│  TikTok Ads     ○ Not Connected [Connect Now]              │
│  Email Service  ● Active        10,234 emails sent         │
│                                                             │
└─────────────────────────────────────────────────────────────┘

● Green = Connected & Working
○ Gray = Not Connected
● Yellow = Connection Issue
● Red = Error - Needs Attention
```

---

## Troubleshooting Common Issues

### "Connection Failed"

**Possible causes:**
1. Wrong login credentials
2. Insufficient permissions
3. Account suspended
4. Network issue

**Solutions:**
1. Try logging in directly to the platform first
2. Check you have admin access
3. Verify the account is in good standing
4. Wait a few minutes and try again

### "Sync Not Working"

**Possible causes:**
1. Token expired
2. API limits reached
3. Data format issue

**Solutions:**
1. Disconnect and reconnect the integration
2. Wait for rate limits to reset (usually 24 hours)
3. Contact support if issue persists

### "Missing Data"

**Possible causes:**
1. Permissions not fully granted
2. Data takes time to sync
3. Filter settings excluding data

**Solutions:**
1. Re-authorize with all permissions
2. Wait for next sync cycle
3. Check date range and filters

---

## Data Privacy & Security

### What We Store

| Data | Stored | Encrypted |
|------|--------|-----------|
| API tokens | Yes | Yes (AES-256) |
| Product data | Yes | Yes |
| Customer emails | Yes | Yes |
| Payment info | No | N/A |
| Ad account passwords | No | N/A |

### What We NEVER Store

- Your ad platform passwords
- Full credit card numbers
- Social security numbers
- Personal addresses

### Compliance

- **GDPR** compliant (European data protection)
- **CCPA** compliant (California privacy)
- **SOC 2** certified (security standards)

---

## Quick Reference: Integration Checklist

### Before You Start

- [ ] Shopify store is active
- [ ] Facebook Business Manager set up
- [ ] Google Ads account created
- [ ] TikTok Business Center ready
- [ ] Admin access to all platforms

### Connection Order (Recommended)

1. **First:** Connect Shopify (needed for product data)
2. **Second:** Connect Meta (largest ad platform)
3. **Third:** Connect Google (search and shopping)
4. **Fourth:** Connect TikTok (optional, if targeting younger demos)

### After Connecting

- [ ] Verify product sync completed
- [ ] Check customer data imported
- [ ] Test creating a draft campaign
- [ ] Set up tracking pixels
- [ ] Configure notification preferences

---

*Integration Guide v1.0*
*EcommSuite.AI - E-Commerce Marketing Automation*
