import { useState, useEffect } from 'react';
import { findUserByName, signUp, loginWithUserId, getMe } from '../api/auth';

export function useAuth() {
  // ============================================================
  // [실습 4-a] user 상태를 useState로 선언하세요
  // 초기값: null (로그인 전에는 유저 정보가 없음)
  //
  // ✅ 모범 정답:
  //   const [user, setUser] = useState(null);
  // ============================================================
  const [user, setUser] = useState(null);

  // 앱 시작 시 localStorage에 토큰이 있으면 자동 로그인 복원
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getMe()
        .then(setUser)
        .catch(() => localStorage.removeItem('token'));
    }
  }, []);

  // 로그인 함수
  // 1. 이름으로 유저 존재 여부 확인
  // 2. 없으면 회원가입 에러 throw → LoginForm이 회원가입 폼 표시
  // 3. 있으면 loginWithUserId → 토큰 발급 → 저장
  const login = async (name) => {
    const foundUser = await findUserByName(name);

    if (!foundUser) {
      throw new Error('존재하지 않는 이름입니다. 회원가입을 진행해주세요.');
    }

    // ============================================================
    // [실습 4-b] 로그인 후 토큰을 localStorage에 저장하세요
    // 1. loginWithUserId(foundUser.id) 로 { token } 받기
    // 2. localStorage.setItem('token', token) 으로 저장
    // 3. setUser(foundUser) 로 상태 업데이트
    //
    // ✅ 모범 정답:
    //   const { token } = await loginWithUserId(foundUser.id);
    //   localStorage.setItem('token', token);
    //   setUser(foundUser);
    // ============================================================
    const { token } = await loginWithUserId(foundUser.id);
    localStorage.setItem('token', token);
    setUser(foundUser);
  };

  // 회원가입 후 바로 로그인
  const register = async (name, email) => {
    const newUser = await signUp(name, email);
    const { token } = await loginWithUserId(newUser.id);
    localStorage.setItem('token', token);
    setUser(newUser);
  };

  // ============================================================
  // [실습 4-c] 로그아웃 함수를 구현하세요
  //
  // ✅ 모범 정답:
  //   const logout = () => {
  //     localStorage.removeItem('token');
  //     setUser(null);
  //   };
  // ============================================================
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return {
    user,
    isLoggedIn: !!user,
    login,
    register,
    logout,
  };
}
