
-- apply_promo_code.sql

-- This function applies a promo code to a user, creating a record in the user_promos table.
-- It checks for duplicates to ensure a user cannot apply the same promo code twice.

CREATE OR REPLACE FUNCTION apply_promo_code(p_user_id UUID, p_promo_code_id INT)
RETURNS VOID AS $$
DECLARE
  v_duration_days INT;
  v_expires_at TIMESTAMPTZ;
BEGIN
  -- Check if the user has already applied this promo code
  IF EXISTS (SELECT 1 FROM user_promos WHERE user_id = p_user_id AND promo_code_id = p_promo_code_id) THEN
    RAISE EXCEPTION 'You have already used this promo code.';
  END IF;

  -- Get the duration of the promo code
  SELECT duration_days INTO v_duration_days FROM promo_codes WHERE id = p_promo_code_id;

  -- Calculate the expiration date
  v_expires_at := NOW() + (v_duration_days * INTERVAL '1 day');

  -- Insert the new promo for the user
  INSERT INTO user_promos (user_id, promo_code_id, expires_at)
  VALUES (p_user_id, p_promo_code_id, v_expires_at);

END;
$$ LANGUAGE plpgsql;
