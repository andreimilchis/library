"use client";

import { useState, useEffect } from "react";

interface Series {
  id: string;
  prefix: string;
  currentNumber: number;
  type: string;
  isActive: boolean;
}

interface CompanyData {
  id?: string;
  name: string;
  cui: string;
  jNumber: string;
  address: string;
  city: string;
  county: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  tvaRegistered: boolean;
  tvaRateDefault: number;
  defaultPaymentTerms: number;
  defaultCurrency: string;
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState<"company" | "series">("company");
  const [series, setSeries] = useState<Series[]>([]);
  const [newSeriesPrefix, setNewSeriesPrefix] = useState("");
  const [newSeriesType, setNewSeriesType] = useState("FACTURA");

  const [company, setCompany] = useState<CompanyData>({
    name: "",
    cui: "",
    jNumber: "",
    address: "",
    city: "",
    county: "",
    country: "Romania",
    phone: "",
    email: "",
    website: "",
    tvaRegistered: true,
    tvaRateDefault: 19,
    defaultPaymentTerms: 30,
    defaultCurrency: "RON",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/company").then((r) => r.json()),
      fetch("/api/series").then((r) => r.json()),
    ]).then(([companyData, seriesData]) => {
      if (companyData) {
        setCompany({
          id: companyData.id,
          name: companyData.name || "",
          cui: companyData.cui || "",
          jNumber: companyData.jNumber || "",
          address: companyData.address || "",
          city: companyData.city || "",
          county: companyData.county || "",
          country: companyData.country || "Romania",
          phone: companyData.phone || "",
          email: companyData.email || "",
          website: companyData.website || "",
          tvaRegistered: companyData.tvaRegistered ?? true,
          tvaRateDefault: companyData.tvaRateDefault ?? 19,
          defaultPaymentTerms: companyData.defaultPaymentTerms ?? 30,
          defaultCurrency: companyData.defaultCurrency || "RON",
        });
      }
      setSeries(seriesData || []);
      setLoading(false);
    });
  }, []);

  const handleCompanyChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setCompany((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setCompany((prev) => ({ ...prev, [name]: value }));
    }
  };

  const saveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/company", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...company,
          tvaRateDefault: Number(company.tvaRateDefault),
          defaultPaymentTerms: Number(company.defaultPaymentTerms),
        }),
      });

      if (!res.ok) throw new Error("Failed to save");
      setSuccess("Setarile au fost salvate cu succes");
    } catch {
      setError("Eroare la salvare");
    } finally {
      setSaving(false);
    }
  };

  const addSeries = async () => {
    if (!newSeriesPrefix) return;
    try {
      const res = await fetch("/api/series", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prefix: newSeriesPrefix.toUpperCase(),
          type: newSeriesType,
          startNumber: 0,
        }),
      });

      if (!res.ok) throw new Error("Failed to create series");
      const created = await res.json();
      setSeries((prev) => [...prev, created]);
      setNewSeriesPrefix("");
    } catch {
      setError("Eroare la crearea seriei");
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
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Setari</h1>
        <p className="text-muted-foreground">Configureaza compania si aplicatia</p>
      </div>

      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab("company")}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            activeTab === "company"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Companie
        </button>
        <button
          onClick={() => setActiveTab("series")}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            activeTab === "series"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Serii facturi
        </button>
      </div>

      {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md">{error}</div>}
      {success && <div className="bg-green-50 text-green-600 text-sm p-3 rounded-md">{success}</div>}

      {activeTab === "company" && (
        <form onSubmit={saveCompany} className="bg-white rounded-lg border p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nume companie *</label>
              <input
                name="name"
                value={company.name}
                onChange={handleCompanyChange}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CUI / CIF *</label>
              <input
                name="cui"
                value={company.cui}
                onChange={handleCompanyChange}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nr. Reg. Com. (J)</label>
              <input
                name="jNumber"
                value={company.jNumber}
                onChange={handleCompanyChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
              <input
                name="phone"
                value={company.phone}
                onChange={handleCompanyChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adresa *</label>
            <input
              name="address"
              value={company.address}
              onChange={handleCompanyChange}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Oras *</label>
              <input
                name="city"
                value={company.city}
                onChange={handleCompanyChange}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Judet *</label>
              <input
                name="county"
                value={company.county}
                onChange={handleCompanyChange}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tara</label>
              <input
                name="country"
                value={company.country}
                onChange={handleCompanyChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                name="email"
                type="email"
                value={company.email}
                onChange={handleCompanyChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
              <input
                name="website"
                value={company.website}
                onChange={handleCompanyChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="border-t pt-4 space-y-4">
            <h3 className="font-medium">Setari fiscale</h3>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="tvaRegistered"
                checked={company.tvaRegistered}
                onChange={handleCompanyChange}
                id="tvaRegistered"
                className="rounded"
              />
              <label htmlFor="tvaRegistered" className="text-sm text-gray-700">
                Platitor de TVA
              </label>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cota TVA implicita</label>
                <select
                  name="tvaRateDefault"
                  value={company.tvaRateDefault}
                  onChange={handleCompanyChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="0">0%</option>
                  <option value="5">5%</option>
                  <option value="9">9%</option>
                  <option value="19">19%</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Termen plata (zile)</label>
                <input
                  name="defaultPaymentTerms"
                  type="number"
                  value={company.defaultPaymentTerms}
                  onChange={handleCompanyChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Moneda implicita</label>
                <select
                  name="defaultCurrency"
                  value={company.defaultCurrency}
                  onChange={handleCompanyChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="RON">RON</option>
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Se salveaza..." : "Salveaza setarile"}
            </button>
          </div>
        </form>
      )}

      {activeTab === "series" && (
        <div className="bg-white rounded-lg border p-6 space-y-4">
          <h3 className="font-medium">Serii facturi</h3>

          {series.length > 0 && (
            <div className="divide-y">
              {series.map((s) => (
                <div key={s.id} className="flex items-center justify-between py-3">
                  <div>
                    <span className="font-mono font-medium">{s.prefix}</span>
                    <span className="ml-2 text-sm text-muted-foreground">
                      Numar curent: {s.currentNumber}
                    </span>
                    <span className="ml-2 text-xs bg-gray-100 px-2 py-0.5 rounded">
                      {s.type}
                    </span>
                  </div>
                  <span
                    className={`text-xs ${s.isActive ? "text-green-600" : "text-gray-400"}`}
                  >
                    {s.isActive ? "Activa" : "Inactiva"}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-2">Adauga serie noua</h4>
            <div className="flex gap-2">
              <input
                value={newSeriesPrefix}
                onChange={(e) => setNewSeriesPrefix(e.target.value)}
                placeholder="Prefix (e.g. HRS)"
                className="rounded-md border border-gray-300 px-3 py-2 text-sm w-40"
              />
              <select
                value={newSeriesType}
                onChange={(e) => setNewSeriesType(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="FACTURA">Factura</option>
                <option value="FACTURA_PROFORMA">Proforma</option>
                <option value="AVIZ_EXPEDITIE">Aviz</option>
                <option value="CHITANTA">Chitanta</option>
                <option value="NOTA_CREDIT">Nota credit</option>
              </select>
              <button
                type="button"
                onClick={addSeries}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Adauga
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
