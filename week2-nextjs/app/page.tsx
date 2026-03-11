import { redirect } from 'next/navigation';

// 루트 경로(/) 접근 시 /shop으로 이동
export default function HomePage() {
  redirect('/shop');
}
