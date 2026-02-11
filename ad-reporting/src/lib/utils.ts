import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency = "EUR"): string {
  return new Intl.NumberFormat("ro-RO", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat("ro-RO", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

export function formatCompactNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toFixed(0);
}

export function calculateMetric(
  metricKey: string,
  data: {
    spend: number;
    conversions: number;
    conversionValue: number;
    clicks: number;
    impressions: number;
    purchases: number;
    purchaseValue: number;
    addToCart: number;
    reach: number;
  }
): number {
  switch (metricKey) {
    case "cpa":
      return data.conversions > 0 ? data.spend / data.conversions : 0;
    case "roas":
      return data.spend > 0 ? data.conversionValue / data.spend : 0;
    case "ctr":
      return data.impressions > 0
        ? (data.clicks / data.impressions) * 100
        : 0;
    case "cpc":
      return data.clicks > 0 ? data.spend / data.clicks : 0;
    case "cpm":
      return data.impressions > 0
        ? (data.spend / data.impressions) * 1000
        : 0;
    case "conversion_rate":
      return data.clicks > 0 ? (data.conversions / data.clicks) * 100 : 0;
    case "aov":
      return data.purchases > 0 ? data.purchaseValue / data.purchases : 0;
    case "cost_per_add_to_cart":
      return data.addToCart > 0 ? data.spend / data.addToCart : 0;
    case "cost_per_purchase":
      return data.purchases > 0 ? data.spend / data.purchases : 0;
    case "frequency":
      return data.reach > 0 ? data.impressions / data.reach : 0;
    case "spend":
      return data.spend;
    case "conversions":
      return data.conversions;
    case "conversion_value":
      return data.conversionValue;
    case "clicks":
      return data.clicks;
    case "impressions":
      return data.impressions;
    case "purchases":
      return data.purchases;
    case "purchase_value":
      return data.purchaseValue;
    case "add_to_cart":
      return data.addToCart;
    case "reach":
      return data.reach;
    default:
      return 0;
  }
}
