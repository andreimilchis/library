export interface MetricDefinition {
  key: string;
  label: string;
  shortLabel: string;
  description: string;
  format: "currency" | "number" | "percent" | "multiplier";
  category: MetricCategory;
  platforms: ("FACEBOOK_ADS" | "GOOGLE_ADS" | "TIKTOK_ADS")[];
  isCalculated: boolean;
  higherIsBetter: boolean;
}

export type MetricCategory =
  | "cost"
  | "performance"
  | "conversions"
  | "engagement"
  | "ecommerce"
  | "video";

export const METRIC_DEFINITIONS: Record<string, MetricDefinition> = {
  // === COST METRICS ===
  spend: {
    key: "spend",
    label: "Amount Spent",
    shortLabel: "Spent",
    description: "Total amount spent on advertising",
    format: "currency",
    category: "cost",
    platforms: ["FACEBOOK_ADS", "GOOGLE_ADS", "TIKTOK_ADS"],
    isCalculated: false,
    higherIsBetter: false,
  },
  cpc: {
    key: "cpc",
    label: "Cost Per Click",
    shortLabel: "CPC",
    description: "Average cost for each click on your ads",
    format: "currency",
    category: "cost",
    platforms: ["FACEBOOK_ADS", "GOOGLE_ADS", "TIKTOK_ADS"],
    isCalculated: true,
    higherIsBetter: false,
  },
  cpm: {
    key: "cpm",
    label: "Cost Per 1000 Impressions",
    shortLabel: "CPM",
    description: "Average cost per 1,000 impressions",
    format: "currency",
    category: "cost",
    platforms: ["FACEBOOK_ADS", "GOOGLE_ADS", "TIKTOK_ADS"],
    isCalculated: true,
    higherIsBetter: false,
  },
  cpa: {
    key: "cpa",
    label: "Cost Per Acquisition",
    shortLabel: "CPA",
    description: "Average cost for each conversion/acquisition",
    format: "currency",
    category: "cost",
    platforms: ["FACEBOOK_ADS", "GOOGLE_ADS", "TIKTOK_ADS"],
    isCalculated: true,
    higherIsBetter: false,
  },
  cost_per_purchase: {
    key: "cost_per_purchase",
    label: "Cost Per Purchase",
    shortLabel: "CPP",
    description: "Average cost for each purchase",
    format: "currency",
    category: "cost",
    platforms: ["FACEBOOK_ADS", "GOOGLE_ADS", "TIKTOK_ADS"],
    isCalculated: true,
    higherIsBetter: false,
  },
  cost_per_add_to_cart: {
    key: "cost_per_add_to_cart",
    label: "Cost Per Add to Cart",
    shortLabel: "CPATC",
    description: "Average cost for each add-to-cart event",
    format: "currency",
    category: "cost",
    platforms: ["FACEBOOK_ADS", "GOOGLE_ADS", "TIKTOK_ADS"],
    isCalculated: true,
    higherIsBetter: false,
  },

  // === PERFORMANCE METRICS ===
  impressions: {
    key: "impressions",
    label: "Impressions",
    shortLabel: "Impr.",
    description: "Number of times your ads were shown",
    format: "number",
    category: "performance",
    platforms: ["FACEBOOK_ADS", "GOOGLE_ADS", "TIKTOK_ADS"],
    isCalculated: false,
    higherIsBetter: true,
  },
  clicks: {
    key: "clicks",
    label: "Clicks",
    shortLabel: "Clicks",
    description: "Number of clicks on your ads",
    format: "number",
    category: "performance",
    platforms: ["FACEBOOK_ADS", "GOOGLE_ADS", "TIKTOK_ADS"],
    isCalculated: false,
    higherIsBetter: true,
  },
  ctr: {
    key: "ctr",
    label: "Click-Through Rate",
    shortLabel: "CTR",
    description: "Percentage of impressions that resulted in a click",
    format: "percent",
    category: "performance",
    platforms: ["FACEBOOK_ADS", "GOOGLE_ADS", "TIKTOK_ADS"],
    isCalculated: true,
    higherIsBetter: true,
  },
  reach: {
    key: "reach",
    label: "Reach",
    shortLabel: "Reach",
    description: "Number of unique users who saw your ads",
    format: "number",
    category: "performance",
    platforms: ["FACEBOOK_ADS", "TIKTOK_ADS"],
    isCalculated: false,
    higherIsBetter: true,
  },
  frequency: {
    key: "frequency",
    label: "Frequency",
    shortLabel: "Freq.",
    description: "Average number of times each person saw your ad",
    format: "number",
    category: "performance",
    platforms: ["FACEBOOK_ADS", "TIKTOK_ADS"],
    isCalculated: true,
    higherIsBetter: false,
  },

  // === CONVERSION METRICS ===
  conversions: {
    key: "conversions",
    label: "Conversions",
    shortLabel: "Conv.",
    description: "Total number of conversions",
    format: "number",
    category: "conversions",
    platforms: ["FACEBOOK_ADS", "GOOGLE_ADS", "TIKTOK_ADS"],
    isCalculated: false,
    higherIsBetter: true,
  },
  conversion_value: {
    key: "conversion_value",
    label: "Conversion Value",
    shortLabel: "Conv. Value",
    description: "Total value of all conversions",
    format: "currency",
    category: "conversions",
    platforms: ["FACEBOOK_ADS", "GOOGLE_ADS", "TIKTOK_ADS"],
    isCalculated: false,
    higherIsBetter: true,
  },
  conversion_rate: {
    key: "conversion_rate",
    label: "Conversion Rate",
    shortLabel: "CVR",
    description: "Percentage of clicks that resulted in a conversion",
    format: "percent",
    category: "conversions",
    platforms: ["FACEBOOK_ADS", "GOOGLE_ADS", "TIKTOK_ADS"],
    isCalculated: true,
    higherIsBetter: true,
  },
  roas: {
    key: "roas",
    label: "Return on Ad Spend",
    shortLabel: "ROAS",
    description: "Revenue generated for each unit of ad spend",
    format: "multiplier",
    category: "conversions",
    platforms: ["FACEBOOK_ADS", "GOOGLE_ADS", "TIKTOK_ADS"],
    isCalculated: true,
    higherIsBetter: true,
  },

  // === E-COMMERCE METRICS ===
  purchases: {
    key: "purchases",
    label: "Purchases",
    shortLabel: "Purch.",
    description: "Total number of purchases",
    format: "number",
    category: "ecommerce",
    platforms: ["FACEBOOK_ADS", "GOOGLE_ADS", "TIKTOK_ADS"],
    isCalculated: false,
    higherIsBetter: true,
  },
  purchase_value: {
    key: "purchase_value",
    label: "Purchase Value",
    shortLabel: "Purch. Value",
    description: "Total revenue from purchases",
    format: "currency",
    category: "ecommerce",
    platforms: ["FACEBOOK_ADS", "GOOGLE_ADS", "TIKTOK_ADS"],
    isCalculated: false,
    higherIsBetter: true,
  },
  aov: {
    key: "aov",
    label: "Average Order Value",
    shortLabel: "AOV",
    description: "Average value per purchase",
    format: "currency",
    category: "ecommerce",
    platforms: ["FACEBOOK_ADS", "GOOGLE_ADS", "TIKTOK_ADS"],
    isCalculated: true,
    higherIsBetter: true,
  },
  add_to_cart: {
    key: "add_to_cart",
    label: "Add to Cart",
    shortLabel: "ATC",
    description: "Number of add-to-cart events",
    format: "number",
    category: "ecommerce",
    platforms: ["FACEBOOK_ADS", "GOOGLE_ADS", "TIKTOK_ADS"],
    isCalculated: false,
    higherIsBetter: true,
  },
  checkout_initiated: {
    key: "checkout_initiated",
    label: "Checkout Initiated",
    shortLabel: "Checkout",
    description: "Number of initiated checkouts",
    format: "number",
    category: "ecommerce",
    platforms: ["FACEBOOK_ADS", "GOOGLE_ADS", "TIKTOK_ADS"],
    isCalculated: false,
    higherIsBetter: true,
  },
  view_content: {
    key: "view_content",
    label: "Content Views",
    shortLabel: "Views",
    description: "Number of product/content views",
    format: "number",
    category: "ecommerce",
    platforms: ["FACEBOOK_ADS", "TIKTOK_ADS"],
    isCalculated: false,
    higherIsBetter: true,
  },

  // === VIDEO METRICS ===
  video_views: {
    key: "video_views",
    label: "Video Views",
    shortLabel: "Vid. Views",
    description: "Total video views (3+ seconds)",
    format: "number",
    category: "video",
    platforms: ["FACEBOOK_ADS", "TIKTOK_ADS"],
    isCalculated: false,
    higherIsBetter: true,
  },
  video_views_25: {
    key: "video_views_25",
    label: "Video Views 25%",
    shortLabel: "VV 25%",
    description: "Views reaching 25% of video",
    format: "number",
    category: "video",
    platforms: ["FACEBOOK_ADS", "TIKTOK_ADS"],
    isCalculated: false,
    higherIsBetter: true,
  },
  video_views_50: {
    key: "video_views_50",
    label: "Video Views 50%",
    shortLabel: "VV 50%",
    description: "Views reaching 50% of video",
    format: "number",
    category: "video",
    platforms: ["FACEBOOK_ADS", "TIKTOK_ADS"],
    isCalculated: false,
    higherIsBetter: true,
  },
  video_views_75: {
    key: "video_views_75",
    label: "Video Views 75%",
    shortLabel: "VV 75%",
    description: "Views reaching 75% of video",
    format: "number",
    category: "video",
    platforms: ["FACEBOOK_ADS", "TIKTOK_ADS"],
    isCalculated: false,
    higherIsBetter: true,
  },
  video_views_100: {
    key: "video_views_100",
    label: "Video Completions",
    shortLabel: "VV 100%",
    description: "Views reaching 100% of video",
    format: "number",
    category: "video",
    platforms: ["FACEBOOK_ADS", "TIKTOK_ADS"],
    isCalculated: false,
    higherIsBetter: true,
  },
  thumbstop_rate: {
    key: "thumbstop_rate",
    label: "Thumbstop Rate",
    shortLabel: "Thumbstop",
    description: "Percentage of impressions that resulted in 3+ second video view",
    format: "percent",
    category: "video",
    platforms: ["TIKTOK_ADS"],
    isCalculated: true,
    higherIsBetter: true,
  },

  // === ENGAGEMENT METRICS ===
  likes: {
    key: "likes",
    label: "Likes",
    shortLabel: "Likes",
    description: "Number of likes on your ads",
    format: "number",
    category: "engagement",
    platforms: ["FACEBOOK_ADS", "TIKTOK_ADS"],
    isCalculated: false,
    higherIsBetter: true,
  },
  comments: {
    key: "comments",
    label: "Comments",
    shortLabel: "Comments",
    description: "Number of comments on your ads",
    format: "number",
    category: "engagement",
    platforms: ["FACEBOOK_ADS", "TIKTOK_ADS"],
    isCalculated: false,
    higherIsBetter: true,
  },
  shares: {
    key: "shares",
    label: "Shares",
    shortLabel: "Shares",
    description: "Number of shares of your ads",
    format: "number",
    category: "engagement",
    platforms: ["FACEBOOK_ADS", "TIKTOK_ADS"],
    isCalculated: false,
    higherIsBetter: true,
  },
};

export function getMetricsByCategory(
  category: MetricCategory
): MetricDefinition[] {
  return Object.values(METRIC_DEFINITIONS).filter(
    (m) => m.category === category
  );
}

export function getMetricsByPlatform(
  platform: "FACEBOOK_ADS" | "GOOGLE_ADS" | "TIKTOK_ADS"
): MetricDefinition[] {
  return Object.values(METRIC_DEFINITIONS).filter((m) =>
    m.platforms.includes(platform)
  );
}

export function formatMetricValue(
  value: number,
  format: MetricDefinition["format"]
): string {
  switch (format) {
    case "currency":
      return new Intl.NumberFormat("ro-RO", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 2,
      }).format(value);
    case "percent":
      return `${value.toFixed(2)}%`;
    case "multiplier":
      return `${value.toFixed(2)}x`;
    case "number":
      return new Intl.NumberFormat("ro-RO").format(Math.round(value));
    default:
      return value.toString();
  }
}
