-- Set default leave balances for all users
CREATE OR REPLACE FUNCTION set_default_leave_balance()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO leave_balances (user_id, sick_leave_balance, paid_leave_balance, casual_leave_balance)
  VALUES (NEW.id, 10, 20, 5);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set leave balance for new users
DROP TRIGGER IF EXISTS set_default_leave_balance_trigger ON profiles;
CREATE TRIGGER set_default_leave_balance_trigger
AFTER INSERT ON profiles
FOR EACH ROW
EXECUTE FUNCTION set_default_leave_balance();

-- Set leave balances for existing users who don't have them yet
INSERT INTO leave_balances (user_id, sick_leave_balance, paid_leave_balance, casual_leave_balance)
SELECT id, 10, 20, 5 FROM profiles
WHERE id NOT IN (SELECT user_id FROM leave_balances WHERE user_id IS NOT NULL);

-- Add this table to realtime publication
alter publication supabase_realtime add table leave_balances;
