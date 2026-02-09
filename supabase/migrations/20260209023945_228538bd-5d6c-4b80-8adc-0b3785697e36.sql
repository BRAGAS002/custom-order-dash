
-- Update handle_new_user to also insert a user_role based on metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  _role app_role;
BEGIN
    -- Create profile
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    );

    -- Assign role (default to 'customer' if not specified)
    _role := COALESCE(
      (NEW.raw_user_meta_data->>'role')::app_role,
      'customer'::app_role
    );

    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, _role);

    RETURN NEW;
END;
$function$;

-- Ensure the trigger exists on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
