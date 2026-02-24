"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const unitOptions = [
  "buc", "kg", "g", "m", "m2", "m3", "l", "ml",
  "ora", "zi", "luna", "an", "km", "set", "pac",
];

const tvaRates = [0, 5, 9, 19];

interface ProductFormProps {
  initialData?: {
    id: string;
    name: string;
    description: string | null;
    sku: string | null;
    type: string;
    unitOfMeasure: string;
    defaultPrice: number;
    tvaRate: number;
    currency: string;
    stockTrackingEnabled: boolean;
    currentStock: number;
    minStockAlert: number | null;
    category: string | null;
    isActive: boolean;
  };
}

export function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    sku: initialData?.sku || "",
    type: initialData?.type || "SERVICE",
    unitOfMeasure: initialData?.unitOfMeasure || "buc",
    defaultPrice: initialData?.defaultPrice || 0,
    tvaRate: initialData?.tvaRate || 19,
    currency: initialData?.currency || "RON",
    stockTrackingEnabled: initialData?.stockTrackingEnabled || false,
    currentStock: initialData?.currentStock || 0,
    minStockAlert: initialData?.minStockAlert || 0,
    category: initialData?.category || "",
    isActive: initialData?.isActive ?? true,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = initialData
        ? `/api/products/${initialData.id}`
        : "/api/products";
      const method = initialData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          defaultPrice: Number(form.defaultPrice),
          tvaRate: Number(form.tvaRate),
          currentStock: Number(form.currentStock),
          minStockAlert: form.minStockAlert ? Number(form.minStockAlert) : undefined,
          tags: [],
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      router.push("/products");
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Tip *</label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="SERVICE">Serviciu</option>
            <option value="PRODUCT">Produs</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">SKU / Cod</label>
          <input
            name="sku"
            value={form.sku}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nume *</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descriere</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={2}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pret (fara TVA) *</label>
          <input
            name="defaultPrice"
            type="number"
            step="0.01"
            value={form.defaultPrice}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
          <select
            name="currency"
            value={form.currency}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="RON">RON</option>
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
            <option value="GBP">GBP</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cota TVA</label>
          <select
            name="tvaRate"
            value={form.tvaRate}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            {tvaRates.map((rate) => (
              <option key={rate} value={rate}>
                {rate}%
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">UM</label>
          <select
            name="unitOfMeasure"
            value={form.unitOfMeasure}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            {unitOptions.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Categorie</label>
        <input
          name="category"
          value={form.category}
          onChange={handleChange}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          placeholder="e.g. Consultanta, Web Development"
        />
      </div>

      <div className="space-y-3 border-t pt-4">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="stockTrackingEnabled"
            checked={form.stockTrackingEnabled}
            onChange={handleChange}
            className="rounded"
            id="stockTracking"
          />
          <label htmlFor="stockTracking" className="text-sm font-medium text-gray-700">
            Urmarire stoc
          </label>
        </div>

        {form.stockTrackingEnabled && (
          <div className="grid grid-cols-2 gap-4 ml-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stoc curent
              </label>
              <input
                name="currentStock"
                type="number"
                step="0.01"
                value={form.currentStock}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alerta stoc minim
              </label>
              <input
                name="minStockAlert"
                type="number"
                step="0.01"
                value={form.minStockAlert}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isActive"
            checked={form.isActive}
            onChange={handleChange}
            className="rounded"
            id="isActive"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
            Activ
          </label>
        </div>
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
          {loading ? "Se salveaza..." : initialData ? "Actualizeaza" : "Salveaza"}
        </button>
      </div>
    </form>
  );
}
