import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, ClipboardList, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import LeaveBalanceCard from "@/components/leave/LeaveBalanceCard";
import LeaveRequestList from "@/components/leave/LeaveRequestList";
import LeaveCalendar from "@/components/leave/LeaveCalendar";
import { getUserRole } from "@/lib/leave";
import { UserRole } from "@/types/leave";

export default function LeaveDashboard() {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const { data } = await getUserRole();
        if (data) {
          setUserRole(data.role);
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Leave Management</h1>
        <Link to="/leave/request">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Request Leave
          </Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <LeaveBalanceCard />

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Link to="/leave/request" className="w-full">
                <Button variant="outline" className="w-full h-24 flex flex-col">
                  <Plus className="h-6 w-6 mb-2" />
                  <span>New Request</span>
                </Button>
              </Link>
              <Link to="/leave/calendar" className="w-full">
                <Button variant="outline" className="w-full h-24 flex flex-col">
                  <CalendarDays className="h-6 w-6 mb-2" />
                  <span>View Calendar</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="requests">
        <TabsList>
          <TabsTrigger value="requests">
            <ClipboardList className="mr-2 h-4 w-4" />
            My Requests
          </TabsTrigger>
          <TabsTrigger value="calendar">
            <CalendarDays className="mr-2 h-4 w-4" />
            Calendar
          </TabsTrigger>
        </TabsList>
        <TabsContent value="requests" className="mt-6">
          <LeaveRequestList />
        </TabsContent>
        <TabsContent value="calendar" className="mt-6">
          <LeaveCalendar />
        </TabsContent>
      </Tabs>
    </div>
  );
}
