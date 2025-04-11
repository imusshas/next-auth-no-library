import { getCurrentUser } from "@/actions/user";
import ChangeRoleButton from "@/components/client/change-role-button";
import FormCard from "@/components/server/form-card";

export default async function PrivatePage() {
  const user = await getCurrentUser({ withFullUser: true, redirectIfNotFound: true });

  return (
    <FormCard title={user.name || "Guest"} showDescription={false} footer={<ChangeRoleButton />}>
      <p>
        <span className="font-semibold">Email:</span> {user.email}
      </p>
      <p className="text-muted-foreground">
        <span className="font-semibold">Role:</span>&nbsp;
        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
      </p>
    </FormCard>
  );
}
