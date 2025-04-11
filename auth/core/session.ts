import { z } from "zod";

import { SessionSchema } from "@/schemas/authSchema";
import { Cookies } from "@/types";
import { generateRandomSalt } from "@/auth";
import { COOKIE_SESSION_KEY, SESSION_EXPIRATION_SECONDS } from "@/constants";
import { redis } from "@/lib/redis";

export async function createSession(user: z.infer<typeof SessionSchema>, cookies: Pick<Cookies, "set">) {
  const sessionToken = generateRandomSalt(512);
  const expires = new Date(Date.now() + SESSION_EXPIRATION_SECONDS * 1000);

  const session = await redis.set(`session:${sessionToken}`, SessionSchema.parse(user), {
    ex: SESSION_EXPIRATION_SECONDS,
  });

  if (!session) {
    return "Unable to create session";
  }

  setCookies(sessionToken, cookies, expires);
}

function setCookies(sessionToken: string, cookies: Pick<Cookies, "set">, expires: Date) {
  cookies.set(COOKIE_SESSION_KEY, sessionToken, {
    secure: true,
    httpOnly: true,
    sameSite: "lax",
    // maxAge: SESSION_EXPIRATION_SECONDS,
    expires: expires,
  });
}

export function getUserFromSession(
  cookies: Pick<Cookies, "get">,
): Promise<z.infer<typeof SessionSchema> | null> | null {
  const sessionToken = cookies.get(COOKIE_SESSION_KEY)?.value;

  if (!sessionToken) {
    return null;
  }

  return getSessionUserByToken(sessionToken);
}

async function getSessionUserByToken(sessionToken: string): Promise<z.infer<typeof SessionSchema> | null> {
  const sessionUser = await redis.get(`session:${sessionToken}`);

  const { success, error, data: user } = SessionSchema.safeParse(sessionUser);

  if (!success || error) {
    return null;
  }

  return user;
}

export async function updateUserSession(
  user: z.infer<typeof SessionSchema>,
  cookies: Pick<Cookies, "get">,
): Promise<z.infer<typeof SessionSchema> | "OK" | null> {
  const sessionToken = cookies.get(COOKIE_SESSION_KEY)?.value;

  if (!sessionToken) {
    return null;
  }

  const updatedSessionUser = await redis.set(`session:${sessionToken}`, SessionSchema.parse(user), {
    ex: SESSION_EXPIRATION_SECONDS,
  });

  if (!updatedSessionUser) {
    return null;
  }

  return updatedSessionUser;
}

export async function removeUserFromSession(cookies: Pick<Cookies, "get" | "delete">): Promise<void> {
  const sessionToken = cookies.get(COOKIE_SESSION_KEY)?.value;

  if (!sessionToken) {
    return;
  }

  redis.del(`session:${sessionToken}`);

  cookies.delete(COOKIE_SESSION_KEY);
}

export async function updateUserSessionExpiration(cookies: Pick<Cookies, "get" | "set">) {
  const sessionToken = cookies.get("sessionToken")?.value;

  if (!sessionToken) {
    return null;
  }

  const user = await getSessionUserByToken(sessionToken);

  if (!user) {
    return null;
  }

  const expires = new Date(Date.now() + SESSION_EXPIRATION_SECONDS * 1000);

  const session = await redis.set(`session:${sessionToken}`, user, {
    ex: SESSION_EXPIRATION_SECONDS,
  });

  if (!session) {
    throw new Error("Unable to update session expiry for session user");
  }

  setCookies(sessionToken, cookies, expires);
}
