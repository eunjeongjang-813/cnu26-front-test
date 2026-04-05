import { useState } from 'react';

export default function LoginForm({ onLogin, onRegister }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  // 이름으로 로그인 시도
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('이름을 입력해주세요');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onLogin(name.trim());
    } catch (err) {
      // 이름 없음 → 회원가입 폼 표시
      setError(err.message);
      setShowSignup(true);
    } finally {
      setLoading(false);
    }
  };

  // 이름 + 이메일로 회원가입 후 로그인
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('이름과 이메일을 모두 입력해주세요');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onRegister(name.trim(), email.trim());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>CNU 쇼핑몰 로그인</h2>

        {!showSignup ? (
          // 로그인 폼
          <form onSubmit={handleLogin} className="login-form">
            <p className="login-desc">이름을 입력하세요</p>
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
