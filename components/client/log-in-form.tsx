"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SigninFormSchema } from "@/schemas/authSchema";
import { signin } from "@/actions/auth";
import OAuthSignButtons from "@/components/client/o-auth-sign-buttons";

export default function LogInForm({ oauthError }: { oauthError?: string }) {
  // TODO: Implement Show Password
  // const [showPassword, setShowPassword] = useState<boolean>(false);

  const form = useForm<z.infer<typeof SigninFormSchema>>({
    resolver: zodResolver(SigninFormSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof SigninFormSchema>) {
    const formData = new FormData();
    formData.set("email", values.email);
    formData.set("password", values.password);
    const errors = await signin(formData);

    if (errors) {
      // Map server errors to react-hook-form
      Object.entries(errors).forEach(([field, messages]) => {
        if (messages && messages.length > 0) {
          form.setError(field as keyof typeof values, {
            type: "server",
            message: messages[0],
          });
        }
      });
    } else {
      form.reset();
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-3xl mx-auto py-10">
        <OAuthSignButtons />
        {oauthError && <FormMessage>{oauthError}</FormMessage>}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Email" type="email" autoComplete="off" {...field} />
              </FormControl>
              <FormDescription>Enter your email</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input placeholder="Password" type="password" autoComplete="off" {...field} />
              </FormControl>
              <FormDescription>Enter your password</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting || !form.formState.isValid}>
          Log In
        </Button>
      </form>
    </Form>
  );
}
