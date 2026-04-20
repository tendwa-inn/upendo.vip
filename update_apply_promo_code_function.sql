-- Updated apply_promo_code function with better RLS handling
-- This function should work with the updated RLS policies

CREATE OR REPLACE FUNCTION apply_promo_code(p_user_id UUID, p_promo_code_id INT)
RETURNS VOID AS $$
DECLARE
  v_duration_days INT;
  v_expires_at TIMESTAMPTZ;
  v_promo_exists BOOLEAN;
  v_already_applied BOOLEAN;
BEGIN
  -- Check if the promo code exists and is active
  SELECT EXISTS(
    SELECT 1 FROM promo_codes 
    WHERE id = p_promo_code_id 
    AND is_active = true
  ) INTO v_promo_exists;
  
  IF NOT v_promo_exists THEN
    RAISE EXCEPTION 'Promo code not found or inactive.';
  END IF;

  -- Check if the user has already applied this promo code
  SELECT EXISTS(
    SELECT 1 FROM user_promos 
    WHERE user_id = p_user_id AND promo_code_id = p_promo_code_id
  ) INTO v_already_applied;
  
  IF v_already_applied THEN
    RAISE EXCEPTION 'You have already used this promo code.';
  END IF;

  -- Get the duration of the promo code
  SELECT duration_days INTO v_duration_days FROM promo_codes WHERE id = p_promo_code_id;

  -- Calculate the expiration date
  v_expires_at := NOW() + (COALESCE(v_duration_days, 30) * INTERVAL '1 day');

  -- Insert the new promo for the user
  -- This should work with the new RLS policy
  INSERT INTO user_promos (user_id, promo_code_id, expires_at)
  VALUES (p_user_id, p_promo_code_id, v_expires_at);

END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION apply_promo_code(UUID, INT) TO authenticated;