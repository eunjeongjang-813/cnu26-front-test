'use client';

// ============================================================
// Providers — 앱 전체에 필요한 Context Provider를 한 곳에 모읍니다
//
// 왜 별도 파일인가?
//   app/layout.tsx는 Server Component입니다.
//   Server Component 안에서 직접 'use client' Context를 사용할 수 없으므로
//   Client Component인 이 파일이 Provider 역할을 합니다.
//
//   RootLayout (Server)
//     └── Providers (Client) ← 'use client' 경계
//           └── CartProvider
//                 └── {children} (각 page.tsx)
// ============================================================

import { CartProvider } from '@/lib/cart-context';

export default function Providers({ children }: { children: React.ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}
