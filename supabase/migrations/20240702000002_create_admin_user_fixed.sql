-- Create admin user with UUID
DO $$
DECLARE
  admin_id UUID := gen_random_uuid();
BEGIN
  -- Insert into auth.users
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES (
    admin_id,
    'admin@example.com',
    crypt('admin123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Admin User"}'::jsonb,
    now(),
    now()
  )
  ON CONFLICT (email) DO NOTHING;

  -- Create user profile
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    admin_id,
    'Admin User',
    'admin@example.com'
  )
  ON CONFLICT (id) DO NOTHING;

  -- Set admin role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (admin_id, 'admin')
  ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

  -- Create leave balance for admin
  INSERT INTO public.leave_balances (user_id, sick_leave_balance, paid_leave_balance, casual_leave_balance)
  VALUES (admin_id, 10, 20, 5)
  ON CONFLICT (user_id) DO NOTHING;
END
$$;
