# Step 05: 로그인 폼 — 제어 컴포넌트

> **브랜치:** `week1/step-05`
> **수정 파일:** `src/components/LoginForm.jsx`

---

## 학습 목표

- React에서 폼 입력값을 `useState`로 관리하는 **제어 컴포넌트** 패턴을 이해한다.
- `value`와 `onChange`를 연결해야 하는 이유를 직접 체험한다.
- 에러 상태(`error`)를 UI에 조건부로 표시하는 방법을 익힌다.

---

## 핵심 개념 설명

### 제어 컴포넌트(Controlled Component)란?

HTML 기본 `<input>`은 자체적으로 값을 관리한다(비제어). React에서는 이 값을 **상태로 가져와 React가 제어**하는 것이 권장된다.

```jsx
// ❌ 비제어 (React가 값을 모름)
<input type="text" />

// ✅ 제어 컴포넌트 (React 상태가 값을 제어)
const [name, setName] = useState('');
<input
  value={name}
  onChange={(e) => setName(e.target.value)}
/>
```

- `value={name}`: React 상태를 input 표시값으로 연결
- `onChange`: 사용자가 타이핑할 때마다 상태 업데이트
- 둘 중 하나만 연결하면 안 된다 → `value`만 있으면 읽기 전용이 됨

### 상태 초기값

```js
const [name, setName] = useState('');    // 문자열 → 초기값 '' (null 쓰면 경고 발생)
const [email, setEmail] = useState('');  // 문자열 → 초기값 ''
const [error, setError] = useState(null); // 없을 때 null, 있을 때 문자열
```

---

## 프로젝트 구조

```
src/
├── api/
│   ├── client.js       ✅ Step 01 완성
│   ├── auth.js         ✅ Step 02 완성
│   └── shop.js         ✅ Step 03 완성
├── hooks/
│   └── useAuth.js      ✅ Step 04 완성
└── components/
    ├── LoginForm.jsx   📝 이번 Step — 로그인 폼 제어 컴포넌트
    └── ProductList.jsx
```

---

## 주요 코드

```jsx
// src/components/LoginForm.jsx

export default function LoginForm({ onLogin }) {
  const [name, setName] = useState('');       // ← [실습 5]
  const [email, setEmail] = useState('');     // ← [실습 5]
  const [error, setError] = useState(null);   // ← [실습 5]
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();             // 폼 제출 시 페이지 새로고침 방지
    if (!name.trim()) {
      setError('이름을 입력해주세요');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onLogin(name.trim(), email.trim() || undefined);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={name}                              // ← [실습 5 연결]
        onChange={(e) => setName(e.target.value)} // ← [실습 5 연결]
        placeholder="예: 홍길동"
      />
      {error && <p className="error-msg">{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? '처리 중...' : '로그인'}
      </button>
    </form>
  );
}
```

---

## 프로젝트 실행법

```bash
cd week1-react
npm install      # 최초 1회
npm run dev      # 개발 서버 시작
```

브라우저에서 `http://localhost:3000` 접속.

---

## 확인할 것들

1. **구현 전:** 이름 입력란에 타이핑해도 값이 안 바뀌는지 확인 (읽기 전용 상태)
2. **구현 후:** 타이핑 시 즉시 반영, 빈 이름으로 제출 시 에러 메시지 표시 확인
3. **React DevTools:** 컴포넌트 선택 → `name` 상태가 타이핑마다 바뀌는지 실시간 확인
4. **e.preventDefault()** 제거 후 제출 시 어떤 현상이 발생하는지 실험

---

## 핵심 정리

> **제어 컴포넌트는 `value`와 `onChange`를 모두 연결해 React가 입력값을 완전히 제어하게 한다. 이 패턴 덕분에 입력값 검증, 에러 표시, 조건부 제출 같은 로직을 순수 JS로 다룰 수 있다. Week 2(Next.js)의 로그인 페이지도 완전히 동일한 패턴으로 구현된다.**
