import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NETkyu Contract Signer",
  description: "Internal cloud-based document signing for NETkyu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
