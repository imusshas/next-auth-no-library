import LogInForm from "@/components/client/log-in-form";
import FormCard from "@/components/server/form-card";
import Link from "next/link";

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ oauthError?: string }> }) {
  const { oauthError } = await searchParams;
  return (
    <FormCard
      title="Sign In"
      footer={
        <p>
          Already have an account?{" "}
          <Link href={"/sign-up"} className="hover:underline">
            Sign Up
          </Link>
        </p>
      }
    >
      <LogInForm oauthError={oauthError} />
    </FormCard>
  );
}
