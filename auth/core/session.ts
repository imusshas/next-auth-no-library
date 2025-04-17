import { z } from "zod";

import { SessionSchema } from "@/schemas/authSchema";
import { getIronSessionData, setIronSessionData } from "@/lib/session";

export async function createSession(
  user: z.infer<typeof SessionSchema>,
): Promise<z.infer<typeof SessionSchema> | "OK" | null> {
  return await setIronSessionData(user);
}

export function getUserFromSession(): Promise<z.infer<typeof SessionSchema> | null> | null {
  return getSessionUserByToken();
}

async function getSessionUserByToken(): Promise<z.infer<typeof SessionSchema> | null> {
  const session = await getIronSessionData();
  const sessionUser = {
    userId: session.userId,
    role: session.role,
  };

  const { success, error, data: user } = SessionSchema.safeParse(sessionUser);

  if (!success || error) {
    return null;
  }

  return user;
}

export async function updateUserSession(
  user: z.infer<typeof SessionSchema>,
): Promise<z.infer<typeof SessionSchema> | "OK" | null> {
  return await setIronSessionData(user);
}

export async function removeUserFromSession(): Promise<void> {
  const session = await getIronSessionData();
  session.destroy();
}

export async function updateUserSessionExpiration() {
  const session = await getIronSessionData();
  if (!session.userId) {
    return null;
  }
  await session.save();
}
