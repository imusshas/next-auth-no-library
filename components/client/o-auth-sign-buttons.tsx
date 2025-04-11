"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { oAuthSignIn } from "@/actions/auth";
import GoogleIcon from "@/public/google.svg";
import GithubIcon from "@/public/github.svg";
import DiscordIcon from "@/public/discord.svg";

export default function OAuthSignButtons() {
  return (
    <div className="flex justify-center gap-8">
      <Button type="button" variant={"outline"} onClick={async () => oAuthSignIn("github")} className="flex-1 h-fit">
        <Image src={GoogleIcon} alt="github icon" className="h-8 w-8" />
        <span>Google</span>
      </Button>
      <Button type="button" variant={"outline"} onClick={async () => oAuthSignIn("github")} className="flex-1 h-fit">
        <Image src={GithubIcon} alt="github icon" className="h-8 w-8" />
        <span>Github</span>
      </Button>

      <Button type="button" variant={"outline"} onClick={async () => oAuthSignIn("discord")} className="flex-1 h-fit">
        <Image src={DiscordIcon} alt="github icon" className="h-8 w-8" />
        <span>Discord</span>
      </Button>
    </div>
  );
}
