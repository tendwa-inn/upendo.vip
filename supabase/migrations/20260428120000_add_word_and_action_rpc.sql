CREATE OR REPLACE FUNCTION add_word_and_action(word_text TEXT, action_type_text TEXT, duration_days_value INT DEFAULT NULL)
RETURNS TABLE (id INT, word TEXT) AS $$
DECLARE
  new_word_id INT;
BEGIN
  -- Insert the new word and get its ID
  INSERT INTO public.word_filter (word) VALUES (word_text)
  ON CONFLICT (word) DO NOTHING
  RETURNING word_filter.id INTO new_word_id;

  -- If the word was already there, get its ID
  IF new_word_id IS NULL THEN
    SELECT wf.id INTO new_word_id FROM public.word_filter wf WHERE wf.word = word_text;
  END IF;

  -- Set the action for the word
  IF new_word_id IS NOT NULL THEN
    INSERT INTO public.word_actions (word_id, action_type, duration_days)
    VALUES (new_word_id, action_type_text::word_action_type, duration_days_value)
    ON CONFLICT (word_id) DO UPDATE
    SET action_type = EXCLUDED.action_type, duration_days = EXCLUDED.duration_days;
  END IF;

  -- Return the word's ID and text
  RETURN QUERY SELECT wf.id, wf.word FROM public.word_filter wf WHERE wf.id = new_word_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;