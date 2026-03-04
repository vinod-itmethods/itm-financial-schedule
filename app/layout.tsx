import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Forge | iTmethods Financial Schedule',
  description: 'Forge pricing and financial schedule tool by iTmethods',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}
