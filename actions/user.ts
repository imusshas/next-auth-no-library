"use server";

import { getUserFromSession, updateUserSession } from "@/auth/core/session";
import { prisma } from "@/lib/prisma";
import { $Enums } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

type FullUser = Exclude<Awaited<ReturnType<typeof getCurrentUserFromDB>>, undefined | null>;
type User = Exclude<Awaited<ReturnType<typeof getUserFromSession>>, undefined | null>;

function _getCurrentUser(options: { withFullUser: true; redirectIfNotFound: true }): Promise<FullUser>;
function _getCurrentUser(options: { withFullUser: true; redirectIfNotFound?: false }): Promise<FullUser | null>;
function _getCurrentUser(options: { withFullUser?: false; redirectIfNotFound: true }): Promise<User>;
function _getCurrentUser(options?: { withFullUser?: false; redirectIfNotFound?: false }): Promise<User | null>;

async function _getCurrentUser({ withFullUser = false, redirectIfNotFound = false } = {}) {
  const user = await getUserFromSession();

  if (!user || user == null) {
    if (redirectIfNotFound) {
      return redirect("/sign-in");
    }
    return null;
  }

  if (withFullUser) {
    const fullUser = await getCurrentUserFromDB(user.userId);
    if (!fullUser) throw new Error("User not found in the database");
    return fullUser;
  }

  return user;
}

export const getCurrentUser = cache(_getCurrentUser);

function getCurrentUserFromDB(
  id: string,
): Promise<{ role: $Enums.UserRole; name: string; id: string; email: string } | null> {
  return prisma.user.findUnique({
    where: {
      id: id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });
}

export async function toggleUserRole(): Promise<void> {
  try {
    const currentUser = await getCurrentUser({ redirectIfNotFound: true });

    const updatedUser = await prisma.user.update({
      where: {
        id: currentUser.userId,
      },
      data: {
        role: currentUser.role === "user" ? "admin" : "user",
      },
    });

    if (!updatedUser) {
      return;
    }

    const updatedSession = await updateUserSession({
      userId: updatedUser.id,
      role: updatedUser.role,
    });

    if (!updatedSession) {
      throw new Error("Unable to update the session user");
    }
  } catch (error) {
    console.log("changeUserRole Error:", error);
  }
  revalidatePath("/private");
}
