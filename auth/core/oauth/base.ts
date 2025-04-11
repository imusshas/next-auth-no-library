import axios from "axios";
import crypto from "crypto";

import { env } from "@/data/env/server";
import { Cookies } from "@/types";
import { z } from "zod";
import { generateRandomSalt } from "@/auth";
import { CODE_VERIFIER_COOKIE_KEY, STATE_COOKIE_KEY, STATE_EXPIRATION_SECONDS } from "@/constants";
import { OAuthProvider } from "@prisma/client";
import { createDiscordOAuthClient } from "@/auth/core/oauth/discord";
import { createGithubOAuthClient } from "@/auth/core/oauth/github";

export class OAuthClient<T> {
  private readonly provider: OAuthProvider;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly scopes: string[];
  private readonly usePKCE: boolean;
  private readonly urls: {
    auth: string;
    token: string;
    user: string;
  };
  private readonly userInfo: {
    schema: z.ZodSchema<T>;
    parser: (
      data: T,
      token: { accessToken: string; tokenType: string },
    ) => Promise<{ id: string; email: string; name: string }>;
  };

  private readonly tokenSchema = z.object({
    access_token: z.string(),
    token_type: z.string(),
  });

  constructor({
    provider,
    clientId,
    clientSecret,
    scopes,
    urls,
    userInfo,
  }: {
    provider: OAuthProvider;
    clientId: string;
    clientSecret: string;
    scopes: string[];
    urls: {
      auth: string;
      token: string;
      user: string;
    };
    userInfo: {
      schema: z.ZodSchema<T>;
      parser: (
        data: T,
        token: { accessToken: string; tokenType: string },
      ) => Promise<{ id: string; email: string; name: string }>;
    };
  }) {
    this.provider = provider;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.scopes = scopes;
    this.usePKCE = provider === "discord";
    this.urls = urls;
    this.userInfo = userInfo;
  }

  private get redirectUrl() {
    return new URL(this.provider, env.OAUTH_REDIRECT_URL_BASE);
  }

  createAuthUrl(cookies: Pick<Cookies, "set">) {
    const state = createState(cookies);
    const codeVerifier = createCodeVerifier(cookies);

    const url = new URL(this.urls.auth);

    url.searchParams.set("client_id", this.clientId);
    url.searchParams.set("redirect_uri", this.redirectUrl.toString());
    url.searchParams.set("scope", this.scopes.join(" "));
    url.searchParams.set("response_type", "code");
    url.searchParams.set("state", state);
    if (this.usePKCE) {
      url.searchParams.set("code_challenge_method", "S256");
      url.searchParams.set("code_challenge", crypto.hash("sha256", codeVerifier, "base64url"));
    }

    return url.toString();
  }

  private async fetchToken(code: string, codeVerifier: string) {
    const res = await axios.post(
      this.urls.token,
      new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code_verifier: codeVerifier,
        grant_type: "authorization_code",
        code, // the authorization code from the query
        redirect_uri: this.redirectUrl.toString(), // must match exactly
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
      },
    );

    const { success, data, error } = this.tokenSchema.safeParse(res.data);
    if (!success) {
      throw new InvalidTokenError(error);
    }
    return {
      accessToken: data.access_token,
      tokenType: data.token_type,
    };
  }

  async fetchUser(code: string, state: string, cookies: Pick<Cookies, "get">) {
    const isValidState = validateState(state, cookies);
    if (!isValidState) {
      throw new InvalidStateError();
    }
    const { accessToken, tokenType } = await this.fetchToken(code, getCodeVerifier(cookies));
    const res = await axios.get(this.urls.user, {
      headers: {
        Authorization: `${tokenType} ${accessToken}`,
      },
    });

    const { success, data, error } = this.userInfo.schema.safeParse(res.data);

    if (!success) {
      console.error(error);
      throw new InvalidUserError(error);
    }

    return await this.userInfo.parser(data, { accessToken, tokenType });
  }
}

export function getOAuthClient(provider: OAuthProvider) {
  switch (provider) {
    case "discord":
      return createDiscordOAuthClient();
    case "github":
      return createGithubOAuthClient();
    default:
      throw new Error(`Invalid provider: ${provider satisfies never}`);
  }
}

class InvalidTokenError extends Error {
  constructor(zodError: z.ZodError) {
    super("Invalid token");
    this.cause = zodError;
  }
}

class InvalidUserError extends Error {
  constructor(zodError: z.ZodError) {
    super("Invalid user");
    this.cause = zodError;
  }
}

class InvalidStateError extends Error {
  constructor() {
    super("Invalid state");
  }
}

class InvalidCodeVerifierError extends Error {
  constructor() {
    super("Invalid code verifier");
  }
}

function createState(cookies: Pick<Cookies, "set">): string {
  const state = generateRandomSalt(64);
  cookies.set(STATE_COOKIE_KEY, state, {
    secure: true,
    httpOnly: true,
    expires: new Date(Date.now() + STATE_EXPIRATION_SECONDS * 1000),
  });

  return state;
}

function validateState(state: string, cookies: Pick<Cookies, "get">): boolean {
  const cookieState = cookies.get(STATE_COOKIE_KEY)?.value;
  return cookieState === state;
}

function createCodeVerifier(cookies: Pick<Cookies, "set">): string {
  const codeVerifier = generateRandomSalt(64);

  cookies.set(CODE_VERIFIER_COOKIE_KEY, codeVerifier, {
    secure: true,
    httpOnly: true,
    expires: new Date(Date.now() + STATE_EXPIRATION_SECONDS * 1000),
  });

  return codeVerifier;
}

function getCodeVerifier(cookies: Pick<Cookies, "get">): string {
  const codeVerifier = cookies.get(CODE_VERIFIER_COOKIE_KEY)?.value;
  if (!codeVerifier) {
    throw new InvalidCodeVerifierError();
  }

  return codeVerifier;
}
