-- Trigger to check profile updates for filtered words
CREATE TRIGGER check_profile_for_filtered_words
    AFTER UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION check_content_for_filtered_words();