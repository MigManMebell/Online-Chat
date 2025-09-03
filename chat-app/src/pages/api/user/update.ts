import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyJwt } from '../../../utils/auth';
import { connectToDatabase } from '../../../lib/mongodb';
import { User } from '../../../models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.substring(7) : undefined;
  if (!token) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }
  let userId: string | undefined;
  try {
    const decoded = verifyJwt(token);
    userId = decoded.userId;
  } catch {
    res.status(401).json({ message: 'Invalid token' });
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method Not Allowed' });
    return;
  }
  const { nickname, avatarUrl } = req.body || {};
  if (!nickname && !avatarUrl) {
    res.status(400).json({ message: 'Nothing to update' });
    return;
  }
  await connectToDatabase();
  const update: Record<string, string> = {};
  if (typeof nickname === 'string' && nickname.trim()) update.nickname = nickname.trim();
  if (typeof avatarUrl === 'string' && avatarUrl.trim()) update.avatarUrl = avatarUrl.trim();
  const user = await User.findByIdAndUpdate(userId, update, { new: true }).lean();
  res.status(200).json({ user });
}


