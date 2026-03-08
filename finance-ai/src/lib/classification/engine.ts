/**
 * Transaction Classification Engine
 *
 * Automatically classifies transactions based on merchant name, category code,
 * and description using a rule-based system with fallback patterns.
 */

import { prisma } from "@/lib/db";

interface ClassificationResult {
  categoryId: string | null;
  status: "CLASSIFIED" | "NEEDS_REVIEW";
  confidence: number;
}

// Built-in merchant-to-category mapping patterns
const MERCHANT_PATTERNS: Record<string, { category: string; subCategory?: string }> = {
  // Transport
  "uber": { category: "transport", subCategory: "ride-hailing" },
  "bolt": { category: "transport", subCategory: "ride-hailing" },
  "taxi": { category: "transport", subCategory: "taxi" },
  "omv": { category: "transport", subCategory: "fuel" },
  "petrom": { category: "transport", subCategory: "fuel" },
  "mol": { category: "transport", subCategory: "fuel" },
  "rompetrol": { category: "transport", subCategory: "fuel" },

  // Food & Dining
  "mcdonalds": { category: "food", subCategory: "fast-food" },
  "mcdonald": { category: "food", subCategory: "fast-food" },
  "kfc": { category: "food", subCategory: "fast-food" },
  "starbucks": { category: "food", subCategory: "coffee" },
  "tazz": { category: "food", subCategory: "delivery" },
  "glovo": { category: "food", subCategory: "delivery" },
  "bolt food": { category: "food", subCategory: "delivery" },
  "foodpanda": { category: "food", subCategory: "delivery" },
  "restaurant": { category: "food", subCategory: "restaurant" },

  // IT & Software
  "amazon web services": { category: "it-infrastructure" },
  "aws": { category: "it-infrastructure" },
  "google cloud": { category: "it-infrastructure" },
  "microsoft azure": { category: "it-infrastructure" },
  "digital ocean": { category: "it-infrastructure" },
  "digitalocean": { category: "it-infrastructure" },
  "vercel": { category: "it-infrastructure" },
  "heroku": { category: "it-infrastructure" },
  "openai": { category: "software", subCategory: "ai-tools" },
  "anthropic": { category: "software", subCategory: "ai-tools" },
  "github": { category: "software", subCategory: "dev-tools" },
  "gitlab": { category: "software", subCategory: "dev-tools" },
  "jetbrains": { category: "software", subCategory: "dev-tools" },
  "figma": { category: "software", subCategory: "design" },
  "notion": { category: "software", subCategory: "productivity" },
  "slack": { category: "software", subCategory: "communication" },
  "zoom": { category: "software", subCategory: "communication" },
  "google workspace": { category: "software", subCategory: "productivity" },
  "microsoft 365": { category: "software", subCategory: "productivity" },
  "apple": { category: "software" },

  // Marketing
  "facebook ads": { category: "marketing", subCategory: "social-ads" },
  "meta ads": { category: "marketing", subCategory: "social-ads" },
  "google ads": { category: "marketing", subCategory: "search-ads" },
  "tiktok ads": { category: "marketing", subCategory: "social-ads" },
  "linkedin ads": { category: "marketing", subCategory: "social-ads" },
  "mailchimp": { category: "marketing", subCategory: "email" },

  // Subscriptions & Entertainment
  "netflix": { category: "subscriptions", subCategory: "entertainment" },
  "spotify": { category: "subscriptions", subCategory: "entertainment" },
  "youtube": { category: "subscriptions", subCategory: "entertainment" },
  "hbo": { category: "subscriptions", subCategory: "entertainment" },
  "disney": { category: "subscriptions", subCategory: "entertainment" },

  // Administrative
  "anaf": { category: "taxes", subCategory: "state-taxes" },
  "impozit": { category: "taxes", subCategory: "state-taxes" },
  "contabil": { category: "taxes", subCategory: "accounting" },

  // Personal
  "emag": { category: "personal", subCategory: "shopping" },
  "amazon": { category: "personal", subCategory: "shopping" },
  "altex": { category: "personal", subCategory: "electronics" },
  "ikea": { category: "personal", subCategory: "home" },
  "dedeman": { category: "personal", subCategory: "home" },
};

// MCC (Merchant Category Code) to category mapping
const MCC_PATTERNS: Record<string, string> = {
  "4121": "transport",       // Taxicabs/Limousines
  "4131": "transport",       // Bus Lines
  "5411": "food",            // Grocery Stores
  "5812": "food",            // Eating Places, Restaurants
  "5814": "food",            // Fast Food Restaurants
  "5541": "transport",       // Service Stations
  "5542": "transport",       // Fuel Dealers
  "7372": "software",        // Computer Programming
  "7379": "it-infrastructure", // Computer Maintenance
  "5734": "software",        // Computer Software Stores
  "7311": "marketing",       // Advertising Services
  "7941": "subscriptions",   // Athletic Clubs
  "4899": "subscriptions",   // Cable/Satellite TV
  "9311": "taxes",           // Tax Payments
  "8931": "taxes",           // Accounting
};

export async function classifyTransaction(transactionId: string): Promise<ClassificationResult> {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
  });

  if (!transaction) {
    throw new Error(`Transaction ${transactionId} not found`);
  }

  // Step 1: Check custom rules from database
  const customRule = await matchCustomRule(transaction.merchantName, transaction.description);
  if (customRule) {
    return { categoryId: customRule, status: "CLASSIFIED", confidence: 1.0 };
  }

  // Step 2: Match merchant name against built-in patterns
  if (transaction.merchantName) {
    const merchantMatch = matchMerchantPattern(transaction.merchantName);
    if (merchantMatch) {
      const category = await findOrCreateCategory(merchantMatch.category, transaction.direction);
      if (category) {
        return { categoryId: category.id, status: "CLASSIFIED", confidence: 0.9 };
      }
    }
  }

  // Step 3: Match MCC code
  if (transaction.merchantCategory) {
    const mccMatch = MCC_PATTERNS[transaction.merchantCategory];
    if (mccMatch) {
      const category = await findOrCreateCategory(mccMatch, transaction.direction);
      if (category) {
        return { categoryId: category.id, status: "CLASSIFIED", confidence: 0.7 };
      }
    }
  }

  // Step 4: Match description keywords
  if (transaction.description) {
    const descriptionMatch = matchMerchantPattern(transaction.description);
    if (descriptionMatch) {
      const category = await findOrCreateCategory(descriptionMatch.category, transaction.direction);
      if (category) {
        return { categoryId: category.id, status: "CLASSIFIED", confidence: 0.6 };
      }
    }
  }

  // Could not classify
  return { categoryId: null, status: "NEEDS_REVIEW", confidence: 0 };
}

function matchMerchantPattern(text: string): { category: string; subCategory?: string } | null {
  const lower = text.toLowerCase();
  for (const [pattern, match] of Object.entries(MERCHANT_PATTERNS)) {
    if (lower.includes(pattern)) {
      return match;
    }
  }
  return null;
}

async function matchCustomRule(merchantName: string | null, description: string | null): Promise<string | null> {
  const rules = await prisma.classificationRule.findMany({
    where: { isActive: true },
    orderBy: { priority: "desc" },
  });

  const textToMatch = [merchantName, description].filter(Boolean).join(" ").toLowerCase();

  for (const rule of rules) {
    if (textToMatch.includes(rule.merchantPattern.toLowerCase())) {
      return rule.categoryId;
    }
  }

  return null;
}

async function findOrCreateCategory(slug: string, direction: "INCOME" | "EXPENSE") {
  let category = await prisma.category.findUnique({ where: { slug } });
  if (!category) {
    category = await prisma.category.create({
      data: {
        name: slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        slug,
        type: direction,
        isSystem: true,
      },
    });
  }
  return category;
}

export async function classifyPendingTransactions(): Promise<number> {
  const pending = await prisma.transaction.findMany({
    where: { classificationStatus: "PENDING" },
    take: 100,
  });

  let classified = 0;

  for (const transaction of pending) {
    const result = await classifyTransaction(transaction.id);
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        categoryId: result.categoryId,
        classificationStatus: result.status,
      },
    });
    classified++;
  }

  return classified;
}
