import jwt from 'jsonwebtoken';
import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import type { JwtPayload, Secret, SignOptions } from 'jsonwebtoken';

const JWT_SECRET: Secret = (process.env.JWT_SECRET || '') as Secret;

if (!JWT_SECRET) {
  throw new Error('Please define JWT_SECRET in .env.local');
}

export interface AuthPayload {
  userId: string;
  nickname?: string;
}

export function signJwt(payload: AuthPayload, expiresIn: string = '7d'): string {
  const options: SignOptions = { expiresIn };
  return jwt.sign(payload as JwtPayload, JWT_SECRET, options);
}

export function verifyJwt(token: string): AuthPayload {
  const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload | string;
  if (typeof decoded === 'string') {
    throw new Error('Invalid token payload');
  }
  return decoded as unknown as AuthPayload;
}

export function withAuth(handler: NextApiHandler): NextApiHandler {
  return async (
    req: NextApiRequest & { user?: AuthPayload },
    res: NextApiResponse
  ): Promise<void> => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : undefined;
    if (!token) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    try {
      const decoded = verifyJwt(token);
      req.user = decoded;
      await (handler as NextApiHandler)(req as NextApiRequest, res as NextApiResponse);
      return;
    } catch {
      res.status(401).json({ message: 'Invalid token' });
      return;
    }
  };
}


