import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

export default function AdminInfo() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Admin Information</h1>

      <Card>
        <CardHeader>
          <CardTitle>Admin Login Credentials</CardTitle>
          <CardDescription>
            Use these credentials to access the admin panel
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>Admin User Created</AlertTitle>
            <AlertDescription>
              An admin user has been created for you to test the admin
              functionality.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium">Email:</h3>
              <p className="font-mono bg-slate-100 p-2 rounded">
                admin@example.com
              </p>
            </div>
            <div>
              <h3 className="font-medium">Password:</h3>
              <p className="font-mono bg-slate-100 p-2 rounded">admin123</p>
            </div>
          </div>

          <div className="pt-4">
            <h3 className="font-medium mb-2">Admin Features:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Approve or reject leave requests from all users</li>
              <li>View all employee leave balances</li>
              <li>Manage holidays and company-wide time off</li>
              <li>Access to the Leave Admin panel in the sidebar</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
