import { randomBytes, scrypt, timingSafeEqual } from "crypto";

export function hashPassword(password: string, salt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    scrypt(password.normalize(), salt, 64, (error, hash) => {
      if (error) {
        reject(error);
      }

      resolve(hash.toString("hex").normalize());
    });
  });
}

export function generateRandomSalt(bytes?: number): string {
  return randomBytes(bytes || 16)
    .toString("hex")
    .normalize();
}

export async function verifyPassword({
  hashedPassword,
  password,
  salt,
}: {
  hashedPassword: string;
  password: string;
  salt: string;
}): Promise<boolean> {
  const inputHashedPassword = await hashPassword(password, salt);
  return timingSafeEqual(Buffer.from(inputHashedPassword, "hex"), Buffer.from(hashedPassword, "hex"));
}
