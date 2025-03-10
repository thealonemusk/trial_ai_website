import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import LeaveRequestForm from "@/components/leave/LeaveRequestForm";

export default function LeaveRequestPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center mb-6">
        <Link to="/leave/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        </Link>
      </div>

      <LeaveRequestForm />
    </div>
  );
}
