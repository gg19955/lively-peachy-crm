import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Building2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { FaGoogle } from "react-icons/fa";
import { MdEmail, MdLock } from "react-icons/md";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useRouter } from "@/hooks/use-router";
import { apiRequest } from "@/lib/queryClient";
import { handleSocialLogin } from "@/utils/socialLogin";

// ✅ Zod schema for validation
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const { push } = useRouter();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginForm) => {
      return apiRequest("/api/auth/login", { method: "POST", body: data });
    },
    onSuccess: () => console.log("Login successful"),
    onError: (error: Error) => console.error("Login failed:", error.message),
  });

  const onSubmit = (data: LoginForm) => loginMutation.mutate(data);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-md w-full space-y-8">
        {/* Logo + heading */}
        <div className="text-center">
          <Building2 className="mx-auto h-12 w-12 text-primary" />
          <h2 className="mt-6 text-xl font-extrabold">
            Professional Property Management
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to manage your properties and contacts
          </p>
        </div>

        {/* Card */}
        <Card className="bg-card text-card-foreground border border-border">
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>
              Use your email and password or continue with Google
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <div className="flex items-center border rounded-md px-2 border-border bg-input">
                          <MdEmail className="text-muted-foreground mr-2" />
                          <input
                            className="flex-1 border-0 focus:outline-none focus:ring-0 px-3 py-2 text-sm bg-input text-foreground placeholder-muted-foreground"
                            type="email"
                            placeholder="Enter email address"
                            {...field}
                            value={field.value || ""}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="flex items-center border rounded-md px-2 border-border bg-input">
                          <MdLock className="text-muted-foreground mr-2" />
                          <input
                            className="flex-1 border-0 focus:outline-none focus:ring-0 px-3 py-2 text-sm bg-input text-foreground placeholder-muted-foreground"
                            type="password"
                            placeholder="Enter password"
                            {...field}
                            value={field.value || ""}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Forgot password + Sign Up */}
                <div className="flex justify-between text-sm text-primary">
                  <a
                    href="/forgot-password"
                    className="hover:underline font-bold"
                  >
                    Forgot password?
                  </a>
                  <p
                    onClick={() => push("/sign-up")}
                    className="hover:underline font-bold cursor-pointer"
                  >
                    Sign up
                  </p>
                </div>

                {/* Submit */}
                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    disabled={loginMutation.isPending}
                    className="w-full"
                  >
                    {loginMutation.isPending ? "Loading..." : "Sign in"}
                  </Button>
                </div>
              </form>
            </Form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 text-muted-foreground">or</span>
              </div>
            </div>

            {/* Google Login */}
            <Button
              onClick={() => handleSocialLogin("google")}
              className="w-full flex items-center justify-center space-x-2 bg-background text-foreground border border-border hover:bg-muted"
            >
              <FaGoogle className="w-5 h-5 text-red-500" />
              <span>Continue with Google</span>
            </Button>
          </CardContent>
        </Card>

        {/* Footer with terms */}
        <div className="text-center mt-4 text-xs text-muted-foreground">
          <p>
            By signing in, you agree to our terms of service and privacy policy.
          </p>
        </div>
      </div>
    </div>
  );
}
