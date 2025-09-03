import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyJwt } from '../../utils/auth';
import { connectToDatabase } from '../../lib/mongodb';
import { Message } from '../../models/Message';

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.substring(7) : undefined;
  if (!token) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }
  try {
    verifyJwt(token);
  } catch {
    res.status(401).json({ message: 'Invalid token' });
    return;
  }
  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Method Not Allowed' });
    return;
  }
  const limit = Number((req.query.limit as string) || 50);
  await connectToDatabase();
  const messages = await Message.find({}).sort({ timestamp: -1 }).limit(limit).lean();
  res.status(200).json({ messages: messages.reverse() });
}


