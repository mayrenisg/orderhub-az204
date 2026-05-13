import { useState } from 'react';
import LoginPage from './auth/LoginPage';
import OrderHubPage from './orders/OrderHubPage';

function App() {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  const cleanToken = localStorage.getItem('orderhub_token');
  const initialToken =
    cleanToken && cleanToken !== 'undefined' ? cleanToken : null;

  const [token, setToken] = useState(initialToken);

  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('orderhub_user');
    return storedUser && storedUser !== 'undefined'
      ? JSON.parse(storedUser)
      : null;
  });

  // 🔥 LOGIN
  const handleLogin = (accessToken, userData) => {
    localStorage.setItem('orderhub_token', accessToken);
    localStorage.setItem('orderhub_user', JSON.stringify(userData));

    setToken(accessToken);
    setUser(userData);
  };

  // 🔥 LOGOUT (IMPORTANTE)
  const handleLogout = () => {
    localStorage.removeItem('orderhub_token');
    localStorage.removeItem('orderhub_user');

    setToken(null);
    setUser(null);
  };

  if (!token) {
    return <LoginPage apiBaseUrl={apiBaseUrl} onLogin={handleLogin} />;
  }

  return (
    <OrderHubPage
      apiBaseUrl={apiBaseUrl}
      user={user}
      token={token}
      onLogout={handleLogout}
    />
  );
}

export default App;