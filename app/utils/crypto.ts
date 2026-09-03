import crypto from 'crypto';

// The key must be exactly 32 bytes (64 hex characters)
const getEncryptionKey = () => process.env.WHATSAPP_ENCRYPTION_KEY;
const ALGORITHM = 'aes-256-gcm';

export function encrypt(text: string): string {
  const keyHex = getEncryptionKey();
  if (!keyHex) {
    throw new Error('WHATSAPP_ENCRYPTION_KEY is not defined in environment variables');
  }
  if (keyHex.length !== 64) {
    throw new Error('WHATSAPP_ENCRYPTION_KEY must be exactly 64 hex characters (32 bytes)');
  }

  const iv = crypto.randomBytes(16);
  const key = Buffer.from(keyHex, 'hex');
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  // Return IV:AuthTag:EncryptedText
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export function decrypt(encryptedText: string): string {
  const keyHex = getEncryptionKey();
  if (!keyHex) {
    throw new Error('WHATSAPP_ENCRYPTION_KEY is not defined in environment variables');
  }

  const parts = encryptedText.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted text format');
  }

  const [ivHex, authTagHex, encryptedHex] = parts;

  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');
  const key = Buffer.from(keyHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, undefined, 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
