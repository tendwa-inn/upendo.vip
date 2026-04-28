
-- Function to create a notification when a promo is redeemed
CREATE OR REPLACE FUNCTION notify_promo_redeemed() 
RETURNS TRIGGER AS $$ 
DECLARE 
  promo_name TEXT;
  promo_desc TEXT;
BEGIN 
  -- Get the name and description of the redeemed promo code
  SELECT name, description INTO promo_name, promo_desc
  FROM promo_codes 
  WHERE id = NEW.promo_code_id; 

  -- Insert a new notification for the user
  INSERT INTO public.notifications (user_id, type, title, message) 
  VALUES ( 
    NEW.user_id, 
    'promo-redemption', 
    'Promo Redeemed: ' || promo_name, 
    COALESCE(promo_desc, 'You successfully redeemed "' || promo_name || '". Enjoy your reward!')
  ); 

  RETURN NEW; 
END; 
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger that executes the function after a new row is inserted into user_promos
CREATE TRIGGER trigger_notify_promo_redeemed 
AFTER INSERT ON public.user_promos 
FOR EACH ROW 
EXECUTE FUNCTION notify_promo_redeemed();

-- Add a comment for clarity
COMMENT ON TRIGGER trigger_notify_promo_redeemed ON public.user_promos 
IS 'When a user redeems a promo, this trigger creates a notification for them.';
