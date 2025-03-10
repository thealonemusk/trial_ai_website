import { supabase } from "../../supabase/supabase";
import {
  LeaveRequest,
  LeaveType,
  LeaveStatus,
  LeaveBalance,
  Holiday,
  UserRole,
} from "../types/leave";
import { format, differenceInDays, addDays, parseISO } from "date-fns";

// Leave Requests
export async function createLeaveRequest(
  leaveRequest: Omit<
    LeaveRequest,
    | "id"
    | "created_at"
    | "updated_at"
    | "status"
    | "reviewer_id"
    | "review_notes"
  >,
): Promise<{ data: LeaveRequest | null; error: Error | null }> {
  try {
    // Check if user has enough leave balance
    const { data: balanceData, error: balanceError } =
      await getUserLeaveBalance();

    if (balanceError) throw balanceError;
    if (!balanceData) throw new Error("Could not fetch leave balance");

    const days =
      differenceInDays(
        parseISO(leaveRequest.end_date),
        parseISO(leaveRequest.start_date),
      ) + 1;

    // Check if user has enough balance
    let hasEnoughBalance = false;

    switch (leaveRequest.leave_type) {
      case "sick":
        hasEnoughBalance = balanceData.sick_leave_balance >= days;
        break;
      case "paid":
        hasEnoughBalance = balanceData.paid_leave_balance >= days;
        break;
      case "casual":
        hasEnoughBalance = balanceData.casual_leave_balance >= days;
        break;
    }

    if (!hasEnoughBalance) {
      throw new Error(`Not enough ${leaveRequest.leave_type} leave balance`);
    }

    const { data, error } = await supabase
      .from("leave_requests")
      .insert({
        ...leaveRequest,
        status: "pending",
      })
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

export async function getUserLeaveRequests(): Promise<{
  data: LeaveRequest[] | null;
  error: Error | null;
}> {
  try {
    const { data, error } = await supabase
      .from("leave_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

export async function getAllLeaveRequests(): Promise<{
  data: LeaveRequest[] | null;
  error: Error | null;
}> {
  try {
    const { data, error } = await supabase
      .from("leave_requests")
      .select(
        `
        *,
        profiles:user_id(full_name, email)
      `,
      )
      .order("created_at", { ascending: false });

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

export async function updateLeaveRequestStatus(
  requestId: string,
  status: LeaveStatus,
  reviewNotes?: string,
): Promise<{ data: LeaveRequest | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from("leave_requests")
      .update({
        status,
        reviewer_id: (await supabase.auth.getUser()).data.user?.id,
        review_notes: reviewNotes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", requestId)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

// Leave Balances
export async function getUserLeaveBalance(): Promise<{
  data: LeaveBalance | null;
  error: Error | null;
}> {
  try {
    const { data, error } = await supabase
      .from("leave_balances")
      .select("*")
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

// Holidays
export async function getHolidays(): Promise<{
  data: Holiday[] | null;
  error: Error | null;
}> {
  try {
    const { data, error } = await supabase
      .from("holidays")
      .select("*")
      .order("date", { ascending: true });

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

export async function createHoliday(
  holiday: Omit<Holiday, "id" | "created_at" | "updated_at">,
): Promise<{ data: Holiday | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from("holidays")
      .insert(holiday)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

// User Roles
export async function getUserRole(): Promise<{
  data: UserRole | null;
  error: Error | null;
}> {
  try {
    const { data, error } = await supabase
      .from("user_roles")
      .select("*")
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

export async function isManager(): Promise<boolean> {
  const { data } = await getUserRole();
  return data?.role === "manager" || data?.role === "admin";
}

// Helper functions
export function calculateLeaveDuration(
  startDate: string,
  endDate: string,
): number {
  return differenceInDays(new Date(endDate), new Date(startDate)) + 1;
}

export function formatDate(date: string): string {
  return format(new Date(date), "MMM dd, yyyy");
}
