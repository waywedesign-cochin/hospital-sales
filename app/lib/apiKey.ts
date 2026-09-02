import crypto from "crypto";

export function generateApiKey() {
  return `pk_live_${crypto.randomBytes(20).toString("hex")}`;
}
