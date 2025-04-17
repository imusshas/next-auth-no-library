import { env } from "@/data/env/server";
import { OAuthClient } from "@/auth/core/oauth/base";
import { z } from "zod";

export function createGoogleOAuthClient() {
  return new OAuthClient({
    provider: "google",
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    scopes: ["openid", "profile", "email"],
    urls: {
      auth: "https://accounts.google.com/o/oauth2/v2/auth",
      token: "https://oauth2.googleapis.com/token",
      user: "https://openidconnect.googleapis.com/v1/userinfo",
    },
    userInfo: {
      schema: z.object({
        sub: z.string(),
        email: z.string().email(),
        name: z.string(),
      }),
      parser: async (user) => ({
        id: user.sub ?? "",
        email: user.email,
        name: user.name ?? "",
      }),
    },
  });
}
