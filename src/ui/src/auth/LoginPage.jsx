import { useState } from 'react';

export default function LoginPage({ apiBaseUrl, onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    const response = await fetch(`${apiBaseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    console.log("LOGIN RESPONSE:", data);

    // 🔥 aquí avisas a App que el login fue exitoso
    onLogin(data.accessToken, data.user);
  };

  return (
    <form onSubmit={handleLogin}>
      <h2>Login</h2>

      <input
        placeholder="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button type="submit">Iniciar sesión</button>
    </form>
  );
}