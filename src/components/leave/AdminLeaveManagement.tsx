import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAllLeaveRequests, updateLeaveRequestStatus } from "@/lib/leave";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

export default function AdminLeaveManagement() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDate, setFilterDate] = useState<Date | undefined>(undefined);
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
    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await getAllLeaveRequests();
      if (error) throw error;
      if (data) {
        setLeaveRequests(data);
        setFilteredRequests(data);
      }
    } catch (error) {
      console.error("Error fetching leave requests:", error);
      toast({
        title: "Error",
        description: "Failed to load leave requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Apply filters
    let result = [...leaveRequests];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (request) =>
          request.profiles?.full_name?.toLowerCase().includes(query) ||
          request.profiles?.email?.toLowerCase().includes(query) ||
          request.leave_type.toLowerCase().includes(query) ||
          request.reason?.toLowerCase().includes(query),
      );
    }

    // Apply date filter
    if (filterDate) {
      const dateStr = format(filterDate, "yyyy-MM-dd");
      result = result.filter(
        (request) =>
          request.start_date <= dateStr && request.end_date >= dateStr,
      );
    }

    setFilteredRequests(result);
  }, [leaveRequests, searchQuery, filterDate]);

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

  const clearFilters = () => {
    setSearchQuery("");
    setFilterDate(undefined);
  };

  const pendingRequests = filteredRequests.filter(
    (request) => request.status === "pending",
  );
  const approvedRequests = filteredRequests.filter(
    (request) => request.status === "approved",
  );
  const rejectedRequests = filteredRequests.filter(
    (request) => request.status === "rejected",
  );

  if (loading) {
    return <div className="text-center py-8">Loading leave requests...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Filter Leave Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name, email, or reason"
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Filter by Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filterDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filterDate ? format(filterDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filterDate}
                    onSelect={setFilterDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                className="w-full"
                onClick={clearFilters}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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
                  isManager={true}
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
                  isManager={true}
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
                  isManager={true}
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
