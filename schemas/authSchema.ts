import { UserRole } from "@prisma/client";
import { z } from "zod";

function nameValidation() {
  return z
    .string({ required_error: "Name is required" })
    .min(2, { message: "Name must be at least 2 characters long." })
    .max(100, { message: "Name must be less than 100 characters." });
}

function emailValidation() {
  return z
    .string({ required_error: "Email is required" })
    .min(1, { message: "Email is required" })
    .email({ message: "Please enter a valid email." })
    .trim();
}

function passwordValidation() {
  return z
    .string({ required_error: "Password is required" })
    .min(8, { message: "Password must be at least 8 characters long." })
    .regex(/[a-zA-Z]/, { message: "Contain at least one letter." })
    .regex(/[0-9]/, { message: "Contain at least one number." })
    .regex(/[!@#$%_]/, {
      message: "Contain at least one special character !,@,#,$,%,_.",
    })
    .trim();
}

export const SignupFormSchema = z.object({
  name: nameValidation(),
  email: emailValidation(),
  password: passwordValidation(),
});

export type SignupFormErrorState = {
  name?: string[];
  email?: string[];
  password?: string[];
};

export const SigninFormSchema = z.object({
  email: emailValidation(),
  password: passwordValidation(),
});

export type SigninFormErrorState = {
  email?: string[];
  password?: string[];
};

export const SessionSchema = z.object({
  userId: z.string(),
  role: z.nativeEnum(UserRole)
})