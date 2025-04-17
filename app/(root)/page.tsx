import { getCurrentUser } from "@/actions/user";

export default async function Home() {
  const user = await getCurrentUser({ withFullUser: true });

  return (
    <div>
      <h1 className="text-3xl md:text-5xl lg:text-7xl font-black">
        Hello&nbsp;<span className="text-muted-foreground">{user?.name || "Guest"}</span>
      </h1>
    </div>
  );
}
