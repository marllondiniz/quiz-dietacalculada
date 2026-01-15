import type { Metadata } from 'next';
import './globals.css';
import MetaPixel from '@/components/MetaPixel';

export const metadata: Metadata = {
  title: 'Quiz Dieta Calculada',
  description: 'Quiz personalizado para criar seu plano de dieta',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <MetaPixel />
        {children}
      </body>
    </html>
  );
}

