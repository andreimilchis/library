import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AdReport Pro - Automated Ad Reporting for Agencies",
  description:
    "Send automated performance reports from Facebook Ads, Google Ads, and TikTok Ads to your e-commerce clients.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
