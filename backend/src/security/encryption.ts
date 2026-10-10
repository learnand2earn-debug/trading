import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
// Master key fallback for dev if ENCRYPTION_KEY env is not set
const DEFAULT_SECRET = process.env.ENCRYPTION_KEY || 'apex-crypto-ultra-secure-key-32b!';
const KEY = crypto.createHash('sha256').update(DEFAULT_SECRET).digest();

export function encryptSecret(plainText: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decryptSecret(encryptedPayload: string): string {
  try {
    const parts = encryptedPayload.split(':');
    if (parts.length !== 3) return '';
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encryptedText = parts[2];

    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    return '';
  }
}

export function maskApiKey(apiKey: string): string {
  if (!apiKey || apiKey.length < 8) return '****';
  return `${apiKey.slice(0, 4)}****${apiKey.slice(-4)}`;
}
