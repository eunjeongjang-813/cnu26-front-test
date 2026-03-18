# Step 03: 로그인 페이지 — Client Component

> 브랜치: `week2/step-03`

## 학습 목표
- 언제 `'use client'`를 선언해야 하는지 이해한다
- Next.js에서 localStorage 대신 쿠키를 사용하는 이유를 이해한다

## 핵심 개념
- `'use client'`: useState, 이벤트 핸들러 사용 시 필요
- `document.cookie`: 브라우저에서 쿠키 설정
- `path=/; max-age=3600`: 전체 경로에서 1시간 유효

## 구현

`app/login/page.tsx`의 TODO 2곳을 완성하세요:

```ts
// 3-a: 상태 선언 (Week 1과 동일한 패턴)
const [name, setName] = useState('');
const [email, setEmail] = useState('');
const [error, setError] = useState<string | null>(null);

// 3-b: 토큰을 쿠키에 저장 (localStorage 대신)
document.cookie = `token=${token}; path=/; max-age=3600`;
```

## 전체 흐름

```
LoginPage (Client) → loginUser(userId) → { token }
→ document.cookie = `token=${token}; ...`
→ router.push('/shop') → proxy.ts가 쿠키 확인 → 통과
```

## 이번 Step 에서 수정된 파일
- `app/login/page.tsx` — 로그인 폼 Client Component

## 생각해볼 점
- Server Component에서는 `document.cookie`를 쓸 수 없다. 왜일까?
- Week 1과 Week 2 로그인의 차이점은 무엇인가?
