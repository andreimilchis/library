"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { computeLineTotals, formatCurrency } from "@/lib/utils";

const tvaRates = [0, 5, 9, 19];
const paymentMethods = [
  { value: "TRANSFER_BANCAR", label: "Transfer bancar" },
  { value: "NUMERAR", label: "Numerar" },
  { value: "CARD", label: "Card" },
  { value: "OP", label: "Ordin de plata" },
  { value: "COMPENSARE", label: "Compensare" },
];

interface LineItem {
  productId: string | null;
  description: string;
  quantity: number;
  unitOfMeasure: string;
  unitPrice: number;
  tvaRate: number;
  discountType: "PERCENTAGE" | "FIXED" | null;
  discountValue: number | null;
}

interface Props {
  clients: Array<{ id: string; name: string; cui: string | null; paymentTermDays: number }>;
  products: Array<{
    id: string;
    name: string;
    defaultPrice: number;
    tvaRate: number;
    unitOfMeasure: string;
    currency: string;
  }>;
  series: Array<{ id: string; prefix: string; currentNumber: number; type: string }>;
}

function emptyLine(): LineItem {
  return {
    productId: null,
    description: "",
    quantity: 1,
    unitOfMeasure: "buc",
    unitPrice: 0,
    tvaRate: 19,
    discountType: null,
    discountValue: null,
  };
}

export function InvoiceForm({ clients, products, series }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const today = new Date().toISOString().split("T")[0];
  const defaultDue = new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];

  const [form, setForm] = useState({
    seriesId: series[0]?.id || "",
    clientId: "",
    type: "FACTURA" as const,
    issueDate: today,
    dueDate: defaultDue,
    deliveryDate: "",
    currency: "RON",
    exchangeRate: 1,
    language: "RO",
    notes: "",
    paymentMethod: "TRANSFER_BANCAR" as const,
    reverseCharge: false,
  });

  const [lines, setLines] = useState<LineItem[]>([emptyLine()]);

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleClientChange = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    if (client) {
      const dueDate = new Date(
        Date.now() + client.paymentTermDays * 86400000
      ).toISOString().split("T")[0];
      setForm((prev) => ({ ...prev, clientId, dueDate }));
    }
  };

  const handleLineChange = useCallback(
    (index: number, field: keyof LineItem, value: string | number | null) => {
      setLines((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], [field]: value };
        return updated;
      });
    },
    []
  );

  const handleProductSelect = useCallback(
    (index: number, productId: string) => {
      const product = products.find((p) => p.id === productId);
      if (product) {
        setLines((prev) => {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            productId,
            description: product.name,
            unitPrice: product.defaultPrice,
            tvaRate: product.tvaRate,
            unitOfMeasure: product.unitOfMeasure,
          };
          return updated;
        });
      }
    },
    [products]
  );

  const addLine = () => setLines((prev) => [...prev, emptyLine()]);

  const removeLine = (index: number) => {
    if (lines.length <= 1) return;
    setLines((prev) => prev.filter((_, i) => i !== index));
  };

  // Calculate totals
  let subtotal = 0;
  let totalTva = 0;
  const lineComputations = lines.map((line) => {
    const computed = computeLineTotals(
      line.quantity,
      line.unitPrice,
      line.tvaRate,
      line.discountType,
      line.discountValue
    );
    subtotal += computed.subtotal;
    totalTva += computed.tvaAmount;
    return computed;
  });
  const total = subtotal + totalTva;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          exchangeRate: Number(form.exchangeRate),
          lines: lines.map((line, i) => ({
            ...line,
            quantity: Number(line.quantity),
            unitPrice: Number(line.unitPrice),
            tvaRate: Number(line.tvaRate),
            discountValue: line.discountValue ? Number(line.discountValue) : null,
            orderIndex: i,
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create invoice");
      }

      const invoice = await res.json();
      router.push(`/invoices/${invoice.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Eroare la creare factura");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md">{error}</div>
      )}

      {/* Header section */}
      <div className="bg-white rounded-lg border p-6 space-y-4">
        <h2 className="font-semibold">Detalii factura</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Seria *</label>
            <select
              name="seriesId"
              value={form.seriesId}
              onChange={handleFormChange}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">Selecteaza seria</option>
              {series.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.prefix} (urmatorul: {s.currentNumber + 1})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tip</label>
            <select
              name="type"
              value={form.type}
              onChange={handleFormChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="FACTURA">Factura fiscala</option>
              <option value="FACTURA_PROFORMA">Factura proforma</option>
              <option value="AVIZ_EXPEDITIE">Aviz de expeditie</option>
              <option value="NOTA_CREDIT">Nota de credit</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data emitere *</label>
            <input
              type="date"
              name="issueDate"
              value={form.issueDate}
              onChange={handleFormChange}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data scadenta *</label>
            <input
              type="date"
              name="dueDate"
              value={form.dueDate}
              onChange={handleFormChange}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Client *</label>
            <select
              value={form.clientId}
              onChange={(e) => handleClientChange(e.target.value)}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">Selecteaza client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.cui ? `(${c.cui})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
            <select
              name="currency"
              value={form.currency}
              onChange={handleFormChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="RON">RON</option>
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
              <option value="GBP">GBP</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Metoda plata</label>
            <select
              name="paymentMethod"
              value={form.paymentMethod}
              onChange={handleFormChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              {paymentMethods.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {form.currency !== "RON" && (
          <div className="max-w-xs">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Curs valutar (RON)
            </label>
            <input
              type="number"
              name="exchangeRate"
              step="0.0001"
              value={form.exchangeRate}
              onChange={handleFormChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="reverseCharge"
            checked={form.reverseCharge}
            onChange={handleFormChange}
            id="reverseCharge"
            className="rounded"
          />
          <label htmlFor="reverseCharge" className="text-sm text-gray-700">
            Taxare inversa (reverse charge)
          </label>
        </div>
      </div>

      {/* Line items */}
      <div className="bg-white rounded-lg border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Linii factura</h2>
          <button
            type="button"
            onClick={addLine}
            className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium hover:bg-gray-200"
          >
            <Plus className="h-4 w-4" />
            Adauga linie
          </button>
        </div>

        <div className="space-y-3">
          {lines.map((line, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-end border-b pb-3">
              <div className="col-span-3">
                {index === 0 && (
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Produs / Descriere
                  </label>
                )}
                <select
                  value={line.productId || ""}
                  onChange={(e) => handleProductSelect(index, e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm mb-1"
                >
                  <option value="">Selecteaza produs...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <input
                  value={line.description}
                  onChange={(e) => handleLineChange(index, "description", e.target.value)}
                  placeholder="Descriere *"
                  required
                  className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
                />
              </div>

              <div className="col-span-1">
                {index === 0 && (
                  <label className="block text-xs font-medium text-gray-500 mb-1">Cant.</label>
                )}
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={line.quantity}
                  onChange={(e) => handleLineChange(index, "quantity", Number(e.target.value))}
                  className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
                />
              </div>

              <div className="col-span-1">
                {index === 0 && (
                  <label className="block text-xs font-medium text-gray-500 mb-1">UM</label>
                )}
                <input
                  value={line.unitOfMeasure}
                  onChange={(e) => handleLineChange(index, "unitOfMeasure", e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
                />
              </div>

              <div className="col-span-2">
                {index === 0 && (
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Pret unitar (fara TVA)
                  </label>
                )}
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={line.unitPrice}
                  onChange={(e) => handleLineChange(index, "unitPrice", Number(e.target.value))}
                  className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
                />
              </div>

              <div className="col-span-1">
                {index === 0 && (
                  <label className="block text-xs font-medium text-gray-500 mb-1">TVA %</label>
                )}
                <select
                  value={line.tvaRate}
                  onChange={(e) => handleLineChange(index, "tvaRate", Number(e.target.value))}
                  className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
                >
                  {tvaRates.map((r) => (
                    <option key={r} value={r}>
                      {r}%
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                {index === 0 && (
                  <label className="block text-xs font-medium text-gray-500 mb-1">TVA / Total</label>
                )}
                <div className="text-sm space-y-0.5">
                  <div className="text-muted-foreground">
                    TVA: {formatCurrency(lineComputations[index]?.tvaAmount ?? 0, form.currency)}
                  </div>
                  <div className="font-medium">
                    {formatCurrency(lineComputations[index]?.lineTotal ?? 0, form.currency)}
                  </div>
                </div>
              </div>

              <div className="col-span-2 flex gap-1">
                {lines.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLine(index)}
                    className="rounded-md p-1.5 text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64 space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Subtotal (fara TVA):</span>
              <span>{formatCurrency(subtotal, form.currency)}</span>
            </div>
            <div className="flex justify-between">
              <span>TVA total:</span>
              <span>{formatCurrency(totalTva, form.currency)}</span>
            </div>
            <div className="flex justify-between font-bold text-base border-t pt-1">
              <span>TOTAL:</span>
              <span>{formatCurrency(total, form.currency)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white rounded-lg border p-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Observatii / Note
        </label>
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleFormChange}
          rows={3}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          placeholder="Note suplimentare pe factura..."
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          Anuleaza
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Se creeaza..." : "Emite factura"}
        </button>
      </div>
    </form>
  );
}
