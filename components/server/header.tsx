import Link from "next/link";
import { Button } from "../ui/button";
import { getCurrentUser } from "@/actions/user";
import LogOutButton from "../client/log-out-button";

export default async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="h-16 bg-background/10 backdrop-blur-2xl fixed left-0 top-0 right-0 px-4 sm:px-8 md:px-12 lg:px-20 border-b flex justify-between items-center gap-6 z-50">
      <h1 className="text-3xl font-bold">
        <Link href={"/"}>Auth</Link>
      </h1>
      {user ? (
        <nav className="flex gap-2">
          {user.role === "admin" && (
            <Button variant={"link"} asChild>
              <Link href={"/dashboard"}>Dashboard</Link>
            </Button>
          )}
          <Button variant={"link"} asChild>
            <Link href={"/private"}>Private</Link>
          </Button>
          <LogOutButton />
        </nav>
      ) : (
        <nav className="flex gap-2">
          <Button variant={"outline"} asChild>
            <Link href={"/sign-up"}>Sign Up</Link>
          </Button>
          <Button asChild>
            <Link href={"/sign-in"}>Sign In</Link>
          </Button>
        </nav>
      )}
    </header>
  );
}
