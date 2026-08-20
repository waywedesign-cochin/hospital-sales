import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
  throw new Error("❌ JWT_SECRET is not defined in environment variables");
}

// Define a type compatible with jwt.sign expiresIn
type ExpiresIn = string | number;

export function signJwt(payload: object, expiresIn: ExpiresIn = "7d") {
  // Inline type assertion using Record<string, unknown> to satisfy TS
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as Record<
    string,
    unknown
  >);
}

export function verifyJwt<T extends object>(token: string): T | null {
  try {
    return jwt.verify(token, JWT_SECRET) as T;
  } catch {
    return null;
  }
}
