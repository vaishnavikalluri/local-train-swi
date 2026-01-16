import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export function generateToken(userId: string, role: string, stationName?: string) {
  const payload: any = { userId, role };
  if (stationName) {
    payload.stationName = stationName;
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; role: string; stationName?: string };
  } catch (error) {
    return null;
  }
}
