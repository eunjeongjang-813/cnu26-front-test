'use client';
// ============================================================
// [실습 3] 'use client' 선언 이유를 생각해보세요
// → useState, form 이벤트(onSubmit, onChange) 사용 → Client Component 필요
// ============================================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { findUserByName, signUpUser, loginUser } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();

  // ============================================================
  // [실습 3-a] useState로 name, email, error 상태를 선언하세요
  // (Week 1과 동일한 패턴)
  // ============================================================
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  // 이름으로 로그인 시도
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('이름을 입력해주세요');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const user = await findUserByName(name.trim());

      if (!user) {
        setError('존재하지 않는 이름입니다. 회원가입을 진행해주세요.');
        setShowSignup(true);
        return;
      }

      const { token } = await loginUser(user.id);

      // ============================================================
      // [실습 3-b] 토큰을 쿠키에 저장하세요
      // Week 1에서는 localStorage를 썼지만, Next.js에서는 쿠키를 사용합니다
      // 이유: Server Component와 middleware에서 쿠키를 읽을 수 있기 때문
      //
      // document.cookie = `token=${token}; path=/; max-age=3600`
      // ============================================================
      document.cookie = `token=${token}; path=/; max-age=3600`;

      router.push('/shop');
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  // 이름 + 이메일로 회원가입 후 로그인
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('이름과 이메일을 모두 입력해주세요');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const newUser = await signUpUser(name.trim(), email.trim());
      const { token } = await loginUser(newUser.id);
      document.cookie = `token=${token}; path=/; max-age=3600`;
      router.push('/shop');
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>CNU 쇼핑몰</h2>

        {!showSignup ? (
          // 로그인 폼
          <form onSubmit={handleLogin} className="login-form">
            <p className="login-desc">이름을 입력해 로그인하세요</p>
            <div className="form-group">
              <label htmlFor="name">이름</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 홍길동"
                disabled={loading}
              />
            </div>
            {error && <p className="error-msg">{error}</p>}
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? '확인 중...' : '로그인'}
            </button>
          </form>
        ) : (
          // 회원가입 폼
          <form onSubmit={handleRegister} className="login-form">
            <p className="login-desc">처음 방문이시군요! 정보를 입력해주세요</p>
            <div className="form-group">
              <label htmlFor="name">이름</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 홍길동"
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">이메일</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="예: hong@example.com"
                disabled={loading}
              />
            </div>
            {error && <p className="error-msg">{error}</p>}
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? '처리 중...' : '회원가입 & 로그인'}
            </button>
            <button
              type="button"
              className="btn-back"
              onClick={() => { setShowSignup(false); setError(null); setName(''); }}
              disabled={loading}
            >
              ← 돌아가기
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
