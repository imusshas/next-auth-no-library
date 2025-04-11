import SignUpForm from "@/components/client/sign-up-form";
import FormCard from "@/components/server/form-card";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <FormCard
      title="Sign Up"
      footer={
        <p>
          Don&apos;t have an account?{" "}
          <Link href={"/sign-in"} className="hover:underline">
            Login
          </Link>
        </p>
      }
    >
      <SignUpForm />
    </FormCard>
  );
}
