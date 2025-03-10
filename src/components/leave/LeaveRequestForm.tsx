import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { createLeaveRequest, getUserLeaveBalance } from "@/lib/leave";
import { LeaveBalance } from "@/types/leave";

const formSchema = z
  .object({
    leave_type: z.enum(["sick", "paid", "casual"], {
      required_error: "Please select a leave type",
    }),
    start_date: z.date({
      required_error: "Please select a start date",
    }),
    end_date: z.date({
      required_error: "Please select an end date",
    }),
    reason: z.string().min(5, "Reason must be at least 5 characters").max(500),
  })
  .refine((data) => data.end_date >= data.start_date, {
    message: "End date must be after start date",
    path: ["end_date"],
  });

export default function LeaveRequestForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reason: "",
    },
  });

  // Fetch leave balance when component mounts
  useState(() => {
    const fetchLeaveBalance = async () => {
      const { data, error } = await getUserLeaveBalance();
      if (data) {
        setLeaveBalance(data);
      }
    };
    fetchLeaveBalance();
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const { data, error } = await createLeaveRequest({
        leave_type: values.leave_type,
        start_date: format(values.start_date, "yyyy-MM-dd"),
        end_date: format(values.end_date, "yyyy-MM-dd"),
        reason: values.reason,
        user_id: "", // This will be set by the backend based on the authenticated user
      });

      if (error) throw error;

      toast({
        title: "Leave request submitted",
        description: "Your leave request has been submitted for approval.",
      });

      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to submit leave request",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-2xl font-semibold mb-6">Request Leave</h2>

      {leaveBalance && (
        <div className="grid grid-cols-3 gap-4 mb-6 bg-slate-50 p-4 rounded-md">
          <div>
            <p className="text-sm text-muted-foreground">Sick Leave</p>
            <p className="text-2xl font-semibold">
              {leaveBalance.sick_leave_balance}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Paid Leave</p>
            <p className="text-2xl font-semibold">
              {leaveBalance.paid_leave_balance}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Casual Leave</p>
            <p className="text-2xl font-semibold">
              {leaveBalance.casual_leave_balance}
            </p>
          </div>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="leave_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Leave Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select leave type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="sick">Sick Leave</SelectItem>
                    <SelectItem value="paid">Paid Leave</SelectItem>
                    <SelectItem value="casual">Casual Leave</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Select the type of leave you want to request
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="start_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Start Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="end_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>End Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => {
                          const startDate = form.getValues().start_date;
                          return (
                            date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                            (startDate && date < startDate)
                          );
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="reason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reason</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Please provide a reason for your leave request"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Briefly explain why you need this leave
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
