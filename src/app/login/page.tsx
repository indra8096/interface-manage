'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      router.push('/');
    } else {
      setError('Identifiants invalides');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-primary">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-sm space-y-6">
        <h2 className="text-2xl font-karla-bold text-center text-primary">Connexion</h2>
        {error && <div className="text-red-600 text-center">{error}</div>}
        <div>
          <label className="block text-sm font-karla-semibold mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-karla-semibold mb-1">Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            required
          />
        </div>
        <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded font-karla-semibold hover:bg-blue-700 transition" disabled={loading}>
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>
    </div>
  );
} 