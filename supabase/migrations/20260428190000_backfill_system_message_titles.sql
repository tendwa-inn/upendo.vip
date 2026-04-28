UPDATE system_messages
SET title = SUBSTRING(message, 1, 40)
WHERE title IS NULL OR title = '';
