export const metadata = {
  title: 'SEO Analyzer - Competitor Page Analyzer',
  description: 'Analyze any webpage for on-page SEO metrics',
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
