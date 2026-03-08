import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Finance AI - Personal Financial Intelligence",
  description: "AI-powered personal finance operating system connected to Revolut",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
