import { useState, useEffect } from 'react';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [token, setToken] = useState('');
  const [role, setRole] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [consultants, setConsultants] = useState([]);
  const [nextConsultant, setNextConsultant] = useState(null);

  const api = 'http://localhost:4000';

  const login = async () => {
    setMessage('');
    const res = await fetch(`${api}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (res.ok) {
      const data = await res.json();
      setToken(data.token);
      setRole(data.role);
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
    } else {
      setMessage('Invalid credentials');
    }
  };

  const loadConsultants = async () => {
    setMessage('');
    const res = await fetch(`${api}/consultants`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setConsultants(data);
    } else {
      setMessage('Failed to load consultants');
    }
  };

  const assign = async () => {
    setMessage('');
    setNextConsultant(null);
    const res = await fetch(`${api}/assign`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setNextConsultant(data);
    } else {
      const err = await res.json();
      setMessage(err.error || 'Error assigning');
    }
  };

  useEffect(() => {
    const t = localStorage.getItem('token');
    const r = localStorage.getItem('role');
    if (t && r) {
      setToken(t);
      setRole(r);
    }
  }, []);

  if (!token) {
    return (
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  padding: 0;
  font-family: Arial, Helvetica, sans-serif;
  background-color: #f7f7f7;
  color: #333;
}

button {
  cursor: pointer;
}
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
          <input
<main className="flex items-center justify-center min-h-screen">
  <div className="bg-white shadow p-6 rounded w-full max-w-md">
    <h1 className="text-2xl font-bold text-center mb-4">Round-robin Demo</h1>
    <input
      className="border p-2 rounded w-full mb-3"
      placeholder="Username"
      value={username}
      onChange={e => setUsername(e.target.value)}
    />
    <input
      className="border p-2 rounded w-full mb-3"
      placeholder="Password"
      type="password"
      value={password}
      onChange={e => setPassword(e.target.value)}
    />
    <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full" onClick={login}>Login</button>
    {message && <p className="mt-3 text-center text-red-600">{message}</p>}
  </div>
</main>
        </div>
      </main>
    );
  }

  if (role === 'admin') {
    return (
<main className="flex items-center justify-center min-h-screen">
  <div className="bg-white shadow p-6 rounded w-full max-w-md">
    <h1 className="text-2xl font-bold text-center mb-4">Admin Dashboard</h1>
    <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full" onClick={loadConsultants}>Load Consultants</button>
    <ul className="mt-4 list-disc list-inside">
      {consultants.map(c => (
        <li key={c.id}>{c.name} {c.active ? '' : '(inactive)'}</li>
      ))}
    </ul>
    {message && <p className="mt-3 text-center text-red-600">{message}</p>}
  </div>
</main>
            {consultants.map(c => (
              <li key={c.id}>{c.name} {c.active ? '' : '(inactive)'}</li>
            ))}
          </ul>
 codex/improve-front-end-elegance
          {message && <p className="mt-3 text-center text-red-600">{message}</p>}

          {message && <p className={styles.message}>{message}</p>}
 main
        </div>
      </main>
    );
  }

  return (
 codex/improve-front-end-elegance
    <main className="flex items-center justify-center min-h-screen">
      <div className="bg-white shadow p-6 rounded w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">User Dashboard</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full" onClick={assign}>Get Next Consultant</button>
        {nextConsultant && <p className="mt-4">Assigned to {nextConsultant.name}</p>}
        {message && <p className="mt-3 text-red-600">{message}</p>}

    <main className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>User Dashboard</h1>
        <button className={styles.button} onClick={assign}>Get Next Consultant</button>
        {nextConsultant && <p>Assigned to {nextConsultant.name}</p>}
        {message && <p className={styles.message}>{message}</p>}
 main
      </div>
    </main>
  );
}
