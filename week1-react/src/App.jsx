import { useAuth } from './hooks/useAuth';
import LoginForm from './components/LoginForm';
import ProductList from './components/ProductList';
import './index.css';

export default function App() {
  const { user, isLoggedIn, login, register, logout } = useAuth();

  return (
    <div className="app">
      <header className="header">
        <h1>CNU 쇼핑몰</h1>
        {isLoggedIn && (
          <div className="header-user">
            <span>안녕하세요, {user.name}님!</span>
            <button onClick={logout} className="btn-logout">
              로그아웃
            </button>
          </div>
        )}
      </header>

      <main className="main">
        {/* isLoggedIn 값에 따라 LoginForm 또는 ProductList를 렌더링 */}
        {isLoggedIn ? (
          <ProductList />
        ) : (
          <LoginForm onLogin={login} onRegister={register} />
        )}
      </main>
    </div>
  );
}
