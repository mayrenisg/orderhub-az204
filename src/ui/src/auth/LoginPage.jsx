import { useState } from 'react';
import { useAuth } from './AuthContext';

export default function LoginPage({ apiBaseUrl }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    const response = await fetch(`${apiBaseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.error('Respuesta no JSON:', text);
      return;
    }

    if (!response.ok) {
      console.error('Login error:', data);
      return;
    }

    login(data.accessToken, data.user);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">OrderHub</h1>
        <p className="login-subtitle">Inicia sesión para continuar</p>

        <form className="login-form" onSubmit={handleLogin}>
          <div className="login-field">
            <label className="login-label" htmlFor="login-email">Correo electrónico</label>
            <input
              id="login-email"
              className="login-input"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="login-field">
            <label className="login-label" htmlFor="login-password">Contraseña</label>
            <input
              id="login-password"
              className="login-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="login-btn" type="submit">Iniciar sesión</button>
        </form>
      </div>
    </div>
  );
}
