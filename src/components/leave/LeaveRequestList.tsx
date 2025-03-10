import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getUserLeaveRequests,
  updateLeaveRequestStatus,
  isManager,
} from "@/lib/leave";
import { LeaveRequest, LeaveStatus } from "@/types/leave";
import LeaveRequestCard from "./LeaveRequestCard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

export default function LeaveRequestList() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [userIsManager, setUserIsManager] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null,
  );
  const [reviewNotes, setReviewNotes] = useState("");
  const [dialogAction, setDialogAction] = useState<"approve" | "reject" | null>(
    null,
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [leaveResponse, managerStatus] = await Promise.all([
          getUserLeaveRequests(),
          isManager(),
        ]);

        if (leaveResponse.data) {
          setLeaveRequests(leaveResponse.data);
        }

        setUserIsManager(managerStatus);
      } catch (error) {
        console.error("Error fetching leave requests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleApprove = (id: string) => {
    setSelectedRequestId(id);
    setDialogAction("approve");
    setReviewNotes("");
    setDialogOpen(true);
  };

  const handleReject = (id: string) => {
    setSelectedRequestId(id);
    setDialogAction("reject");
    setReviewNotes("");
    setDialogOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedRequestId || !dialogAction) return;

    try {
      const status: LeaveStatus =
        dialogAction === "approve" ? "approved" : "rejected";
      const { data, error } = await updateLeaveRequestStatus(
        selectedRequestId,
        status,
        reviewNotes,
      );

      if (error) throw error;

      // Update the local state
      setLeaveRequests((prev) =>
        prev.map((request) =>
          request.id === selectedRequestId
            ? { ...request, status, review_notes: reviewNotes }
            : request,
        ),
      );

      toast({
        title: `Request ${status}`,
        description: `The leave request has been ${status}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : `Failed to ${dialogAction} leave request`,
        variant: "destructive",
      });
    } finally {
      setDialogOpen(false);
      setSelectedRequestId(null);
      setDialogAction(null);
    }
  };

  const pendingRequests = leaveRequests.filter(
    (request) => request.status === "pending",
  );
  const approvedRequests = leaveRequests.filter(
    (request) => request.status === "approved",
  );
  const rejectedRequests = leaveRequests.filter(
    (request) => request.status === "rejected",
  );

  if (loading) {
    return <div className="text-center py-8">Loading leave requests...</div>;
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="pending">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">
            Pending ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({approvedRequests.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({rejectedRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {pendingRequests.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pendingRequests.map((request) => (
                <LeaveRequestCard
                  key={request.id}
                  leaveRequest={request}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  isManager={userIsManager}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No pending leave requests</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="mt-6">
          {approvedRequests.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {approvedRequests.map((request) => (
                <LeaveRequestCard
                  key={request.id}
                  leaveRequest={request}
                  isManager={userIsManager}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No approved leave requests</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="mt-6">
          {rejectedRequests.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {rejectedRequests.map((request) => (
                <LeaveRequestCard
                  key={request.id}
                  leaveRequest={request}
                  isManager={userIsManager}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No rejected leave requests</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogAction === "approve" ? "Approve" : "Reject"} Leave Request
            </DialogTitle>
            <DialogDescription>
              {dialogAction === "approve"
                ? "Are you sure you want to approve this leave request?"
                : "Please provide a reason for rejecting this leave request."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Review Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes or comments"
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={dialogAction === "approve" ? "default" : "destructive"}
              onClick={handleConfirmAction}
            >
              {dialogAction === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
