import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BillingApp - The Horsemen Agency",
  description: "Billing, Invoicing & Inventory Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro">
      <body className="antialiased">{children}</body>
    </html>
  );
}
