import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../lib/mongodb';
import { User } from '../../../models/User';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
  const { email, password, nickname } = req.body || {};
  if (!email || !password || !nickname) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  try {
    await connectToDatabase();
    const exists = await User.findOne({ email }).lean();
    if (exists) {
      return res.status(409).json({ message: 'Email already registered' });
    }
    const hashed = await bcrypt.hash(password, 10);
    await User.create({ email, password: hashed, nickname });
    return res.status(201).json({ message: 'User created' });
  } catch {
    return res.status(500).json({ message: 'Server error' });
  }
}


