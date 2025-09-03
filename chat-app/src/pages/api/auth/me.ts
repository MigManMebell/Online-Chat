import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyJwt } from '../../../utils/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.substring(7) : undefined;
  if (!token) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }
  try {
    const user = verifyJwt(token);
    res.status(200).json({ userId: user.userId, nickname: user.nickname });
    return;
  } catch {
    res.status(401).json({ message: 'Invalid token' });
    return;
  }
}


