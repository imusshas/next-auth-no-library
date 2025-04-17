import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { COOKIE_SESSION_KEY, SESSION_EXPIRATION_SECONDS } from "@/constants";
import { env } from "@/data/env/server";
import { z } from "zod";
import { SessionSchema } from "@/schemas/authSchema";

export async function getIronSessionData() {
  const session = await getIronSession<z.infer<typeof SessionSchema> | { userId: undefined; role: undefined }>(
    await cookies(),
    {
      cookieName: COOKIE_SESSION_KEY,
      password: env.IRON_SESSION_PASSWORD,
      cookieOptions: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: SESSION_EXPIRATION_SECONDS,
      },
    },
  );

  return session;
}

export async function setIronSessionData(user: z.infer<typeof SessionSchema>) {
  const { success, data: safeUser, error } = SessionSchema.safeParse(user);
  if (!success || error) {
    return null;
  }

  const session = await getIronSessionData();

  session.userId = safeUser.userId;
  session.role = safeUser.role;

  await session.save();
  return safeUser;
}
