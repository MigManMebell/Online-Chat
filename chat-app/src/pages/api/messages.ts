import type { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '../../utils/auth';
import { connectToDatabase } from '../../lib/mongodb';
import { Message } from '../../models/Message';

export default withAuth(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
  const limit = Number((req.query.limit as string) || 50);
  await connectToDatabase();
  const messages = await Message.find({}).sort({ timestamp: -1 }).limit(limit).lean();
  return res.status(200).json({ messages: messages.reverse() });
});


