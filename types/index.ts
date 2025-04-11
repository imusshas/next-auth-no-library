import { User } from "@prisma/client";

export type Cookies = {
  set: (
    key: string,
    value: string,
    options: {
      secure?: boolean;
      httpOnly?: boolean;
      sameSite?: "strict" | "lax";
      maxAge?: number;
      expires?: Date;
    },
  ) => void;
  get: (key: string) => { name: string; value: string } | undefined;
  delete: (key: string) => void;
};

export type UserProfile = Pick<User, "id" | "name" | "email" | "role">;
