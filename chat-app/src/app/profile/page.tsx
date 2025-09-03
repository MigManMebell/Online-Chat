'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }
    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        if (data?.nickname) setNickname(data.nickname);
      })
      .catch(() => {});
  }, [router]);

  const save = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const res = await fetch('/api/user/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ nickname, avatarUrl }),
    });
    if (res.ok) setMessage('Сохранено'); else setMessage('Ошибка сохранения');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('nickname');
    router.replace('/login');
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#e8edff,#f5f7ff)] p-4">
      <div className="max-w-lg mx-auto mt-10 bg-white/70 backdrop-blur rounded-xl shadow-glass p-6 animate-fadeInUp">
        <h1 className="text-2xl font-semibold mb-4">Профиль</h1>
        <div className="space-y-3">
          <input className="w-full border rounded px-3 py-2" placeholder="Никнейм" value={nickname} onChange={(e) => setNickname(e.target.value)} />
          {preview && (
            <img src={preview} alt="preview" className="w-20 h-20 rounded-full object-cover" />
          )}
          <input className="w-full border rounded px-3 py-2" placeholder="Ссылка на аватар" value={avatarUrl} onChange={(e) => { setAvatarUrl(e.target.value); setPreview(e.target.value || null); }} />
          <div className="flex gap-2">
            <button onClick={save} className="bg-brand-600 hover:bg-brand-700 text-white rounded px-4 py-2">Сохранить</button>
            <button onClick={() => router.push('/chat')} className="border rounded px-4 py-2">В чат</button>
            <button onClick={logout} className="ml-auto text-red-600 hover:text-red-700">Выйти</button>
          </div>
          {message && <p className="text-sm text-gray-600">{message}</p>}
        </div>
      </div>
    </div>
  );
}


