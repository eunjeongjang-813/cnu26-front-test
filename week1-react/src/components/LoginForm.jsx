import { useState } from 'react';

// Props: onLogin(name, email?) 함수
// - 이름만 입력 → 기존 유저 로그인 시도
// - 이름 + 이메일 입력 → 신규 회원가입 후 로그인
export default function LoginForm({ onLogin }) {
  // ============================================================
  // [실습 5] useState로 아래 3가지 상태를 선언하세요
  // - name: 이름 입력값 (초기값: 빈 문자열)
  // - email: 이메일 입력값 (초기값: 빈 문자열)
  // - error: 오류 메시지 (초기값: null)
  //
  // ✅ 모범 정답:
  //   const [name, setName] = useState('');
  //   const [email, setEmail] = useState('');
  //   const [error, setError] = useState(null);
  //
  // 📝 해설:
  //   폼 입력값은 React 상태로 관리해야 입력할 때마다 UI가 즉시 반영됩니다.
  //   - name, email: 문자열이므로 초기값을 '' (빈 문자열)로 설정합니다.
  //     null로 설정하면 input의 value={null}이 되어 uncontrolled 경고가 발생합니다.
  //   - error: 오류가 없을 때는 null, 있을 때는 문자열로 사용하므로 초기값을 null로 설정합니다.
  //   각 input의 value={name}과 onChange={(e) => setName(e.target.value)}를 연결해야
  //   React가 입력값을 완전히 제어하는 "제어 컴포넌트"가 됩니다.
  // ============================================================
  // TODO [실습 5]: 아래 3가지 상태를 useState로 선언하세요 (초기값 주의!)
  // const [name, setName] = useState('');
  // const [email, setEmail] = useState('');
  // const [error, setError] = useState(null);
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
            {/* ============================================================
                [실습 5 - 연결] input의 value와 onChange를 연결하세요
                힌트: value={name} onChange={(e) => setName(e.target.value)}

                ✅ 모범 정답:
                  value={name}
                  onChange={(e) => setName(e.target.value)}

                📝 해설:
                  value={name}: React 상태를 input의 표시값으로 연결합니다.
                  onChange={(e) => setName(e.target.value)}: 사용자가 타이핑할 때마다
                    e.target.value(현재 input 값)로 상태를 업데이트합니다.
                  이 두 가지를 모두 연결해야 "제어 컴포넌트"가 됩니다.
                  value만 연결하고 onChange를 빠뜨리면 input이 읽기 전용이 되어
                  아무리 타이핑해도 값이 변하지 않습니다.
                ============================================================ */}
            {/* TODO [실습 5 - 연결]: 아래 input에 value={name} 과 onChange={(e) => setName(e.target.value)} 를 추가하세요 */}
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
