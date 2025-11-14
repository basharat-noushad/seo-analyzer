import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SEO Analyzer - Competitor Page Analyzer',
  description: 'Analyze any webpage for on-page SEO metrics and compare against competitors',
  keywords: 'SEO, analyzer, competitor analysis, on-page SEO, meta tags',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  );
}
