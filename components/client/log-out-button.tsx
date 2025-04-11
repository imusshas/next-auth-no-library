"use client";

import { logout } from "@/actions/auth";
import { Button } from "@/components/ui/button";

export default function LogOutButton() {
  return (
    <Button variant={"destructive"} onClick={logout}>
      Logout
    </Button>
  );
}
