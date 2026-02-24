"use client";

import { useState, useEffect, useCallback } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Invoice {
  id: string;
  seriesPrefix: string;
  number: number;
  total: number;
  currency: string;
}

interface Payment {
  id: string;
  amount: number;
  currency: string;
  paymentDate: string;
  paymentMethod: string;
  reference: string | null;
  notes: string | null;
  invoice: Invoice;
  client: { id: string; name: string };
}

const paymentMethodLabels: Record<string, string> = {
  TRANSFER_BANCAR: "Transfer bancar",
  NUMERAR: "Numerar",
  CARD: "Card",
  OP: "Ordin de plata",
  COMPENSARE: "Compensare",
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    invoiceId: "",
    amount: 0,
    currency: "RON",
    exchangeRate: 1,
    paymentDate: new Date().toISOString().split("T")[0],
    paymentMethod: "TRANSFER_BANCAR",
    reference: "",
    notes: "",
  });

  const loadPayments = useCallback(async () => {
    const res = await fetch("/api/payments");
    const data = await res.json();
    setPayments(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          amount: Number(form.amount),
          exchangeRate: Number(form.exchangeRate),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create payment");
      }

      setShowForm(false);
      setForm({
        invoiceId: "",
        amount: 0,
        currency: "RON",
        exchangeRate: 1,
        paymentDate: new Date().toISOString().split("T")[0],
        paymentMethod: "TRANSFER_BANCAR",
        reference: "",
        notes: "",
      });
      loadPayments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Eroare la inregistrare");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Se incarca...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Plati</h1>
          <p className="text-muted-foreground">Inregistreaza si gestioneaza platile</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          {showForm ? "Anuleaza" : "Plata noua"}
        </button>
      </div>

      {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md">{error}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border p-6 space-y-4">
          <h2 className="font-semibold">Inregistreaza plata</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID Factura *
              </label>
              <input
                value={form.invoiceId}
                onChange={(e) => setForm((prev) => ({ ...prev, invoiceId: e.target.value }))}
                required
                placeholder="Introduceti ID-ul facturii"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Suma *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={form.amount}
                onChange={(e) => setForm((prev) => ({ ...prev, amount: Number(e.target.value) }))}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data plata *</label>
              <input
                type="date"
                value={form.paymentDate}
                onChange={(e) => setForm((prev) => ({ ...prev, paymentDate: e.target.value }))}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Metoda plata</label>
              <select
                value={form.paymentMethod}
                onChange={(e) => setForm((prev) => ({ ...prev, paymentMethod: e.target.value }))}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="TRANSFER_BANCAR">Transfer bancar</option>
                <option value="NUMERAR">Numerar</option>
                <option value="CARD">Card</option>
                <option value="OP">Ordin de plata</option>
                <option value="COMPENSARE">Compensare</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Referinta</label>
              <input
                value={form.reference}
                onChange={(e) => setForm((prev) => ({ ...prev, reference: e.target.value }))}
                placeholder="Nr. tranzactie / ref. bancara"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {saving ? "Se salveaza..." : "Inregistreaza plata"}
            </button>
          </div>
        </form>
      )}

      {payments.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nu exista plati inregistrate.</p>
        </div>
      ) : (
        <div className="rounded-md border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-medium text-muted-foreground">Data</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Factura</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Client</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Suma</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Metoda</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Referinta</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{formatDate(payment.paymentDate)}</td>
                  <td className="p-3 font-medium">
                    {payment.invoice.seriesPrefix}
                    {String(payment.invoice.number).padStart(4, "0")}
                  </td>
                  <td className="p-3">{payment.client.name}</td>
                  <td className="p-3 font-medium">
                    {formatCurrency(payment.amount, payment.currency)}
                  </td>
                  <td className="p-3">
                    {paymentMethodLabels[payment.paymentMethod] ?? payment.paymentMethod}
                  </td>
                  <td className="p-3 text-muted-foreground">{payment.reference || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
