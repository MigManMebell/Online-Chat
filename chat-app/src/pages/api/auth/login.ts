import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../lib/mongodb';
import { User } from '../../../models/User';
import bcrypt from 'bcryptjs';
import { signJwt } from '../../../utils/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method Not Allowed' });
    return;
  }
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  try {
    await connectToDatabase();
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }
    const token = signJwt({ userId: String(user._id), nickname: user.nickname });
    res.status(200).json({ token, nickname: user.nickname });
    return;
  } catch {
    res.status(500).json({ message: 'Server error' });
    return;
  }
}


