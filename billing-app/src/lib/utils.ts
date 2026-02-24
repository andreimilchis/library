import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "RON"): string {
  return new Intl.NumberFormat("ro-RO", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("ro-RO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

export function computeLineTotals(
  quantity: number,
  unitPrice: number,
  tvaRate: number,
  discountType?: string | null,
  discountValue?: number | null
): { subtotal: number; tvaAmount: number; lineTotal: number } {
  let subtotal = quantity * unitPrice;

  if (discountType && discountValue) {
    if (discountType === "PERCENTAGE") {
      subtotal = subtotal * (1 - discountValue / 100);
    } else if (discountType === "FIXED") {
      subtotal = subtotal - discountValue;
    }
  }

  const tvaAmount = subtotal * (tvaRate / 100);
  const lineTotal = subtotal + tvaAmount;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    tvaAmount: Math.round(tvaAmount * 100) / 100,
    lineTotal: Math.round(lineTotal * 100) / 100,
  };
}

export function generateInvoiceNumber(prefix: string, number: number): string {
  return `${prefix}${String(number).padStart(4, "0")}`;
}
