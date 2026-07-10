import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('orderhub_token');
    const savedUser = localStorage.getItem('orderhub_user');
    if (savedToken && savedToken !== 'undefined')
      setToken(savedToken);
    if (savedUser && savedUser !== 'undefined')
      setUser(JSON.parse(savedUser));
  }, []);

  const login = (accessToken, userData) => {
    localStorage.setItem('orderhub_token', accessToken);
    localStorage.setItem('orderhub_user', JSON.stringify(userData));
    setToken(accessToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('orderhub_token');
    localStorage.removeItem('orderhub_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error('useAuth must be used within AuthProvider');
  return context;
}
