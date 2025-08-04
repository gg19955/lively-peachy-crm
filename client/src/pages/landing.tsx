import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6 text-center">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">PropertyCRM</h1>
            <p className="text-gray-600">Professional Property Management</p>
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-4">
              Streamline your property management workflow with our comprehensive CRM solution.
            </p>
          </div>

          <Button 
            onClick={() => window.location.href = '/api/login'}
            className="w-full"
            data-testid="button-login"
          >
            Sign In to Continue
          </Button>

          <p className="text-xs text-gray-500 mt-4">
            Access your contacts, leads, and property management tools
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
