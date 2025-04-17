import { env } from "@/data/env/server";
import { OAuthClient } from "@/auth/core/oauth/base";
import { z } from "zod";
import axios from "axios";

export function createGithubOAuthClient() {
  return new OAuthClient({
    provider: "github",
    clientId: env.GITHUB_CLIENT_ID,
    clientSecret: env.GITHUB_CLIENT_SECRET,
    scopes: ["user:email", "read:user"],
    urls: {
      auth: "https://github.com/login/oauth/authorize",
      token: "https://github.com/login/oauth/access_token",
      user: "https://api.github.com/user",
    },
    userInfo: {
      schema: z.object({
        id: z.number(),
        name: z.string().nullable(),
        login: z.string(),
        email: z.string().email().nullable(),
      }),
      parser: async (user, { accessToken, tokenType }) => {
        let email = user.email;

        if (!email) {
          const emailRes = await axios.get("https://api.github.com/user/emails", {
            headers: {
              Authorization: `${tokenType} ${accessToken}`,
              Accept: "application/vnd.github+json",
            },
          });

          const emails = z
            .array(
              z.object({
                email: z.string().email(),
                primary: z.boolean(),
                verified: z.boolean(),
              }),
            )
            .parse(emailRes.data);

          const primary = emails.find((e) => e.primary && e.verified);
          email = primary?.email ?? emails[0]?.email ?? null;

          if (!email) {
            throw new Error("Could not determine GitHub user email");
          }
        }

        return {
          id: user.id.toString(),
          name: user.name ?? user.login,
          email,
        };
      },
    },
  });
}
