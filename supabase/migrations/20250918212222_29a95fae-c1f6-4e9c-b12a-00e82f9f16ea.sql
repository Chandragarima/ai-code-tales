-- Fix critical security issues

-- 1. Enable RLS on projects_public view by adding policies
-- Since this is a view, we need to ensure it respects RLS from the underlying table
ALTER VIEW public.projects_public SET (security_invoker = true);

-- 2. Fix database functions to have explicit search_path for security
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Create profile with basic info from auth user
  INSERT INTO public.profiles (
    user_id,
    username,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NOW(),
    NOW()
  );
  
  RETURN NEW;
END;
$function$;

-- Note: update_updated_at_column already has search_path = 'public' set