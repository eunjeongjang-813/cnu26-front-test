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

  // TODO [실습 3-a]: useState로 name, email, error 상태를 선언하세요
  // const [name, setName] = useState('');
  // const [email, setEmail] = useState('');
  // const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [needEmail, setNeedEmail] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('이름을 입력해주세요');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let user = await findUserByName(name.trim());

      if (!user) {
        if (!needEmail) {
          setNeedEmail(true);
          setError('처음 방문이시군요! 이메일을 입력해주세요');
          setLoading(false);
          return;
        }
        if (!email.trim()) {
          setError('이메일을 입력해주세요');
          setLoading(false);
          return;
        }
        user = await signUpUser(name.trim(), email.trim());
      }

      const { token } = await loginUser(user.id);

      // TODO [실습 3-b]: 토큰을 쿠키에 저장하세요
      // Week 1에서는 localStorage를 썼지만, Next.js에서는 쿠키를 사용합니다
      // document.cookie = `token=${token}; path=/; max-age=3600`

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
        <p className="login-desc">이름을 입력해 로그인하세요</p>

        <form onSubmit={handleSubmit} className="login-form">
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

          {needEmail && (
            <div className="form-group">
              <label htmlFor="email">이메일 (첫 방문)</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="예: hong@example.com"
                disabled={loading}
              />
            </div>
          )}

          {error && <p className="error-msg">{error}</p>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? '처리 중...' : needEmail ? '회원가입 & 로그인' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  );
}
