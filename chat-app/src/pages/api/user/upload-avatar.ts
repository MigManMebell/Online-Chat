import type { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '../../../utils/auth';
import { connectToDatabase } from '../../../lib/mongodb';
import { User } from '../../../models/User';

// Простой вариант: принимаем URL в body; для загрузки файлов обычно нужен next/server + storage (S3/Cloudinary)
export default withAuth(async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method Not Allowed' });
    return;
  }
  const { url } = req.body || {};
  if (!url || typeof url !== 'string') {
    res.status(400).json({ message: 'Missing url' });
    return;
  }
  await connectToDatabase();
  const userId = (req as { user?: { userId: string } }).user?.userId;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });
  const user = await User.findByIdAndUpdate(userId, { avatarUrl: url }, { new: true }).lean();
  res.status(200).json({ user });
  return;
});


