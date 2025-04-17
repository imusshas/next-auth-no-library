import { NextRequest, NextResponse } from "next/server";
import { getUserFromSession, updateUserSessionExpiration } from "@/auth/core/session";

const authRoutes = ["/sign-in", "/sign-up"];
const privateRoutes = ["/private"];
const adminRoutes = ["/dashboard"];

export async function middleware(request: NextRequest) {
  const response = (await middlewareAuth(request)) ?? NextResponse.next();

  await updateUserSessionExpiration();

  return response;
}

async function middlewareAuth(request: NextRequest) {
  const user = await getUserFromSession();
  if (authRoutes.includes(request.nextUrl.pathname)) {
    if (user) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }
  if (privateRoutes.includes(request.nextUrl.pathname)) {
    if (!user) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
  }

  if (adminRoutes.includes(request.nextUrl.pathname)) {
    if (!user) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    if (user.role != "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
