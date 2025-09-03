import type { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '../../../utils/auth';

export default withAuth(async function handler(req: NextApiRequest & { user?: { userId: string; nickname?: string } }, res: NextApiResponse) {
  return res.status(200).json({ userId: req.user!.userId, nickname: req.user!.nickname });
});


