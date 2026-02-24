"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const clientTypes = [
  { value: "SRL", label: "SRL" },
  { value: "PFA", label: "PFA" },
  { value: "II", label: "II" },
  { value: "IF", label: "IF" },
  { value: "SA", label: "SA" },
  { value: "PERSOANA_FIZICA", label: "Persoana fizica" },
];

interface ClientFormProps {
  initialData?: {
    id: string;
    type: string;
    name: string;
    cui: string | null;
    jNumber: string | null;
    address: string | null;
    city: string | null;
    county: string | null;
    country: string;
    contactPerson: string | null;
    email: string | null;
    phone: string | null;
    paymentTermDays: number;
    creditLimit: number | null;
    notes: string | null;
  };
}

export function ClientForm({ initialData }: ClientFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetchingAnaf, setFetchingAnaf] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    type: initialData?.type || "SRL",
    name: initialData?.name || "",
    cui: initialData?.cui || "",
    jNumber: initialData?.jNumber || "",
    address: initialData?.address || "",
    city: initialData?.city || "",
    county: initialData?.county || "",
    country: initialData?.country || "Romania",
    contactPerson: initialData?.contactPerson || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    paymentTermDays: initialData?.paymentTermDays || 30,
    creditLimit: initialData?.creditLimit || 0,
    notes: initialData?.notes || "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const fetchFromAnaf = async () => {
    if (!form.cui) return;
    setFetchingAnaf(true);
    setError("");

    try {
      const res = await fetch("/api/anaf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cui: form.cui }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch from ANAF");
      }

      const data = await res.json();
      setForm((prev) => ({
        ...prev,
        name: data.name || prev.name,
        address: data.address || prev.address,
        jNumber: data.jNumber || prev.jNumber,
        phone: data.phone || prev.phone,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Eroare la interogare ANAF");
    } finally {
      setFetchingAnaf(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = initialData
        ? `/api/clients/${initialData.id}`
        : "/api/clients";
      const method = initialData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          paymentTermDays: Number(form.paymentTermDays),
          creditLimit: form.creditLimit ? Number(form.creditLimit) : undefined,
          tags: [],
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save client");
      }

      router.push("/clients");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Eroare la salvare");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg border p-6">
      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md">{error}</div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tip client
          </label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            {clientTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CUI / CIF
          </label>
          <div className="flex gap-2">
            <input
              name="cui"
              value={form.cui}
              onChange={handleChange}
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="e.g. RO12345678"
            />
            <button
              type="button"
              onClick={fetchFromAnaf}
              disabled={fetchingAnaf || !form.cui}
              className="rounded-md bg-gray-100 px-3 py-2 text-xs font-medium hover:bg-gray-200 disabled:opacity-50 whitespace-nowrap"
            >
              {fetchingAnaf ? "Se incarca..." : "Auto ANAF"}
            </button>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nume companie / persoana *
        </label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nr. Reg. Comertului (J)
          </label>
          <input
            name="jNumber"
            value={form.jNumber}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="J40/1234/2020"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Termen plata (zile)
          </label>
          <input
            name="paymentTermDays"
            type="number"
            value={form.paymentTermDays}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Adresa
        </label>
        <input
          name="address"
          value={form.address}
          onChange={handleChange}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Oras</label>
          <input
            name="city"
            value={form.city}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Judet</label>
          <input
            name="county"
            value={form.county}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tara</label>
          <input
            name="country"
            value={form.country}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Persoana contact
          </label>
          <input
            name="contactPerson"
            value={form.contactPerson}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Note
        </label>
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          rows={3}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

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
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Se salveaza..." : initialData ? "Actualizeaza" : "Salveaza client"}
        </button>
      </div>
    </form>
  );
}
