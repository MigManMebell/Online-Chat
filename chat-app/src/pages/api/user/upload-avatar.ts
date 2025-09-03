import type { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '../../../utils/auth';
import { connectToDatabase } from '../../../lib/mongodb';
import { User } from '../../../models/User';

// Простой вариант: принимаем URL в body; для загрузки файлов обычно нужен next/server + storage (S3/Cloudinary)
export default withAuth(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
  const { url } = req.body || {};
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ message: 'Missing url' });
  }
  await connectToDatabase();
  const userId = (req as any).user.userId as string;
  const user = await User.findByIdAndUpdate(userId, { avatarUrl: url }, { new: true }).lean();
  return res.status(200).json({ user });
});


