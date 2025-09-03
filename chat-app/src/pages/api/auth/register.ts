import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../lib/mongodb';
import { User } from '../../../models/User';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method Not Allowed' });
    return;
  }
  const { email, password, nickname } = req.body || {};
  if (!email || !password || !nickname) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  try {
    await connectToDatabase();
    const exists = await User.findOne({ email }).lean();
    if (exists) {
      res.status(409).json({ message: 'Email already registered' });
      return;
    }
    const hashed = await bcrypt.hash(password, 10);
    await User.create({ email, password: hashed, nickname });
    res.status(201).json({ message: 'User created' });
    return;
  } catch {
    res.status(500).json({ message: 'Server error' });
    return;
  }
}


