import { ProductForm } from "@/components/product-form";

export default function NewProductPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Produs / Serviciu nou</h1>
        <p className="text-muted-foreground">
          Adauga un produs sau serviciu in catalog
        </p>
      </div>
      <ProductForm />
    </div>
  );
}
