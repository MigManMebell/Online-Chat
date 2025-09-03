'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }
      localStorage.setItem('token', data.token);
      localStorage.setItem('nickname', data.nickname || '');
      router.push('/chat');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form onSubmit={onSubmit} className="w-full max-w-md bg-white rounded-lg shadow p-6 space-y-4">
        <h1 className="text-2xl font-semibold">Вход</h1>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <input className="w-full border rounded px-3 py-2" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="w-full border rounded px-3 py-2" placeholder="Пароль" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button disabled={loading} className="w-full bg-blue-600 text-white rounded px-3 py-2 hover:bg-blue-700 disabled:opacity-60">
          {loading ? 'Вход...' : 'Войти'}
        </button>
      </form>
    </div>
  );
}


