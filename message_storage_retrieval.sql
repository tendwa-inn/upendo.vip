-- =====================================================
-- MESSAGE STORAGE AND RETRIEVAL SYSTEM
-- UPENDO CHAT MESSAGING SCRIPTS
-- =====================================================

-- =====================================================
-- MESSAGE ENCRYPTION/DECRYPTION FUNCTIONS
-- =====================================================

-- Create encryption function (simplified version - use proper encryption in production)
CREATE OR REPLACE FUNCTION encrypt_message(p_content TEXT)
RETURNS TEXT AS $$
DECLARE
    encrypted_content TEXT;
BEGIN
    -- In production, use proper encryption like pgcrypto
    -- This is a simplified version for demonstration
    encrypted_content := encode(sha256(p_content::bytea), 'hex');
    RETURN encrypted_content;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create decryption function (simplified version)
CREATE OR REPLACE FUNCTION decrypt_message(p_encrypted_content TEXT)
RETURNS TEXT AS $$
BEGIN
    -- In production, use proper decryption
    -- This is a placeholder - actual implementation would use proper encryption
    RETURN p_encrypted_content;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- MESSAGE STORAGE PROCEDURES
-- =====================================================

-- Store a new message with proper validation
CREATE OR REPLACE FUNCTION store_message(
    p_match_id UUID,
    p_sender_id UUID,
    p_content TEXT,
    p_message_type TEXT DEFAULT 'text',
    p_is_encrypted BOOLEAN DEFAULT false
)
RETURNS TABLE (
    success BOOLEAN,
    message_id BIGINT,
    error_message TEXT
) AS $$
DECLARE
    v_message_id BIGINT;
    v_final_content TEXT;
    v_match_exists BOOLEAN;
BEGIN
    -- Validate that the match exists and user is part of it
    SELECT EXISTS(
        SELECT 1 FROM public.matches 
        WHERE id = p_match_id 
        AND (user1_id = p_sender_id OR user2_id = p_sender_id)
    ) INTO v_match_exists;

    IF NOT v_match_exists THEN
        RETURN QUERY SELECT false, 0::BIGINT, 'User is not part of this conversation'::TEXT;
        RETURN;
    END IF;

    -- Encrypt content if required
    IF p_is_encrypted THEN
        v_final_content := encrypt_message(p_content);
    ELSE
        v_final_content := p_content;
    END IF;

    -- Insert the message
    INSERT INTO public.messages (match_id, sender_id, content, type)
    VALUES (p_match_id, p_sender_id, v_final_content, p_message_type)
    RETURNING id INTO v_message_id;

    RETURN QUERY SELECT true, v_message_id, ''::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Store multiple messages in batch
CREATE OR REPLACE FUNCTION store_messages_batch(
    p_messages JSONB
)
RETURNS TABLE (
    success BOOLEAN,
    message_ids BIGINT[],
    error_message TEXT
) AS $$
DECLARE
    v_message_ids BIGINT[] := '{}';
    v_message JSONB;
    v_result RECORD;
BEGIN
    -- Process each message in the batch
    FOR v_message IN SELECT * FROM jsonb_array_elements(p_messages)
    LOOP
        SELECT * INTO v_result FROM store_message(
            (v_message->>'match_id')::UUID,
            (v_message->>'sender_id')::UUID,
            v_message->>'content',
            COALESCE(v_message->>'type', 'text'),
            COALESCE((v_message->>'is_encrypted')::BOOLEAN, false)
        );

        IF v_result.success THEN
            v_message_ids := array_append(v_message_ids, v_result.message_id);
        ELSE
            RETURN QUERY SELECT false, v_message_ids, v_result.error_message;
            RETURN;
        END IF;
    END LOOP;

    RETURN QUERY SELECT true, v_message_ids, ''::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- MESSAGE RETRIEVAL PROCEDURES
-- =====================================================

-- Get messages for a conversation with pagination
CREATE OR REPLACE FUNCTION get_conversation_messages_paginated(
    p_match_id UUID,
    p_user_id UUID,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    message_id BIGINT,
    sender_id UUID,
    sender_name TEXT,
    sender_photos TEXT[],
    content TEXT,
    message_type TEXT,
    is_read BOOLEAN,
    is_edited BOOLEAN,
    is_deleted BOOLEAN,
    created_at TIMESTAMPTZ,
    decrypted_content TEXT
) AS $$
BEGIN
    -- Verify user has access to this conversation
    IF NOT EXISTS(
        SELECT 1 FROM public.matches 
        WHERE id = p_match_id 
        AND (user1_id = p_user_id OR user2_id = p_user_id)
    ) THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT 
        m.id as message_id,
        m.sender_id,
        p.name as sender_name,
        p.photos as sender_photos,
        m.content,
        m.type as message_type,
        m.is_read,
        m.is_edited,
        m.is_deleted,
        m.created_at,
        CASE 
            WHEN m.type = 'text' THEN decrypt_message(m.content)
            ELSE m.content
        END as decrypted_content
    FROM public.messages m
    JOIN public.profiles p ON m.sender_id = p.id
    WHERE m.match_id = p_match_id
    AND m.is_deleted = false
    ORDER BY m.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get unread messages for a user
CREATE OR REPLACE FUNCTION get_unread_messages(
    p_user_id UUID
)
RETURNS TABLE (
    match_id UUID,
    message_id BIGINT,
    sender_id UUID,
    sender_name TEXT,
    content TEXT,
    message_type TEXT,
    created_at TIMESTAMPTZ,
    conversation_partner_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.match_id,
        m.id as message_id,
        m.sender_id,
        p.name as sender_name,
        CASE 
            WHEN m.type = 'text' THEN decrypt_message(m.content)
            ELSE m.content
        END as content,
        m.type as message_type,
        m.created_at,
        CASE 
            WHEN matches.user1_id = p_user_id THEN p2.name
            ELSE p1.name
        END as conversation_partner_name
    FROM public.messages m
    JOIN public.matches ON m.match_id = matches.id
    JOIN public.profiles p ON m.sender_id = p.id
    LEFT JOIN public.profiles p1 ON matches.user1_id = p1.id
    LEFT JOIN public.profiles p2 ON matches.user2_id = p2.id
    WHERE (matches.user1_id = p_user_id OR matches.user2_id = p_user_id)
    AND m.sender_id != p_user_id
    AND m.is_read = false
    AND m.is_deleted = false
    ORDER BY m.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- MESSAGE STATUS MANAGEMENT
-- =====================================================

-- Mark specific messages as read
CREATE OR REPLACE FUNCTION mark_messages_as_read(
    p_message_ids BIGINT[],
    p_user_id UUID
)
RETURNS INTEGER AS $$
DECLARE
    v_updated_count INTEGER;
BEGIN
    UPDATE public.messages 
    SET is_read = true
    WHERE id = ANY(p_message_ids)
    AND sender_id != p_user_id
    AND EXISTS (
        SELECT 1 FROM public.matches 
        WHERE matches.id = messages.match_id 
        AND (matches.user1_id = p_user_id OR matches.user2_id = p_user_id)
    );

    GET DIAGNOSTICS v_updated_count = ROW_COUNT;
    RETURN v_updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mark all messages in a conversation as read
CREATE OR REPLACE FUNCTION mark_conversation_as_read(
    p_match_id UUID,
    p_user_id UUID
)
RETURNS INTEGER AS $$
DECLARE
    v_updated_count INTEGER;
BEGIN
    UPDATE public.messages 
    SET is_read = true
    WHERE match_id = p_match_id
    AND sender_id != p_user_id
    AND is_read = false
    AND EXISTS (
        SELECT 1 FROM public.matches 
        WHERE matches.id = p_match_id 
        AND (matches.user1_id = p_user_id OR matches.user2_id = p_user_id)
    );

    GET DIAGNOSTICS v_updated_count = ROW_COUNT;
    RETURN v_updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- MESSAGE EDITING AND DELETION
-- =====================================================

-- Edit a message
CREATE OR REPLACE FUNCTION edit_message(
    p_message_id BIGINT,
    p_user_id UUID,
    p_new_content TEXT,
    p_is_encrypted BOOLEAN DEFAULT false
)
RETURNS TABLE (
    success BOOLEAN,
    error_message TEXT
) AS $$
DECLARE
    v_final_content TEXT;
BEGIN
    -- Verify the user owns the message
    IF NOT EXISTS(
        SELECT 1 FROM public.messages 
        WHERE id = p_message_id 
        AND sender_id = p_user_id
    ) THEN
        RETURN QUERY SELECT false, 'Message not found or user not authorized'::TEXT;
        RETURN;
    END IF;

    -- Encrypt new content if required
    IF p_is_encrypted THEN
        v_final_content := encrypt_message(p_new_content);
    ELSE
        v_final_content := p_new_content;
    END IF;

    UPDATE public.messages 
    SET content = v_final_content,
        is_edited = true,
        updated_at = NOW()
    WHERE id = p_message_id;

    RETURN QUERY SELECT true, ''::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Soft delete a message
CREATE OR REPLACE FUNCTION delete_message(
    p_message_id BIGINT,
    p_user_id UUID
)
RETURNS TABLE (
    success BOOLEAN,
    error_message TEXT
) AS $$
BEGIN
    -- Verify the user owns the message
    IF NOT EXISTS(
        SELECT 1 FROM public.messages 
        WHERE id = p_message_id 
        AND sender_id = p_user_id
    ) THEN
        RETURN QUERY SELECT false, 'Message not found or user not authorized'::TEXT;
        RETURN;
    END IF;

    UPDATE public.messages 
    SET is_deleted = true,
        updated_at = NOW()
    WHERE id = p_message_id;

    RETURN QUERY SELECT true, ''::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- MESSAGE SEARCH AND FILTERING
-- =====================================================

-- Search messages in conversations
CREATE OR REPLACE FUNCTION search_messages(
    p_user_id UUID,
    p_search_term TEXT,
    p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
    match_id UUID,
    message_id BIGINT,
    sender_id UUID,
    sender_name TEXT,
    content TEXT,
    message_type TEXT,
    created_at TIMESTAMPTZ,
    conversation_partner_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.match_id,
        m.id as message_id,
        m.sender_id,
        p.name as sender_name,
        CASE 
            WHEN m.type = 'text' THEN decrypt_message(m.content)
            ELSE m.content
        END as content,
        m.type as message_type,
        m.created_at,
        CASE 
            WHEN matches.user1_id = p_user_id THEN p2.name
            ELSE p1.name
        END as conversation_partner_name
    FROM public.messages m
    JOIN public.matches ON m.match_id = matches.id
    JOIN public.profiles p ON m.sender_id = p.id
    LEFT JOIN public.profiles p1 ON matches.user1_id = p1.id
    LEFT JOIN public.profiles p2 ON matches.user2_id = p2.id
    WHERE (matches.user1_id = p_user_id OR matches.user2_id = p_user_id)
    AND m.sender_id != p_user_id
    AND m.is_deleted = false
    AND (
        CASE 
            WHEN m.type = 'text' THEN decrypt_message(m.content)
            ELSE m.content
        END ILIKE '%' || p_search_term || '%'
    )
    ORDER BY m.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- MESSAGE ANALYTICS AND METRICS
-- =====================================================

-- Get message statistics for a user
CREATE OR REPLACE FUNCTION get_user_message_stats(
    p_user_id UUID
)
RETURNS TABLE (
    total_sent BIGINT,
    total_received BIGINT,
    total_conversations BIGINT,
    active_conversations BIGINT,
    unread_messages BIGINT,
    last_message_sent_at TIMESTAMPTZ,
    most_active_conversation UUID
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM public.messages WHERE sender_id = p_user_id) as total_sent,
        (SELECT COUNT(*) FROM public.messages m 
         JOIN public.matches ON m.match_id = matches.id 
         WHERE (matches.user1_id = p_user_id OR matches.user2_id = p_user_id) 
         AND m.sender_id != p_user_id) as total_received,
        (SELECT COUNT(*) FROM public.matches 
         WHERE user1_id = p_user_id OR user2_id = p_user_id) as total_conversations,
        (SELECT COUNT(DISTINCT match_id) FROM public.messages m 
         JOIN public.matches ON m.match_id = matches.id 
         WHERE (matches.user1_id = p_user_id OR matches.user2_id = p_user_id) 
         AND m.created_at > NOW() - INTERVAL '7 days') as active_conversations,
        (SELECT COUNT(*) FROM public.messages m 
         JOIN public.matches ON m.match_id = matches.id 
         WHERE (matches.user1_id = p_user_id OR matches.user2_id = p_user_id) 
         AND m.sender_id != p_user_id AND m.is_read = false) as unread_messages,
        (SELECT MAX(created_at) FROM public.messages WHERE sender_id = p_user_id) as last_message_sent_at,
        (SELECT match_id FROM public.messages 
         WHERE sender_id = p_user_id 
         GROUP BY match_id 
         ORDER BY COUNT(*) DESC 
         LIMIT 1) as most_active_conversation;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TESTING QUERIES
-- =====================================================

-- Test storing a message
/*
SELECT * FROM store_message(
    'match-uuid-here',
    'sender-uuid-here',
    'Hello, this is a test message!',
    'text',
    false
);
*/

-- Test retrieving paginated messages
/*
SELECT * FROM get_conversation_messages_paginated(
    'match-uuid-here',
    'user-uuid-here',
    50,
    0
);
*/

-- Test getting unread messages
/*
SELECT * FROM get_unread_messages('user-uuid-here');
*/

-- Test marking conversation as read
/*
SELECT mark_conversation_as_read('match-uuid-here', 'user-uuid-here');
*/

-- Test searching messages
/*
SELECT * FROM search_messages('user-uuid-here', 'hello', 10);
*/

-- Test getting message stats
/*
SELECT * FROM get_user_message_stats('user-uuid-here');
*/