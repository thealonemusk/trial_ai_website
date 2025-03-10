import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getUserLeaveRequests, getHolidays } from "@/lib/leave";
import { LeaveRequest, Holiday } from "@/types/leave";
import { format, isSameDay, isWithinInterval, parseISO } from "date-fns";

export default function LeaveCalendar() {
  const [date, setDate] = useState<Date>(new Date());
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [leaveResponse, holidaysResponse] = await Promise.all([
          getUserLeaveRequests(),
          getHolidays(),
        ]);

        if (leaveResponse.data) {
          setLeaveRequests(leaveResponse.data);
        }

        if (holidaysResponse.data) {
          setHolidays(holidaysResponse.data);
        }
      } catch (error) {
        console.error("Error fetching calendar data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter to only approved leave requests
  const approvedLeaves = leaveRequests.filter(
    (leave) => leave.status === "approved",
  );

  // Function to check if a date has an event
  const getDayContent = (day: Date) => {
    // Check if day is a holiday
    const holiday = holidays.find((h) => isSameDay(parseISO(h.date), day));

    // Check if day is within an approved leave
    const leave = approvedLeaves.find((l) =>
      isWithinInterval(day, {
        start: parseISO(l.start_date),
        end: parseISO(l.end_date),
      }),
    );

    if (holiday) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <Badge
            variant="outline"
            className="bg-red-100 text-red-800 border-red-200 text-xs"
          >
            Holiday
          </Badge>
        </div>
      );
    }

    if (leave) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <Badge
            variant="outline"
            className={`text-xs ${
              leave.leave_type === "sick"
                ? "bg-blue-100 text-blue-800 border-blue-200"
                : leave.leave_type === "paid"
                  ? "bg-purple-100 text-purple-800 border-purple-200"
                  : "bg-orange-100 text-orange-800 border-orange-200"
            }`}
          >
            {leave.leave_type.charAt(0).toUpperCase() +
              leave.leave_type.slice(1)}
          </Badge>
        </div>
      );
    }

    return null;
  };

  // Get events for the selected date
  const selectedDateEvents = () => {
    const events = [];

    // Check for holidays
    const holiday = holidays.find((h) => isSameDay(parseISO(h.date), date));
    if (holiday) {
      events.push({
        type: "holiday",
        name: holiday.name,
        date: format(parseISO(holiday.date), "MMMM d, yyyy"),
      });
    }

    // Check for leaves
    const leaves = approvedLeaves.filter((l) =>
      isWithinInterval(date, {
        start: parseISO(l.start_date),
        end: parseISO(l.end_date),
      }),
    );

    leaves.forEach((leave) => {
      events.push({
        type: "leave",
        leaveType: leave.leave_type,
        startDate: format(parseISO(leave.start_date), "MMMM d, yyyy"),
        endDate: format(parseISO(leave.end_date), "MMMM d, yyyy"),
      });
    });

    return events;
  };

  const events = selectedDateEvents();

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Leave Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-[400px]">
                <p>Loading calendar...</p>
              </div>
            ) : (
              <Calendar
                mode="single"
                selected={date}
                onSelect={(date) => date && setDate(date)}
                className="rounded-md border w-full"
                components={{
                  DayContent: ({ day }) => getDayContent(day),
                }}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle>{format(date, "MMMM d, yyyy")}</CardTitle>
          </CardHeader>
          <CardContent>
            {events.length > 0 ? (
              <div className="space-y-4">
                {events.map((event, index) => (
                  <div key={index} className="border-l-4 pl-3 py-2">
                    {event.type === "holiday" ? (
                      <div className="border-red-500">
                        <p className="font-medium">{event.name}</p>
                        <p className="text-sm text-muted-foreground">Holiday</p>
                      </div>
                    ) : (
                      <div
                        className={`${
                          event.leaveType === "sick"
                            ? "border-blue-500"
                            : event.leaveType === "paid"
                              ? "border-purple-500"
                              : "border-orange-500"
                        }`}
                      >
                        <p className="font-medium">
                          {event.leaveType.charAt(0).toUpperCase() +
                            event.leaveType.slice(1)}{" "}
                          Leave
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {event.startDate} - {event.endDate}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No events for this date</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
