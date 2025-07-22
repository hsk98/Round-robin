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
      <main className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>Round-robin Demo</h1>
          <input
            className={styles.input}
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
          <input
            className={styles.input}
            placeholder="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button className={styles.button} onClick={login}>Login</button>
          {message && <p className={styles.message}>{message}</p>}
        </div>
      </main>
    );
  }

  if (role === 'admin') {
    return (
      <main className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>Admin Dashboard</h1>
          <button className={styles.button} onClick={loadConsultants}>Load Consultants</button>
          <ul>
            {consultants.map(c => (
              <li key={c.id}>{c.name} {c.active ? '' : '(inactive)'}</li>
            ))}
          </ul>
          {message && <p className={styles.message}>{message}</p>}
        </div>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>User Dashboard</h1>
        <button className={styles.button} onClick={assign}>Get Next Consultant</button>
        {nextConsultant && <p>Assigned to {nextConsultant.name}</p>}
        {message && <p className={styles.message}>{message}</p>}
      </div>
    </main>
  );
}
