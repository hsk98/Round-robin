import { useState, useEffect } from 'react';

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
      <main style={{ padding: '2rem' }}>
        <h1>Round-robin Demo</h1>
        <div>
          <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
        </div>
        <div>
          <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <button onClick={login}>Login</button>
        {message && <p>{message}</p>}
      </main>
    );
  }

  if (role === 'admin') {
    return (
      <main style={{ padding: '2rem' }}>
        <h1>Admin Dashboard</h1>
        <button onClick={loadConsultants}>Load Consultants</button>
        <ul>
          {consultants.map(c => (
            <li key={c.id}>{c.name} {c.active ? '' : '(inactive)'}</li>
          ))}
        </ul>
        {message && <p>{message}</p>}
      </main>
    );
  }

  return (
    <main style={{ padding: '2rem' }}>
      <h1>User Dashboard</h1>
      <button onClick={assign}>Get Next Consultant</button>
      {nextConsultant && <p>Assigned to {nextConsultant.name}</p>}
      {message && <p>{message}</p>}
    </main>
  );
}
