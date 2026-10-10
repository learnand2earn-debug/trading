import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || process.env.ENCRYPTION_KEY || 'apex-crypto-jwt-auth-secret-key-32b!';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: 'ADMIN' | 'USER';
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

/**
 * Hash password with PBKDF2 using random salt
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verify password against stored salt:hash
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const parts = storedHash.split(':');
    if (parts.length !== 2) {
      // Legacy fallback for plain or mock hash
      return password === storedHash || storedHash.includes(password);
    }
    const [salt, originalHash] = parts;
    const testHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(testHash, 'hex'), Buffer.from(originalHash, 'hex'));
  } catch (err) {
    return false;
  }
}

/**
 * Generate HMAC-SHA256 signed session token (base64url header.payload.signature)
 */
export function generateToken(user: AuthUser, expiresInHours = 72): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(
    JSON.stringify({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      iat: now,
      exp: now + expiresInHours * 3600
    })
  ).toString('base64url');

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${payload}`)
    .digest('base64url');

  return `${header}.${payload}.${signature}`;
}

/**
 * Verify and decode HMAC-SHA256 session token
 */
export function verifyToken(token: string): AuthUser | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, payload, signature] = parts;
    const expectedSig = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${payload}`)
      .digest('base64url');

    if (signature !== expectedSig) return null;

    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < now) {
      return null; // Expired
    }

    return {
      id: decoded.id,
      username: decoded.username,
      email: decoded.email,
      role: decoded.role
    };
  } catch (err) {
    return null;
  }
}

/**
 * Express middleware to extract Bearer token and populate req.user.
 * Falls back to default admin user if no token is provided to preserve backward compatibility.
 */
export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const user = verifyToken(token);
    if (user) {
      req.user = user;
      return next();
    }
  }

  // Fallback to default admin for legacy / unauthenticated calls
  req.user = {
    id: 'usr-admin-1',
    username: 'admin',
    email: 'admin@apex-trading.io',
    role: 'ADMIN'
  };
  next();
}

/**
 * Express middleware requiring a valid authenticated token
 */
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required. Please log in.' });
    return;
  }

  const token = authHeader.substring(7);
  const user = verifyToken(token);
  if (!user) {
    res.status(401).json({ error: 'Invalid or expired session. Please log in again.' });
    return;
  }

  req.user = user;
  next();
}

/**
 * Express middleware requiring ADMIN role
 */
export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'ADMIN') {
    res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
    return;
  }
  next();
}
