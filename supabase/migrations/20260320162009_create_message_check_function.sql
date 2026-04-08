-- Function to check messages for filtered words
CREATE OR REPLACE FUNCTION check_message_for_filtered_words()
RETURNS TRIGGER AS $$
DECLARE
    filtered_word RECORD;
BEGIN
    -- Check if the message content contains any filtered words
    FOR filtered_word IN SELECT * FROM public.word_filter LOOP
        IF NEW.content ILIKE '%' || filtered_word.word || '%' THEN
            -- Get the sender's profile ID
            DECLARE
                sender_profile_id UUID;
            BEGIN
                SELECT id INTO sender_profile_id 
                FROM public.profiles 
                WHERE id = NEW.sender_id;
                
                IF sender_profile_id IS NOT NULL THEN
                    -- Insert into flagged_content
                    INSERT INTO public.flagged_content (user_id, content, context, word_id, created_at)
                    VALUES (sender_profile_id, NEW.content, 'message', filtered_word.id, NOW());
                END IF;
            END;
        END IF;
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;