import { useState, useEffect } from 'react';
import { findUserByName, signUp, loginWithUserId, getMe } from '../api/auth';

// 인증 관련 상태와 로직을 캡슐화한 커스텀 훅
// App.jsx에서 사용: const { user, isLoggedIn, login, logout } = useAuth();
export function useAuth() {


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

  };

  const logout = () => {

  };

  return {
    user,
    isLoggedIn: !!user, // user가 null이 아니면 true
    login,
    logout,
  };
}
