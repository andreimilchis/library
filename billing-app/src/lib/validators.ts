import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email invalid"),
  password: z.string().min(6, "Parola trebuie sa aiba minim 6 caractere"),
});

export const clientSchema = z.object({
  type: z.enum(["PFA", "SRL", "II", "IF", "SA", "PERSOANA_FIZICA"]),
  name: z.string().min(1, "Numele este obligatoriu"),
  cui: z.string().optional(),
  jNumber: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  county: z.string().optional(),
  country: z.string().default("Romania"),
  contactPerson: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  paymentTermDays: z.coerce.number().int().min(0).default(30),
  creditLimit: z.coerce.number().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

export const productSchema = z.object({
  name: z.string().min(1, "Numele produsului este obligatoriu"),
  description: z.string().optional(),
  sku: z.string().optional(),
  type: z.enum(["PRODUCT", "SERVICE"]),
  unitOfMeasure: z.string().default("buc"),
  defaultPrice: z.coerce.number().min(0).default(0),
  tvaRate: z.coerce.number().min(0).max(100).default(19),
  currency: z.string().default("RON"),
  stockTrackingEnabled: z.boolean().default(false),
  currentStock: z.coerce.number().default(0),
  minStockAlert: z.coerce.number().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
});

export const invoiceLineSchema = z.object({
  productId: z.string().nullable().optional(),
  description: z.string().min(1, "Descrierea este obligatorie"),
  quantity: z.coerce.number().min(0.01, "Cantitatea trebuie sa fie > 0"),
  unitOfMeasure: z.string().default("buc"),
  unitPrice: z.coerce.number().min(0),
  tvaRate: z.coerce.number().min(0).max(100).default(19),
  discountType: z.enum(["PERCENTAGE", "FIXED"]).nullable().optional(),
  discountValue: z.coerce.number().nullable().optional(),
  orderIndex: z.coerce.number().default(0),
});

export const invoiceSchema = z.object({
  seriesId: z.string().min(1, "Seria este obligatorie"),
  clientId: z.string().min(1, "Clientul este obligatoriu"),
  type: z.enum(["FACTURA", "FACTURA_PROFORMA", "AVIZ_EXPEDITIE", "CHITANTA", "NOTA_CREDIT"]).default("FACTURA"),
  issueDate: z.string().min(1),
  dueDate: z.string().min(1),
  deliveryDate: z.string().optional(),
  currency: z.string().default("RON"),
  exchangeRate: z.coerce.number().min(0).default(1),
  language: z.string().default("RO"),
  notes: z.string().optional(),
  paymentMethod: z.enum(["TRANSFER_BANCAR", "NUMERAR", "CARD", "OP", "COMPENSARE"]).default("TRANSFER_BANCAR"),
  reverseCharge: z.boolean().default(false),
  lines: z.array(invoiceLineSchema).min(1, "Adaugati cel putin o linie"),
});

export const companySchema = z.object({
  name: z.string().min(1, "Numele companiei este obligatoriu"),
  cui: z.string().min(1, "CUI este obligatoriu"),
  jNumber: z.string().optional(),
  address: z.string().min(1, "Adresa este obligatorie"),
  city: z.string().min(1, "Orasul este obligatoriu"),
  county: z.string().min(1, "Judetul este obligatoriu"),
  country: z.string().default("Romania"),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  website: z.string().optional(),
  tvaRegistered: z.boolean().default(true),
  tvaRateDefault: z.coerce.number().default(19),
  defaultPaymentTerms: z.coerce.number().int().min(0).default(30),
  defaultCurrency: z.string().default("RON"),
});

export const paymentSchema = z.object({
  invoiceId: z.string().min(1),
  amount: z.coerce.number().min(0.01, "Suma trebuie sa fie > 0"),
  currency: z.string().default("RON"),
  exchangeRate: z.coerce.number().default(1),
  paymentDate: z.string().min(1),
  paymentMethod: z.enum(["TRANSFER_BANCAR", "NUMERAR", "CARD", "OP", "COMPENSARE"]).default("TRANSFER_BANCAR"),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ClientInput = z.infer<typeof clientSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type InvoiceInput = z.infer<typeof invoiceSchema>;
export type CompanyInput = z.infer<typeof companySchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;
