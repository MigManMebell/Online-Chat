import type { NextApiRequest } from 'next';
import type { NextApiResponseServerIO } from '../../types/next';
import { Server as IOServer } from 'socket.io';
import { connectToDatabase } from '../../lib/mongodb';
import { Message } from '../../models/Message';
import { verifyJwt } from '../../utils/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponseServerIO) {
  if (!res.socket.server.io) {
    const io = new IOServer(res.socket.server, { path: '/api/socket' });

    io.use((socket, next) => {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');
      try {
        if (!token) return next(new Error('Unauthorized'));
        const payload = verifyJwt(token);
        (socket as any).user = payload;
        next();
      } catch (e) {
        next(new Error('Unauthorized'));
      }
    });

    io.on('connection', (socket) => {
      socket.on('message', async (data: { content: string; nickname: string }) => {
        const user = (socket as any).user as { userId: string; nickname?: string };
        if (!user) return;
        await connectToDatabase();
        const doc = await Message.create({
          content: data.content,
          sender: { userId: user.userId, nickname: data.nickname || user.nickname || 'User' },
          timestamp: new Date(),
        });
        io.emit('message', {
          _id: String(doc._id),
          content: doc.content,
          sender: doc.sender,
          timestamp: doc.timestamp,
        });
      });
    });

    res.socket.server.io = io;
  }
  res.end();
}


