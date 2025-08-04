import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FaGoogle } from "react-icons/fa";
import { Building2 } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6 text-center">
          <div className="mb-6">
            <Building2 className="mx-auto h-12 w-12 text-blue-600 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">PropertyCRM</h1>
            <p className="text-gray-600">Professional Property Management</p>
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-4">
              Streamline your property management workflow with our comprehensive CRM solution.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => window.location.href = '/api/auth/google'}
              className="w-full flex items-center justify-center space-x-2 bg-white text-gray-900 border border-gray-300 hover:bg-gray-50"
              data-testid="button-google-login"
            >
              <FaGoogle className="w-4 h-4 text-red-500" />
              <span>Sign in with Google</span>
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
              onClick={() => window.location.href = '/api/login'}
              className="w-full"
              data-testid="button-replit-login"
            >
              Sign in with Replit
            </Button>
          </div>

          <p className="text-xs text-gray-500 mt-4">
            Access your contacts, leads, and property management tools
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
