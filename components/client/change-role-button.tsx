"use client";

import { toggleUserRole } from "@/actions/user";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function ChangeRoleButton() {
  const [pending, setPending] = useState<boolean>(false);
  async function handleChange() {
    setPending(true);
    await toggleUserRole();
    setPending(false);
  }

  return (
    <Button variant={"outline"} onClick={handleChange} disabled={pending}>
      Change Role
    </Button>
  );
}
