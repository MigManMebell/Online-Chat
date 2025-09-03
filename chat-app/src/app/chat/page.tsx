'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import ThemeToggle from '../../components/ThemeToggle';

interface ChatMessage {
  _id?: string;
  content: string;
  sender: { userId: string; nickname: string };
  timestamp: string | Date;
}

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  const socket: Socket | null = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('token');
    if (!token) return null;
    const s = io({ path: '/api/socket', auth: { token } });
    return s;
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }

    const load = async () => {
      const res = await fetch('/api/messages', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
      setLoading(false);
    };
    load();
  }, [router]);

  useEffect(() => {
    if (!socket) return;
    socket.on('message', (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    });
    return () => {
      socket.off('message');
      socket.disconnect();
    };
  }, [socket]);

  const sendMessage = () => {
    const token = localStorage.getItem('token');
    const nickname = localStorage.getItem('nickname') || 'User';
    if (!token || !socket || !content.trim()) return;
    socket.emit('message', { content: content.trim(), nickname });
    setContent('');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col max-w-3xl mx-auto p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-50 via-white to-brand-100">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Общий чат</h1>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button onClick={() => router.push('/profile')} className="border rounded px-3 py-1 hover:bg-white">Профиль</button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto border rounded p-3 bg-white/70 backdrop-blur-xs shadow-glass space-y-2 animate-fadeInUp">
        {messages.map((m, idx) => (
          <div key={m._id || idx} className="text-sm">
            <span className="font-medium">{m.sender?.nickname || 'User'}</span>
            <span className="text-gray-500 ml-2">
              {new Date(m.timestamp).toLocaleTimeString()}
            </span>
            <div>{m.content}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <input
          className="flex-1 border rounded px-3 py-2"
          placeholder="Сообщение..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') sendMessage();
          }}
        />
        <button onClick={sendMessage} className="bg-brand-600 text-white rounded px-4 py-2 hover:bg-brand-700">
          Отправить
        </button>
      </div>
    </div>
  );
}


