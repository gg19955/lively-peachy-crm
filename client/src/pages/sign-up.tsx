import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Building2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { FaGoogle } from "react-icons/fa";
import { MdEmail, MdLock, MdPerson } from "react-icons/md";
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
import { apiRequest } from "@/lib/queryClient";
import { handleSocialLogin } from "@/utils/socialLogin";
import { useRouter } from "@/hooks/use-router";
import { useTheme } from "@/components/ThemeProvider";
import Agreement from "@/components/Agreement";
import { toast } from "sonner";

// ✅ Zod schema for validation
const signupSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type SignupForm = z.infer<typeof signupSchema>;

export default function Signup() {
  const { theme } = useTheme();
  const { push } = useRouter();

  const form = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (data: SignupForm) => {
      return apiRequest("/auth/signup", { method: "POST", body: data });
    },
    onSuccess: () => console.log("Signup successful"),
    onError: (error: Error) => toast.error(error.message),
  });

  const onSubmit = (data: SignupForm) => signupMutation.mutate(data);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground transition-colors duration-300 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo + heading */}
        <div className="text-center">
          <Building2 className="mx-auto h-12 w-12 text-primary" />
          <h2 className="mt-6 text-xl font-extrabold">Create Your Account</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign up to manage your properties and contacts
          </p>
        </div>

        {/* Card */}
        <Card className="bg-card text-card-foreground border border-border transition-colors duration-300">
          <CardHeader>
            <CardTitle>Sign up</CardTitle>
            <CardDescription>
              Use your details or continue with Google
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                {/* Full Name */}
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <div className="flex items-center border rounded-md px-2 border-border bg-input transition-colors duration-300">
                          <MdPerson className="text-muted-foreground mr-2" />
                          <input
                            className="flex-1 border-0 focus:outline-none focus:ring-0 px-3 py-2 text-sm bg-input text-foreground placeholder-muted-foreground"
                            type="fullName"
                            placeholder="Enter full name"
                            {...field}
                            value={field.value || ""}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <div className="flex items-center border rounded-md px-2 border-border bg-input transition-colors duration-300">
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
                        <div className="flex items-center border rounded-md px-2 border-border bg-input transition-colors duration-300">
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

                {/* Submit */}
                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    disabled={form.formState.isSubmitting}
                    className="w-full"
                  >
                    {form.formState.isSubmitting ? "Loading..." : "Sign up"}
                  </Button>
                </div>
              </form>
            </Form>

            {/* Already have an account */}
            <div className="text-center mt-4">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <span
                  onClick={() => push("/sign-in")}
                  className="text-primary cursor-pointer font-bold hover:underline"
                >
                  Sign in
                </span>
              </p>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border transition-colors duration-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2  text-muted-foreground">or</span>
              </div>
            </div>

            {/* Google Signup */}
            <Button
              onClick={() => handleSocialLogin("google")}
              className="w-full flex items-center justify-center space-x-2 bg-background text-foreground border border-border hover:bg-muted transition-colors duration-300"
            >
              <FaGoogle className="w-5 h-5 text-red-500" />
              <span>Continue with Google</span>
            </Button>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <Agreement type="signing up" />
        </div>
      </div>
    </div>
  );
}
