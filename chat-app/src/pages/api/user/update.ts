import type { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '../../../utils/auth';
import { connectToDatabase } from '../../../lib/mongodb';
import { User } from '../../../models/User';

export default withAuth(async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
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
  const userId = (req as { user?: { userId: string } }).user?.userId;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });
  const update: Record<string, string> = {};
  if (typeof nickname === 'string' && nickname.trim()) update.nickname = nickname.trim();
  if (typeof avatarUrl === 'string' && avatarUrl.trim()) update.avatarUrl = avatarUrl.trim();
  const user = await User.findByIdAndUpdate(userId, update, { new: true }).lean();
  res.status(200).json({ user });
  return;
});


