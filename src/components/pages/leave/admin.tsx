import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import AdminLeaveManagement from "@/components/leave/AdminLeaveManagement";

export default function LeaveAdminPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center mb-6">
        <Link to="/leave/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        </Link>
        <h1 className="text-2xl font-bold ml-4">Leave Management Admin</h1>
      </div>

      <AdminLeaveManagement />
    </div>
  );
}
