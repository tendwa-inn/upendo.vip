
-- Function to create a detailed notification when a promo is redeemed
CREATE OR REPLACE FUNCTION notify_promo_redeemed() 
RETURNS TRIGGER AS $$ 
DECLARE 
  promo_name TEXT;
  promo_desc TEXT;
  formatted_expiry_date TEXT;
BEGIN 
  -- Get the name and description of the redeemed promo code
  SELECT name, description INTO promo_name, promo_desc
  FROM promo_codes 
  WHERE id = NEW.promo_code_id; 

  -- Format the expiration date for display
  formatted_expiry_date := to_char(NEW.expires_at, 'Month DD, YYYY');

  -- Insert a new notification for the user with the detailed message
  INSERT INTO public.notifications (user_id, type, title, message) 
  VALUES ( 
    NEW.user_id, 
    'promo-redemption', 
    'Promo Redeemed: ' || promo_name, 
    'Your promo code \'' || promo_name || '\' has been redeemed successfully. ' || COALESCE(promo_desc, '') || ' It will expire on ' || formatted_expiry_date || '.'
  ); 

  RETURN NEW; 
END; 
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the old trigger if it exists to avoid conflicts
DROP TRIGGER IF EXISTS trigger_notify_promo_redeemed ON public.user_promos;

-- Recreate the trigger to use the updated function
CREATE TRIGGER trigger_notify_promo_redeemed 
AFTER INSERT ON public.user_promos 
FOR EACH ROW 
EXECUTE FUNCTION notify_promo_redeemed();

-- Add a comment for clarity
COMMENT ON TRIGGER trigger_notify_promo_redeemed ON public.user_promos 
IS 'When a user redeems a promo, this trigger creates a detailed notification for them.';

