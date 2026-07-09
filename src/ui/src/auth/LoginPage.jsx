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

const text = await response.text();

let data;

try {
  data = JSON.parse(text);
} catch {
  console.error("Respuesta no JSON:", text);
  return;
}

if (!response.ok) {
  console.error("Login error:", data);
  return;
}

console.log("LOGIN RESPONSE:", data);

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