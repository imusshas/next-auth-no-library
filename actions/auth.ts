"use server";

import { SignupFormSchema, SignupFormErrorState, SigninFormErrorState, SigninFormSchema } from "@/schemas/authSchema";
import { prisma } from "@/lib/prisma";
import { generateRandomSalt, hashPassword, verifyPassword } from "@/auth/";
import { createSession, removeUserFromSession } from "@/auth/core/session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getOAuthClient } from "@/auth/core/oauth/base";
import { OAuthProvider } from "@prisma/client";

export async function signup(formData: FormData): Promise<SignupFormErrorState | undefined> {
  try {
    // Validate form fields
    const { success, error, data } = SignupFormSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
    });

    // // If any form fields are invalid, return early
    if (!success) {
      return {
        name: error.flatten().fieldErrors.name,
        email: error.flatten().fieldErrors.email,
        password: error.flatten().fieldErrors.password,
      };
    }

    // // Check if the user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (existingUser !== null) {
      return {
        email: ["An account with this email already exists"],
      };
    }

    // // Hash the password
    const salt = generateRandomSalt();
    const hashedPassword = await hashPassword(data.password, salt);

    // Call the provider or db to create a user...
    const newUser = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        salt: salt,
      },
    });

    if (newUser == null) {
      return {
        password: ["Something went wrong while creating the account. Please try again"],
      };
    }

    const sessionError = await createSession({ userId: newUser.id, role: newUser.role }, await cookies());
    if (sessionError) {
      return {
        password: [sessionError],
      };
    }
  } catch (error) {
    console.log("signup Error:", error);
    return {
      password: ["Unable to create account"],
    };
  }

  redirect("/");
}

export async function signin(formData: FormData): Promise<SigninFormErrorState | undefined> {
  try {
    const { success, data, error } = SigninFormSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    // If any form fields are invalid, return early
    if (!success) {
      return {
        email: error.flatten().fieldErrors.email,
        password: error.flatten().fieldErrors.password,
      };
    }

    const user = await prisma.user.findUnique({
      where: {
        email: data.email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        salt: true,
        password: true,
      },
    });

    if (!user || !user.password || !user.salt) {
      return {
        password: ["Invalid credentials"],
      };
    }

    const isPasswordVerified = await verifyPassword({
      hashedPassword: user.password,
      password: data.password,
      salt: user.salt,
    });

    if (!isPasswordVerified) {
      return {
        password: ["Invalid credentials"],
      };
    }

    const sessionError = await createSession({ userId: user.id, role: user.role }, await cookies());
    if (sessionError) {
      return {
        password: [sessionError],
      };
    }
  } catch (error) {
    console.error("signin Error:", error);
    return {
      password: ["Unable to log you in"],
    };
  }

  redirect("/");
}

export async function oAuthSignIn(provider: OAuthProvider) {
  // TODO: Get oAuth url

  redirect(getOAuthClient(provider).createAuthUrl(await cookies()));
}

export async function logout() {
  // TODO: Implement deleteSessionOnExpiry: deletes the session from database if it is expired
  await removeUserFromSession(await cookies());
  revalidatePath("/");
}
