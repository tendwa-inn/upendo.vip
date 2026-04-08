-- Trigger to check messages for filtered words
CREATE TRIGGER check_message_for_filtered_words
    AFTER INSERT ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION check_message_for_filtered_words();