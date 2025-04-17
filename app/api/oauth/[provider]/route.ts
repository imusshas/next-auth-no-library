import { getOAuthClient } from "@/auth/core/oauth/base";
import { createSession } from "@/auth/core/session";
import { prisma } from "@/lib/prisma";
import { OAuthProvider, Prisma } from "@prisma/client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import { z } from "zod";

export async function GET(request: NextRequest, { params }: { params: Promise<{ provider: string }> }) {
  const { provider: rawProvider } = await params;
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const provider = z.nativeEnum(OAuthProvider).parse(rawProvider);

  if (typeof code !== "string" || typeof state !== "string") {
    redirect(`/sign-in?oauthError=${encodeURIComponent("Failed to connect. Please try again")}`);
  }

  try {
    const oAuthUser = await getOAuthClient(provider).fetchUser(code, state, await cookies());
    const user = await connectUserToAccount(oAuthUser, provider);
    await createSession({ userId: user.id, role: user.role });
  } catch (error) {
    console.error("/api/oauth/[provider] GET:", error);
    redirect(`/sign-in?oauthError=${encodeURIComponent("Failed to connect. Please try again")}`);
  }
  redirect("/");
}

function connectUserToAccount(
  { id, email, name }: { id: string; email: string; name: string },
  provider: OAuthProvider,
) {
  return prisma.$transaction(async (trx) => {

    let user = await trx.user.findUnique({
      where: { email: email },
      select: { id: true, role: true },
    });

    if (!user) {
      try {

        user = await trx.user.create({
          data: { name, email },
          select: { id: true, role: true },
        });
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
          // Race condition: user was created by another transaction
          user = await trx.user.findUnique({
            where: { email },
            select: { id: true, role: true },
          });
        } else {
          console.error("connectUserToAccount: Error creating user:", error);
          throw error;
        }
      }
    }

    if (!user) {
      throw new Error("User creation or retrieval failed unexpectedly");
    }

    try {
      // Check if the OAuth account already exists
      const existingOAuthAccount = await trx.userOAuthAccount.findUnique({
        where: {
          provider_providerAccountId: {
            provider,
            providerAccountId: id,
          },
        },
      });

      if (!existingOAuthAccount) {
        await trx.userOAuthAccount.create({
          data: {
            provider,
            providerAccountId: id,
            user: { connect: { id: user.id } },
          },
        });
      }
    } catch (error) {
      console.error("Error creating user OAuth account:", error);
      throw error;
    }
    
    return user;
  });
}
