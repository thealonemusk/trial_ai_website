export type LeaveType = "sick" | "paid" | "casual";
export type LeaveStatus = "pending" | "approved" | "rejected";
export type UserRole = "employee" | "manager" | "admin";

export interface LeaveBalance {
  id: string;
  user_id: string;
  sick_leave_balance: number;
  paid_leave_balance: number;
  casual_leave_balance: number;
  created_at: string;
  updated_at: string;
}

export interface LeaveRequest {
  id: string;
  user_id: string;
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  reason?: string;
  status: LeaveStatus;
  reviewer_id?: string;
  review_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Holiday {
  id: string;
  name: string;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: "employee" | "manager" | "admin";
  created_at: string;
  updated_at: string;
}
