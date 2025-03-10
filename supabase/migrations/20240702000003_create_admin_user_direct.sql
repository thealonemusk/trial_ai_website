-- Create admin user directly with SQL functions

-- Create admin user
DO $$
DECLARE
  admin_id UUID;
  admin_email TEXT := 'admin@example.com';
  admin_password TEXT := 'admin123';
BEGIN
  -- Check if user already exists
  SELECT id INTO admin_id FROM auth.users WHERE email = admin_email;
  
  IF admin_id IS NULL THEN
    -- Create new user
    admin_id := gen_random_uuid();
    
    -- Insert directly into auth.users
    INSERT INTO auth.users 
      (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data) 
    VALUES 
      (admin_id, admin_email, crypt(admin_password, gen_salt('bf')), now(), now(), now(), 
       '{"provider":"email","providers":["email"]}'::jsonb, 
       '{"full_name":"Admin User"}'::jsonb);
       
    -- Create profile
    INSERT INTO public.profiles (id, full_name, email)
    VALUES (admin_id, 'Admin User', admin_email);
    
    -- Set admin role
    INSERT INTO public.user_roles (id, user_id, role, created_at, updated_at)
    VALUES (gen_random_uuid(), admin_id, 'admin', now(), now());
    
    -- Create leave balance
    INSERT INTO public.leave_balances 
      (id, user_id, sick_leave_balance, paid_leave_balance, casual_leave_balance, created_at, updated_at)
    VALUES 
      (gen_random_uuid(), admin_id, 10, 20, 5, now(), now());
  END IF;
END
$$;
