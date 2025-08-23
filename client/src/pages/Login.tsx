import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FaGoogle } from "react-icons/fa";
import { Building2 } from "lucide-react";
import { handleSocialLogin } from "@/utils/socialLogin";

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Building2 className="mx-auto h-12 w-12 text-blue-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            <p className="text-black dark:text-gray-200">
              Professional Property Management
            </p>
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to manage your properties and contacts
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Choose your sign-in method</CardTitle>
            <CardDescription>
              Select how you'd like to access your PropertyCRM account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => handleSocialLogin("google")}
              className="w-full flex items-center justify-center space-x-2 bg-white text-gray-900 border border-gray-300 hover:bg-gray-50"
              data-testid="button-google-login"
            >
              <FaGoogle className="w-5 h-5 text-red-500" />
              <span>Continue with Google</span>
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            <Button
              onClick={() => (window.location.href = "/api/login")}
              className="w-full"
              data-testid="button-replit-login"
            >
              Continue with Replit
            </Button>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            By signing in, you agree to our terms of service and privacy policy
          </p>
        </div>
      </div>
    </div>
  );
}
