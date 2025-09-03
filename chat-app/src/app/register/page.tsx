'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, nickname }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Registration failed');
      }
      router.push('/login');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form onSubmit={onSubmit} className="w-full max-w-md bg-white rounded-lg shadow p-6 space-y-4">
        <h1 className="text-2xl font-semibold">Регистрация</h1>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <input className="w-full border rounded px-3 py-2" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="w-full border rounded px-3 py-2" placeholder="Пароль" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <input className="w-full border rounded px-3 py-2" placeholder="Никнейм" value={nickname} onChange={(e) => setNickname(e.target.value)} required />
        <button disabled={loading} className="w-full bg-blue-600 text-white rounded px-3 py-2 hover:bg-blue-700 disabled:opacity-60">
          {loading ? 'Создание...' : 'Зарегистрироваться'}
        </button>
      </form>
    </div>
  );
}


