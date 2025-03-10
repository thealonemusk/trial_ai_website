import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getUserLeaveBalance } from "@/lib/leave";
import { LeaveBalance } from "@/types/leave";

export default function LeaveBalanceCard() {
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaveBalance = async () => {
      setLoading(true);
      try {
        const { data, error } = await getUserLeaveBalance();
        if (data) {
          setLeaveBalance(data);
        }
      } catch (error) {
        console.error("Error fetching leave balance:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveBalance();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Leave Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (!leaveBalance) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Leave Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            Unable to load leave balance
          </div>
        </CardContent>
      </Card>
    );
  }

  // Define initial balances for progress calculation
  const initialBalances = {
    sick: 10,
    paid: 20,
    casual: 5,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leave Balance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Sick Leave</span>
              <span className="text-sm font-medium">
                {leaveBalance.sick_leave_balance} / {initialBalances.sick} days
              </span>
            </div>
            <Progress
              value={
                (leaveBalance.sick_leave_balance / initialBalances.sick) * 100
              }
              className="h-2"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Paid Leave</span>
              <span className="text-sm font-medium">
                {leaveBalance.paid_leave_balance} / {initialBalances.paid} days
              </span>
            </div>
            <Progress
              value={
                (leaveBalance.paid_leave_balance / initialBalances.paid) * 100
              }
              className="h-2"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Casual Leave</span>
              <span className="text-sm font-medium">
                {leaveBalance.casual_leave_balance} / {initialBalances.casual}{" "}
                days
              </span>
            </div>
            <Progress
              value={
                (leaveBalance.casual_leave_balance / initialBalances.casual) *
                100
              }
              className="h-2"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
