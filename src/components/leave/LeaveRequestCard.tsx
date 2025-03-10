import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate, calculateLeaveDuration } from "@/lib/leave";
import { LeaveRequest, LeaveStatus } from "@/types/leave";
import { CalendarDays, Clock } from "lucide-react";

interface LeaveRequestCardProps {
  leaveRequest: LeaveRequest;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  isManager?: boolean;
}

export default function LeaveRequestCard({
  leaveRequest,
  onApprove,
  onReject,
  isManager = false,
}: LeaveRequestCardProps) {
  const getStatusColor = (status: LeaveStatus) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "pending":
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  const getLeaveTypeColor = (type: string) => {
    switch (type) {
      case "sick":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "paid":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "casual":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const duration = calculateLeaveDuration(
    leaveRequest.start_date,
    leaveRequest.end_date,
  );

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-medium">
            {leaveRequest.leave_type.charAt(0).toUpperCase() +
              leaveRequest.leave_type.slice(1)}{" "}
            Leave
          </CardTitle>
          <Badge className={getStatusColor(leaveRequest.status)}>
            {leaveRequest.status.charAt(0).toUpperCase() +
              leaveRequest.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <span>
              {formatDate(leaveRequest.start_date)} -{" "}
              {formatDate(leaveRequest.end_date)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>
              {duration} day{duration > 1 ? "s" : ""}
            </span>
          </div>
          {leaveRequest.reason && (
            <div className="mt-2">
              <p className="text-sm text-muted-foreground font-medium">
                Reason:
              </p>
              <p className="text-sm mt-1">{leaveRequest.reason}</p>
            </div>
          )}
          {leaveRequest.review_notes && (
            <div className="mt-2">
              <p className="text-sm text-muted-foreground font-medium">
                Review Notes:
              </p>
              <p className="text-sm mt-1">{leaveRequest.review_notes}</p>
            </div>
          )}
        </div>
      </CardContent>
      {isManager && leaveRequest.status === "pending" && (
        <CardFooter className="pt-2">
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => onReject && onReject(leaveRequest.id)}
            >
              Reject
            </Button>
            <Button
              className="w-full"
              onClick={() => onApprove && onApprove(leaveRequest.id)}
            >
              Approve
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
