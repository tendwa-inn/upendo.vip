-- Function to check content against filtered words
CREATE OR REPLACE FUNCTION check_content_for_filtered_words()
RETURNS TRIGGER AS $$
DECLARE
    filtered_word RECORD;
    found_word TEXT;
BEGIN
    -- Check if the content contains any filtered words
    FOR filtered_word IN SELECT * FROM public.word_filter LOOP
        IF (NEW.bio IS NOT NULL AND NEW.bio ILIKE '%' || filtered_word.word || '%') OR
           (NEW.occupation IS NOT NULL AND NEW.occupation ILIKE '%' || filtered_word.word || '%') OR
           (NEW.education IS NOT NULL AND NEW.education ILIKE '%' || filtered_word.word || '%') OR
           (NEW.religion IS NOT NULL AND NEW.religion ILIKE '%' || filtered_word.word || '%') OR
           (NEW.love_language IS NOT NULL AND NEW.love_language ILIKE '%' || filtered_word.word || '%') OR
           (NEW.drinking IS NOT NULL AND NEW.drinking ILIKE '%' || filtered_word.word || '%') OR
           (NEW.smoking IS NOT NULL AND NEW.smoking ILIKE '%' || filtered_word.word || '%') OR
           (NEW.first_date IS NOT NULL AND NEW.first_date ILIKE '%' || filtered_word.word || '%') THEN
            
            -- Insert into flagged_content
            INSERT INTO public.flagged_content (user_id, content, context, word_id, created_at)
            VALUES (NEW.id, 
                    COALESCE(NEW.bio, '') || ' ' || 
                    COALESCE(NEW.occupation, '') || ' ' || 
                    COALESCE(NEW.education, '') || ' ' || 
                    COALESCE(NEW.religion, '') || ' ' || 
                    COALESCE(NEW.love_language, '') || ' ' || 
                    COALESCE(NEW.drinking, '') || ' ' || 
                    COALESCE(NEW.smoking, '') || ' ' || 
                    COALESCE(NEW.first_date, ''),
                    'profile',
                    filtered_word.id,
                    NOW());
        END IF;
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;