export interface InvoiceLineInput {
  productId?: string | null;
  description: string;
  quantity: number;
  unitOfMeasure: string;
  unitPrice: number;
  tvaRate: number;
  discountType?: "PERCENTAGE" | "FIXED" | null;
  discountValue?: number | null;
  orderIndex: number;
}

export interface CreateInvoiceInput {
  seriesId: string;
  clientId: string;
  type: "FACTURA" | "FACTURA_PROFORMA" | "AVIZ_EXPEDITIE" | "CHITANTA" | "NOTA_CREDIT";
  issueDate: string;
  dueDate: string;
  deliveryDate?: string;
  currency: string;
  exchangeRate: number;
  language: string;
  notes?: string;
  paymentMethod: "TRANSFER_BANCAR" | "NUMERAR" | "CARD" | "OP" | "COMPENSARE";
  reverseCharge: boolean;
  lines: InvoiceLineInput[];
}

export interface DashboardStats {
  totalInvoicedMonth: number;
  totalCollected: number;
  totalOutstanding: number;
  totalOverdue: number;
  recentInvoices: Array<{
    id: string;
    number: string;
    clientName: string;
    total: number;
    currency: string;
    status: string;
    issueDate: string;
  }>;
  topClients: Array<{
    id: string;
    name: string;
    totalRevenue: number;
  }>;
}
