import { ClientForm } from "@/components/client-form";

export default function NewClientPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Client nou</h1>
        <p className="text-muted-foreground">
          Adauga un client nou in baza de date
        </p>
      </div>
      <ClientForm />
    </div>
  );
}
