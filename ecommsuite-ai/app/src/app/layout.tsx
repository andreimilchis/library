import type { Metadata } from 'next'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'EcommSuite.AI - E-Commerce Marketing Automation',
  description: 'Automate your e-commerce marketing with AI. Manage ads, emails, and creatives from one powerful dashboard.',
  keywords: ['ecommerce', 'marketing automation', 'shopify', 'facebook ads', 'google ads', 'email marketing'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
