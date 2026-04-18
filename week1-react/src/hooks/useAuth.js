import { useState, useEffect } from 'react';
import { findUserByName, signUp, loginWithUserId, getMe } from '../api/auth';

// 인증 관련 상태와 로직을 캡슐화한 커스텀 훅
// App.jsx에서 사용: const { user, isLoggedIn, login, logout } = useAuth();
export function useAuth() {
  // ============================================================
  // [실습 4-a] user 상태를 useState로 선언하세요
  // 초기값: null (로그인 전에는 유저 정보가 없음)
  //
  // 📝 해설:
  //   useState(null)은 초기값이 null인 상태를 선언합니다.
  //   user가 null이면 "비로그인" 상태, 객체이면 "로그인" 상태로 구분합니다.
  //   반환값 [user, setUser]에서 user는 현재 값, setUser는 값을 변경하는 함수입니다.
  //   App.jsx에서 isLoggedIn: !!user 처럼 user 유무로 UI를 조건부 렌더링합니다.
  // ============================================================
  const [user, setUser] = useState(null); // TODO

  // 앱 시작 시 localStorage에 토큰이 있으면 자동 로그인 복원
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // 토큰이 있으면 내 정보를 가져와서 user 상태 설정
      getMe()
        .then(setUser)
        .catch(() => {
          // 토큰이 만료되었거나 유효하지 않으면 삭제
          localStorage.removeItem('token');
        });
    }
  }, []);

  // 로그인 함수
  // 1. 이름으로 유저 검색
  // 2. 없으면 회원가입 (이메일 추가 입력)
  // 3. 있으면 로그인 → 토큰 발급 → 저장
  const login = async (name, email) => {
    let foundUser = await findUserByName(name);

    if (!foundUser) {
      // 첫 방문: 회원가입
      if (!email) throw new Error('처음 방문이시군요! 이메일을 입력해주세요');
      foundUser = await signUp(name, email);
    }

    // ============================================================
    // [실습 4-b] 로그인 후 토큰을 localStorage에 저장하세요
    // 1. loginWithUserId(foundUser.id) 로 { token } 받기
    // 2. localStorage.setItem('token', token) 으로 저장
    // 3. setUser(foundUser) 로 상태 업데이트
    //
    // 📝 해설:
    //   loginWithUserId()는 async 함수이므로 await으로 결과를 기다립니다.
    //   반환값 { token }을 구조 분해 할당으로 token 문자열만 꺼냅니다.
    //   localStorage.setItem('token', token)으로 토큰을 브라우저에 저장하면
    //   페이지를 새로고침해도 로그인 상태가 유지됩니다 (useEffect의 자동복원 로직).
    //   마지막으로 setUser(foundUser)로 상태를 업데이트해야
    //   React가 리렌더링되어 UI가 로그인 상태로 전환됩니다.
    // ============================================================
    const { token } = await loginWithUserId(foundUser.id); // TODO: 아래 두 줄 구현
    localStorage.setItem('token', token);
    setUser(foundUser);
  };

  // ============================================================
  // [실습 4-c] 로그아웃 함수를 구현하세요
  // 1. localStorage에서 token 제거
  // 2. user 상태를 null로 초기화
  //
  // 📝 해설:
  //   로그아웃은 두 가지 작업이 필요합니다.
  //   1) localStorage.removeItem('token'): 저장된 토큰을 삭제합니다.
  //      이를 하지 않으면 새로고침 시 자동로그인이 다시 실행됩니다.
  //   2) setUser(null): React 상태를 null로 초기화합니다.
  //      isLoggedIn: !!user 가 false가 되어 UI가 로그인 폼으로 전환됩니다.
  //   순서는 바뀌어도 동작하지만, 저장소 정리 → 상태 초기화 순서가 관례적입니다.
  // ============================================================
  const logout = () => {
    localStorage.removeItem('token'); // TODO
    setUser(null);
  };

  return {
    user,
    isLoggedIn: !!user, // user가 null이 아니면 true
    login,
    logout,
  };
}
