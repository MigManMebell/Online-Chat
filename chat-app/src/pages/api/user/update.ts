import type { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '../../../utils/auth';
import { connectToDatabase } from '../../../lib/mongodb';
import { User } from '../../../models/User';

export default withAuth(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
  const { nickname, avatarUrl } = req.body || {};
  if (!nickname && !avatarUrl) {
    return res.status(400).json({ message: 'Nothing to update' });
  }
  await connectToDatabase();
  const userId = (req as any).user.userId as string;
  const update: any = {};
  if (typeof nickname === 'string' && nickname.trim()) update.nickname = nickname.trim();
  if (typeof avatarUrl === 'string' && avatarUrl.trim()) update.avatarUrl = avatarUrl.trim();
  const user = await User.findByIdAndUpdate(userId, update, { new: true }).lean();
  return res.status(200).json({ user });
});


