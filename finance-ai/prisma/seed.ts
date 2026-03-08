import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

const EXPENSE_CATEGORIES = [
  { name: "Transport", slug: "transport", icon: "car", color: "#f59e0b" },
  { name: "Food", slug: "food", icon: "utensils", color: "#ef4444" },
  { name: "Software", slug: "software", icon: "code", color: "#8b5cf6" },
  { name: "IT Infrastructure", slug: "it-infrastructure", icon: "server", color: "#6366f1" },
  { name: "Marketing", slug: "marketing", icon: "megaphone", color: "#ec4899" },
  { name: "Subscriptions", slug: "subscriptions", icon: "credit-card", color: "#14b8a6" },
  { name: "Taxes", slug: "taxes", icon: "landmark", color: "#64748b" },
  { name: "Personal", slug: "personal", icon: "user", color: "#f97316" },
  { name: "Office", slug: "office", icon: "building", color: "#0ea5e9" },
  { name: "Administrative", slug: "administrative", icon: "file-text", color: "#84cc16" },
];

const INCOME_CATEGORIES = [
  { name: "Business Income", slug: "business-income", icon: "briefcase", color: "#10b981" },
  { name: "Dividends", slug: "dividends", icon: "trending-up", color: "#22c55e" },
  { name: "Transfers", slug: "transfers", icon: "arrow-right-left", color: "#06b6d4" },
  { name: "Other Income", slug: "other-income", icon: "plus-circle", color: "#a3e635" },
];

async function main() {
  console.log("Seeding categories...");

  for (const cat of EXPENSE_CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        name: cat.name,
        slug: cat.slug,
        type: "EXPENSE",
        icon: cat.icon,
        color: cat.color,
        isSystem: true,
      },
    });
  }

  for (const cat of INCOME_CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        name: cat.name,
        slug: cat.slug,
        type: "INCOME",
        icon: cat.icon,
        color: cat.color,
        isSystem: true,
      },
    });
  }

  // Seed default classification rules
  const rules = [
    { merchantPattern: "uber", categorySlug: "transport" },
    { merchantPattern: "bolt", categorySlug: "transport" },
    { merchantPattern: "aws", categorySlug: "it-infrastructure" },
    { merchantPattern: "openai", categorySlug: "software" },
    { merchantPattern: "anthropic", categorySlug: "software" },
    { merchantPattern: "github", categorySlug: "software" },
    { merchantPattern: "facebook ads", categorySlug: "marketing" },
    { merchantPattern: "google ads", categorySlug: "marketing" },
    { merchantPattern: "netflix", categorySlug: "subscriptions" },
    { merchantPattern: "spotify", categorySlug: "subscriptions" },
  ];

  for (const rule of rules) {
    const category = await prisma.category.findUnique({
      where: { slug: rule.categorySlug },
    });
    if (!category) continue;

    const existing = await prisma.classificationRule.findFirst({
      where: { merchantPattern: rule.merchantPattern },
    });
    if (existing) continue;

    await prisma.classificationRule.create({
      data: {
        merchantPattern: rule.merchantPattern,
        categoryId: category.id,
        priority: 10,
      },
    });
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
