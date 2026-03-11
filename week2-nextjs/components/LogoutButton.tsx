'use client';

import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    // 쿠키 삭제: max-age=0으로 즉시 만료
    document.cookie = 'token=; path=/; max-age=0';
    router.push('/login');
    router.refresh();
  };

  return (
    <button onClick={handleLogout} className="btn-logout">
      로그아웃
    </button>
  );
}
