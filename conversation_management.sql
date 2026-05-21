-- =====================================================
-- CONVERSATION MANAGEMENT SYSTEM
-- UPENDO CHAT CONVERSATION SCRIPTS
-- =====================================================

-- =====================================================
-- CONVERSATION CREATION AND MANAGEMENT
-- =====================================================

-- Create a new conversation (match) between two users
CREATE OR REPLACE FUNCTION create_conversation(
    p_user1_id UUID,
    p_user2_id UUID
)
RETURNS TABLE (
    success BOOLEAN,
    match_id UUID,
    error_message TEXT
) AS $$
DECLARE
    v_match_id UUID;
BEGIN
    -- Validate both users exist
    IF NOT EXISTS(SELECT 1 FROM public.profiles WHERE id = p_user1_id) THEN
        RETURN QUERY SELECT false, NULL::UUID, 'User 1 not found'::TEXT;
        RETURN;
    END IF;

    IF NOT EXISTS(SELECT 1 FROM public.profiles WHERE id = p_user2_id) THEN
        RETURN QUERY SELECT false, NULL::UUID, 'User 2 not found'::TEXT;
        RETURN;
    END IF;

    -- Check if conversation already exists
    SELECT id INTO v_match_id FROM public.matches 
    WHERE (user1_id = p_user1_id AND user2_id = p_user2_id) 
       OR (user1_id = p_user2_id AND user2_id = p_user1_id);

    IF v_match_id IS NOT NULL THEN
        RETURN QUERY SELECT true, v_match_id, 'Conversation already exists'::TEXT;
        RETURN;
    END IF;

    -- Create new conversation
    INSERT INTO public.matches (user1_id, user2_id)
    VALUES (p_user1_id, p_user2_id)
    RETURNING id INTO v_match_id;

    RETURN QUERY SELECT true, v_match_id, ''::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get all conversations for a user with full details
CREATE OR REPLACE FUNCTION get_user_conversations_detailed(
    p_user_id UUID
)
RETURNS TABLE (
    match_id UUID,
    other_user_id UUID,
    other_user_name TEXT,
    other_user_photos TEXT[],
    other_user_subscription TEXT,
    other_user_last_active TIMESTAMPTZ,
    last_message_content TEXT,
    last_message_time TIMESTAMPTZ,
    last_message_sender_id UUID,
    unread_count BIGINT,
    total_messages BIGINT,
    conversation_created_at TIMESTAMPTZ,
    is_new_conversation BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id as match_id,
        CASE 
            WHEN m.user1_id = p_user_id THEN m.user2_id 
            ELSE m.user1_id 
        END as other_user_id,
        CASE 
            WHEN m.user1_id = p_user_id THEN p2.name 
            ELSE p1.name 
        END as other_user_name,
        CASE 
            WHEN m.user1_id = p_user_id THEN p2.photos 
            ELSE p1.photos 
        END as other_user_photos,
        CASE 
            WHEN m.user1_id = p_user_id THEN COALESCE(p2.subscription, 'free')
            ELSE COALESCE(p1.subscription, 'free')
        END as other_user_subscription,
        CASE 
            WHEN m.user1_id = p_user_id THEN p2.last_active_at
            ELSE p1.last_active_at
        END as other_user_last_active,
        last_msg.content as last_message_content,
        last_msg.created_at as last_message_time,
        last_msg.sender_id as last_message_sender_id,
        (
            SELECT COUNT(*) 
            FROM public.messages msg 
            WHERE msg.match_id = m.id 
            AND msg.sender_id != p_user_id 
            AND msg.is_read = false
            AND msg.is_deleted = false
        ) as unread_count,
        (
            SELECT COUNT(*) 
            FROM public.messages msg 
            WHERE msg.match_id = m.id 
            AND msg.is_deleted = false
        ) as total_messages,
        m.created_at as conversation_created_at,
        (
            SELECT COUNT(*) = 0 
            FROM public.messages msg 
            WHERE msg.match_id = m.id
        ) as is_new_conversation
    FROM public.matches m
    LEFT JOIN public.profiles p1 ON m.user1_id = p1.id
    LEFT JOIN public.profiles p2 ON m.user2_id = p2.id
    LEFT JOIN LATERAL (
        SELECT content, created_at, sender_id
        FROM public.messages 
        WHERE match_id = m.id 
        AND is_deleted = false
        ORDER BY created_at DESC 
        LIMIT 1
    ) last_msg ON true
    WHERE (m.user1_id = p_user_id OR m.user2_id = p_user_id)
    ORDER BY COALESCE(m.last_message_at, m.created_at) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- CONVERSATION STATUS AND METRICS
-- =====================================================

-- Get conversation activity statistics
CREATE OR REPLACE FUNCTION get_conversation_stats_detailed(
    p_match_id UUID,
    p_user_id UUID
)
RETURNS TABLE (
    total_messages BIGINT,
    user_messages BIGINT,
    other_user_messages BIGINT,
    unread_count BIGINT,
    last_message_time TIMESTAMPTZ,
    first_message_time TIMESTAMPTZ,
    days_active INTEGER,
    messages_per_day NUMERIC,
    other_user_last_active TIMESTAMPTZ,
    conversation_duration_days INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM public.messages WHERE match_id = p_match_id AND is_deleted = false) as total_messages,
        (SELECT COUNT(*) FROM public.messages WHERE match_id = p_match_id AND sender_id = p_user_id AND is_deleted = false) as user_messages,
        (SELECT COUNT(*) FROM public.messages WHERE match_id = p_match_id AND sender_id != p_user_id AND is_deleted = false) as other_user_messages,
        (SELECT COUNT(*) FROM public.messages WHERE match_id = p_match_id AND sender_id != p_user_id AND is_read = false AND is_deleted = false) as unread_count,
        (SELECT MAX(created_at) FROM public.messages WHERE match_id = p_match_id AND is_deleted = false) as last_message_time,
        (SELECT MIN(created_at) FROM public.messages WHERE match_id = p_match_id AND is_deleted = false) as first_message_time,
        (SELECT COUNT(DISTINCT DATE(created_at)) FROM public.messages WHERE match_id = p_match_id AND is_deleted = false) as days_active,
        CASE 
            WHEN (SELECT COUNT(DISTINCT DATE(created_at)) FROM public.messages WHERE match_id = p_match_id AND is_deleted = false) > 0
            THEN (SELECT COUNT(*) FROM public.messages WHERE match_id = p_match_id AND is_deleted = false)::NUMERIC / 
                 (SELECT COUNT(DISTINCT DATE(created_at)) FROM public.messages WHERE match_id = p_match_id AND is_deleted = false)
            ELSE 0
        END as messages_per_day,
        CASE 
            WHEN m.user1_id = p_user_id THEN p2.last_active_at
            ELSE p1.last_active_at
        END as other_user_last_active,
        CASE 
            WHEN (SELECT MIN(created_at) FROM public.messages WHERE match_id = p_match_id AND is_deleted = false) IS NOT NULL
            THEN DATE_PART('day', NOW() - (SELECT MIN(created_at) FROM public.messages WHERE match_id = p_match_id AND is_deleted = false))::INTEGER
            ELSE 0
        END as conversation_duration_days
    FROM public.matches m
    LEFT JOIN public.profiles p1 ON m.user1_id = p1.id
    LEFT JOIN public.profiles p2 ON m.user2_id = p2.id
    WHERE m.id = p_match_id
    AND (m.user1_id = p_user_id OR m.user2_id = p_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- CONVERSATION CLEANUP AND MAINTENANCE
-- =====================================================

-- Archive old conversations (soft delete)
CREATE OR REPLACE FUNCTION archive_old_conversations(
    p_days_old INTEGER DEFAULT 365
)
RETURNS INTEGER AS $$
DECLARE
    v_archived_count INTEGER;
BEGIN
    -- Mark messages as deleted for old inactive conversations
    UPDATE public.messages 
    SET is_deleted = true,
        updated_at = NOW()
    WHERE match_id IN (
        SELECT m.id 
        FROM public.matches m
        WHERE m.last_message_at < NOW() - INTERVAL '1 day' * p_days_old
        OR (m.last_message_at IS NULL AND m.created_at < NOW() - INTERVAL '1 day' * p_days_old)
    )
    AND is_deleted = false;

    GET DIAGNOSTICS v_archived_count = ROW_COUNT;
    RETURN v_archived_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Clean up orphaned conversations
CREATE OR REPLACE FUNCTION cleanup_orphaned_conversations()
RETURNS INTEGER AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    -- Delete conversations where both users no longer exist
    DELETE FROM public.matches 
    WHERE NOT EXISTS (
        SELECT 1 FROM public.profiles WHERE id = user1_id
    ) OR NOT EXISTS (
        SELECT 1 FROM public.profiles WHERE id = user2_id
    );

    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- CONVERSATION SEARCH AND FILTERING
-- =====================================================

-- Search conversations by partner name
CREATE OR REPLACE FUNCTION search_conversations_by_partner(
    p_user_id UUID,
    p_search_term TEXT,
    p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
    match_id UUID,
    other_user_id UUID,
    other_user_name TEXT,
    other_user_photos TEXT[],
    last_message_content TEXT,
    last_message_time TIMESTAMPTZ,
    unread_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id as match_id,
        CASE 
            WHEN m.user1_id = p_user_id THEN m.user2_id 
            ELSE m.user1_id 
        END as other_user_id,
        CASE 
            WHEN m.user1_id = p_user_id THEN p2.name 
            ELSE p1.name 
        END as other_user_name,
        CASE 
            WHEN m.user1_id = p_user_id THEN p2.photos 
            ELSE p1.photos 
        END as other_user_photos,
        last_msg.content as last_message_content,
        last_msg.created_at as last_message_time,
        (
            SELECT COUNT(*) 
            FROM public.messages msg 
            WHERE msg.match_id = m.id 
            AND msg.sender_id != p_user_id 
            AND msg.is_read = false
            AND msg.is_deleted = false
        ) as unread_count
    FROM public.matches m
    LEFT JOIN public.profiles p1 ON m.user1_id = p1.id
    LEFT JOIN public.profiles p2 ON m.user2_id = p2.id
    LEFT JOIN LATERAL (
        SELECT content, created_at
        FROM public.messages 
        WHERE match_id = m.id 
        AND is_deleted = false
        ORDER BY created_at DESC 
        LIMIT 1
    ) last_msg ON true
    WHERE (m.user1_id = p_user_id OR m.user2_id = p_user_id)
    AND (
        CASE 
            WHEN m.user1_id = p_user_id THEN p2.name 
            ELSE p1.name 
        END ILIKE '%' || p_search_term || '%'
    )
    ORDER BY COALESCE(last_msg.created_at, m.created_at) DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get active conversations (recent activity)
CREATE OR REPLACE FUNCTION get_active_conversations(
    p_user_id UUID,
    p_days_back INTEGER DEFAULT 7,
    p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
    match_id UUID,
    other_user_id UUID,
    other_user_name TEXT,
    other_user_photos TEXT[],
    last_message_content TEXT,
    last_message_time TIMESTAMPTZ,
    message_count BIGINT,
    unread_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id as match_id,
        CASE 
            WHEN m.user1_id = p_user_id THEN m.user2_id 
            ELSE m.user1_id 
        END as other_user_id,
        CASE 
            WHEN m.user1_id = p_user_id THEN p2.name 
            ELSE p1.name 
        END as other_user_name,
        CASE 
            WHEN m.user1_id = p_user_id THEN p2.photos 
            ELSE p1.photos 
        END as other_user_photos,
        last_msg.content as last_message_content,
        last_msg.created_at as last_message_time,
        (
            SELECT COUNT(*) 
            FROM public.messages msg 
            WHERE msg.match_id = m.id 
            AND msg.created_at > NOW() - INTERVAL '1 day' * p_days_back
            AND msg.is_deleted = false
        ) as message_count,
        (
            SELECT COUNT(*) 
            FROM public.messages msg 
            WHERE msg.match_id = m.id 
            AND msg.sender_id != p_user_id 
            AND msg.is_read = false
            AND msg.is_deleted = false
        ) as unread_count
    FROM public.matches m
    LEFT JOIN public.profiles p1 ON m.user1_id = p1.id
    LEFT JOIN public.profiles p2 ON m.user2_id = p2.id
    LEFT JOIN LATERAL (
        SELECT content, created_at
        FROM public.messages 
        WHERE match_id = m.id 
        AND is_deleted = false
        ORDER BY created_at DESC 
        LIMIT 1
    ) last_msg ON true
    WHERE (m.user1_id = p_user_id OR m.user2_id = p_user_id)
    AND (
        -- Has recent messages or is new
        EXISTS (
            SELECT 1 FROM public.messages 
            WHERE match_id = m.id 
            AND created_at > NOW() - INTERVAL '1 day' * p_days_back
        )
        OR NOT EXISTS (
            SELECT 1 FROM public.messages 
            WHERE match_id = m.id
        )
    )
    ORDER BY COALESCE(last_msg.created_at, m.created_at) DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- CONVERSATION NOTIFICATIONS
-- =====================================================

-- Get conversations with new messages since last check
CREATE OR REPLACE FUNCTION get_conversations_with_new_messages(
    p_user_id UUID,
    p_last_check_time TIMESTAMPTZ
)
RETURNS TABLE (
    match_id UUID,
    other_user_id UUID,
    other_user_name TEXT,
    new_message_count BIGINT,
    latest_message_time TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id as match_id,
        CASE 
            WHEN m.user1_id = p_user_id THEN m.user2_id 
            ELSE m.user1_id 
        END as other_user_id,
        CASE 
            WHEN m.user1_id = p_user_id THEN p2.name 
            ELSE p1.name 
        END as other_user_name,
        (
            SELECT COUNT(*) 
            FROM public.messages msg 
            WHERE msg.match_id = m.id 
            AND msg.sender_id != p_user_id 
            AND msg.created_at > p_last_check_time
            AND msg.is_deleted = false
        ) as new_message_count,
        (
            SELECT MAX(created_at) 
            FROM public.messages msg 
            WHERE msg.match_id = m.id 
            AND msg.sender_id != p_user_id 
            AND msg.created_at > p_last_check_time
            AND msg.is_deleted = false
        ) as latest_message_time
    FROM public.matches m
    LEFT JOIN public.profiles p1 ON m.user1_id = p1.id
    LEFT JOIN public.profiles p2 ON m.user2_id = p2.id
    WHERE (m.user1_id = p_user_id OR m.user2_id = p_user_id)
    AND EXISTS (
        SELECT 1 FROM public.messages msg 
        WHERE msg.match_id = m.id 
        AND msg.sender_id != p_user_id 
        AND msg.created_at > p_last_check_time
        AND msg.is_deleted = false
    )
    ORDER BY latest_message_time DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TESTING QUERIES
-- =====================================================

-- Test creating a conversation
/*
SELECT * FROM create_conversation(
    'user1-uuid-here',
    'user2-uuid-here'
);
*/

-- Test getting detailed conversations
/*
SELECT * FROM get_user_conversations_detailed('user-uuid-here');
*/

-- Test getting conversation stats
/*
SELECT * FROM get_conversation_stats_detailed('match-uuid-here', 'user-uuid-here');
*/

-- Test searching conversations by partner name
/*
SELECT * FROM search_conversations_by_partner('user-uuid-here', 'john', 10);
*/

-- Test getting active conversations
/*
SELECT * FROM get_active_conversations('user-uuid-here', 7, 20);
*/

-- Test getting conversations with new messages
/*
SELECT * FROM get_conversations_with_new_messages('user-uuid-here', NOW() - INTERVAL '1 hour');
*/