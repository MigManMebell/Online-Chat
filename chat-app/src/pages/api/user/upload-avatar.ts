import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyJwt } from '../../../utils/auth';
import { connectToDatabase } from '../../../lib/mongodb';
import { User } from '../../../models/User';

// Простой вариант: принимаем URL в body; для загрузки файлов обычно нужен next/server + storage (S3/Cloudinary)
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
  const { url } = req.body || {};
  if (!url || typeof url !== 'string') {
    res.status(400).json({ message: 'Missing url' });
    return;
  }
  await connectToDatabase();
  const user = await User.findByIdAndUpdate(userId, { avatarUrl: url }, { new: true }).lean();
  res.status(200).json({ user });
}


