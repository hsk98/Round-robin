import { useState, useEffect } from 'react';

export default function Admin() {
  const [token, setToken] = useState('');
  const [consultants, setConsultants] = useState([]);
  const [message, setMessage] = useState('');

  const api = 'http://localhost:4000';

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (t) {
      setToken(t);
    } else {
      setMessage('Please log in as manager first.');
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    fetch(`${api}/consultants`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(setConsultants)
      .catch(() => setMessage('Failed to load consultants'));
  }, [token]);

  const toggle = async (id, active) => {
    const res = await fetch(`${api}/consultants/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ active })
    });
    if (!res.ok) {
      setMessage('Failed to update');
      return;
    }
    setConsultants(cs => cs.map(c => c.id === id ? { ...c, active } : c));
  };

  if (!token) {
    return <p className="p-4 text-center text-red-600">{message}</p>;
  }

  return (
    <main className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">Admin Dashboard</h1>
      <table className="w-full border border-gray-300">
        <thead>
          <tr>
            <th className="border p-2 text-left">Name</th>
            <th className="border p-2">Active</th>
          </tr>
        </thead>
        <tbody>
          {consultants.map(c => (
            <tr key={c.id}>
              <td className="border p-2">{c.name}</td>
              <td className="border p-2 text-center">
                <input
                  type="checkbox"
                  checked={c.active}
                  onChange={e => toggle(c.id, e.target.checked)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {message && <p className="mt-4 text-center text-red-600">{message}</p>}
    </main>
  );
}
