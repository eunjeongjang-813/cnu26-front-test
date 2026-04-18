import { useState } from 'react';

// Props: onLogin(name, email?) 함수
// - 이름만 입력 → 기존 유저 로그인 시도
// - 이름 + 이메일 입력 → 신규 회원가입 후 로그인
export default function LoginForm({ onLogin }) {
  const [name, setName] = useState('');       // TODO
  const [email, setEmail] = useState('');     // TODO
  const [error, setError] = useState(null);   // TODO
  const [loading, setLoading] = useState(false);
  const [needEmail, setNeedEmail] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('이름을 입력해주세요');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onLogin(name.trim(), email.trim() || undefined);
    } catch (err) {
      // 이메일이 필요한 경우 (신규 유저)
      if (err.message.includes('이메일')) {
        setNeedEmail(true);
        setError(err.message);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>CNU 쇼핑몰 로그인</h2>
        <p className="login-desc">이름을 입력하면 자동으로 로그인됩니다</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="name">이름</label>
            <input
              id="name"
              type="text"
              placeholder="예: 홍길동"
              disabled={loading}
            />
          </div>

          {/* 신규 유저인 경우에만 이메일 필드 표시 */}
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
