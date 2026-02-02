import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '학습 도우미 챗봇',
  description: 'AI 기반 학습 도우미 챗봇',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-gray-100">{children}</body>
    </html>
  );
}
