-- Create leave types enum
CREATE TYPE leave_type AS ENUM ('sick', 'paid', 'casual');

-- Create leave request status enum
CREATE TYPE leave_status AS ENUM ('pending', 'approved', 'rejected');

-- Create leave_balances table
CREATE TABLE IF NOT EXISTS leave_balances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  sick_leave_balance INTEGER NOT NULL DEFAULT 10,
  paid_leave_balance INTEGER NOT NULL DEFAULT 20,
  casual_leave_balance INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create leave_requests table
CREATE TABLE IF NOT EXISTS leave_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  leave_type leave_type NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  status leave_status NOT NULL DEFAULT 'pending',
  reviewer_id UUID REFERENCES auth.users(id),
  review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create holidays table
CREATE TABLE IF NOT EXISTS holidays (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_roles table to distinguish between employees and managers
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('employee', 'manager', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies
ALTER TABLE leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Policies for leave_balances
CREATE POLICY "Users can view own leave balances" 
ON leave_balances FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Managers can view all leave balances" 
ON leave_balances FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_roles.user_id = auth.uid() 
  AND user_roles.role IN ('manager', 'admin')
));

-- Policies for leave_requests
CREATE POLICY "Users can view own leave requests" 
ON leave_requests FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own leave requests" 
ON leave_requests FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pending leave requests" 
ON leave_requests FOR UPDATE 
USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Managers can view all leave requests" 
ON leave_requests FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_roles.user_id = auth.uid() 
  AND user_roles.role IN ('manager', 'admin')
));

CREATE POLICY "Managers can update leave requests" 
ON leave_requests FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_roles.user_id = auth.uid() 
  AND user_roles.role IN ('manager', 'admin')
));

-- Policies for holidays
CREATE POLICY "Everyone can view holidays" 
ON holidays FOR SELECT 
USING (true);

CREATE POLICY "Only managers can manage holidays" 
ON holidays FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_roles.user_id = auth.uid() 
  AND user_roles.role IN ('manager', 'admin')
));

-- Policies for user_roles
CREATE POLICY "Users can view own role" 
ON user_roles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Managers can view all roles" 
ON user_roles FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_roles.user_id = auth.uid() 
  AND user_roles.role IN ('manager', 'admin')
));

CREATE POLICY "Only admins can manage roles" 
ON user_roles FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_roles.user_id = auth.uid() 
  AND user_roles.role = 'admin'
));

-- Enable realtime for these tables
alter publication supabase_realtime add table leave_balances;
alter publication supabase_realtime add table leave_requests;
alter publication supabase_realtime add table holidays;
alter publication supabase_realtime add table user_roles;

-- Create function to update leave balances when a leave request is approved
CREATE OR REPLACE FUNCTION update_leave_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
    -- Calculate number of days
    DECLARE
      days_count INTEGER;
    BEGIN
      days_count := (NEW.end_date - NEW.start_date) + 1;
      
      -- Update the appropriate balance based on leave type
      IF NEW.leave_type = 'sick' THEN
        UPDATE leave_balances
        SET sick_leave_balance = sick_leave_balance - days_count,
            updated_at = now()
        WHERE user_id = NEW.user_id;
      ELSIF NEW.leave_type = 'paid' THEN
        UPDATE leave_balances
        SET paid_leave_balance = paid_leave_balance - days_count,
            updated_at = now()
        WHERE user_id = NEW.user_id;
      ELSIF NEW.leave_type = 'casual' THEN
        UPDATE leave_balances
        SET casual_leave_balance = casual_leave_balance - days_count,
            updated_at = now()
        WHERE user_id = NEW.user_id;
      END IF;
    END;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating leave balances
CREATE TRIGGER update_leave_balance_on_approval
AFTER UPDATE ON leave_requests
FOR EACH ROW
EXECUTE FUNCTION update_leave_balance();

-- Create function to initialize leave balance for new users
CREATE OR REPLACE FUNCTION initialize_user_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Create leave balance for new user
  INSERT INTO leave_balances (user_id)
  VALUES (NEW.id);
  
  -- Set default role as employee
  INSERT INTO user_roles (user_id, role)
  VALUES (NEW.id, 'employee');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to initialize user data on signup
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION initialize_user_data();
