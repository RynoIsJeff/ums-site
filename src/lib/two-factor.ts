import { generateSecret, generateURI, verify } from "otplib";

export function generateTotpSecret(): string {
  return generateSecret();
}

export function generateTotpUri(secret: string, email: string, issuer = "UMS Hub"): string {
  return generateURI({ issuer, label: email, secret });
}

export async function verifyTotpToken(secret: string, token: string): Promise<boolean> {
  try {
    const result = await verify({ secret, token });
    return result.valid;
  } catch {
    return false;
  }
}

export function generateRecoveryCodes(count = 10): string[] {
  const codes: string[] = [];
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  for (let i = 0; i < count; i++) {
    let code = "";
    for (let j = 0; j < 8; j++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
  }
  return codes;
}
