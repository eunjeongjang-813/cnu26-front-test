import type { Metadata } from 'next';
import './globals.css';
import Providers from './providers';

export const metadata: Metadata = {
  title: 'CNU 쇼핑몰',
  description: '충남대 React/Next.js 실습 쇼핑몰',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        {/*
          Providers는 Client Component입니다.
          Server Component인 layout에서 'use client' Context를 직접 쓸 수 없어
          이 패턴으로 감쌉니다.
        */}
        <Providers>
          <div className="app-wrapper">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
