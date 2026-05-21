# =====================================================
# UPENDO CHAT SYSTEM - COMPLETE SETUP GUIDE
# =====================================================
# Ensures message persistence across navigation and refresh
# =====================================================

## 📋 TABLE OF CONTENTS

1. [Database Setup](#database-setup)
2. [SQL Scripts Installation](#sql-scripts-installation)
3. [Backend Implementation](#backend-implementation)
4. [Frontend Integration](#frontend-integration)
5. [Testing Procedures](#testing-procedures)
6. [Performance Optimization](#performance-optimization)
7. [Monitoring and Maintenance](#monitoring-and-maintenance)

## 🗄️ DATABASE SETUP

### Prerequisites
- PostgreSQL 12+ or Supabase project
- Node.js 16+ 
- React 18+ with TypeScript

### 1. Create Database Schema

Run the following scripts in order:

```bash
# 1. Main chat system schema
psql -d your_database -f chat_system_complete.sql

# 2. Message storage and retrieval functions
psql -d your_database -f message_storage_retrieval.sql

# 3. Conversation management functions
psql -d your_database -f conversation_management.sql

# 4. Refresh and navigation handling functions
psql -d your_database -f refresh_navigation_handling.sql
```

### 2. Verify Database Setup

```sql
-- Check if all functions were created successfully
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%message%' OR routine_name LIKE '%conversation%';

-- Test basic functionality
SELECT * FROM get_user_conversations_detailed('test-user-uuid');
SELECT * FROM create_conversation('user1-uuid', 'user2-uuid');
```

## 🔧 SQL SCRIPTS INSTALLATION

### Script 1: Chat System Complete (`chat_system_complete.sql`)
- Core tables: `profiles`, `matches`, `messages`
- Indexes for performance
- Triggers for automatic updates
- Row Level Security (RLS) policies
- Basic stored procedures

### Script 2: Message Storage & Retrieval (`message_storage_retrieval.sql`)
- Message encryption/decryption functions
- Message storage with validation
- Message retrieval with pagination
- Unread message tracking
- Message editing and deletion
- Message search functionality

### Script 3: Conversation Management (`conversation_management.sql`)
- Conversation creation and management
- Conversation statistics and metrics
- Conversation search and filtering
- Active conversation tracking
- Conversation cleanup and archiving

### Script 4: Refresh & Navigation Handling (`refresh_navigation_handling.sql`)
- Session state management
- Conversation read state tracking
- Message sync logging
- Browser refresh handling
- Navigation state management
- Conversation restoration after reload

## 💻 BACKEND IMPLEMENTATION

### 1. Install Dependencies

```bash
npm install @supabase/supabase-js zustand react-router-dom
npm install -D @types/react-router-dom
```

### 2. Configure Supabase Client

```typescript
// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 3. Create Chat Service

```typescript
// src/services/chatService.ts
import { ChatDatabaseService } from '../chat_implementation_guide';

export class ChatService {
  static async initializeChat(userId: string) {
    // Load initial conversations
    const conversations = await ChatDatabaseService.getUserConversations(userId);
    return conversations;
  }

  static async sendMessage(matchId: string, senderId: string, content: string) {
    return await ChatDatabaseService.storeMessage(matchId, senderId, content);
  }

  static async syncMessages(userId: string, matchId: string) {
    return await ChatDatabaseService.syncConversationMessages(userId, matchId);
  }
}
```

## 🎨 FRONTEND INTEGRATION

### 1. Update Your Chat Components

Replace your existing chat components with the ones from `chat_implementation_guide.js`:

- `ChatDatabaseService` - Database operations
- `useChatStore` - State management
- `useChatNavigation` - Navigation handling
- `ChatConversation` - Individual chat component
- `ChatList` - Conversations list component

### 2. Update Navigation Logic

```typescript
// In your ChatConversation component
const handleBack = async () => {
  await handleNavigationBack(userId);
  navigate('/chat');
};
```

### 3. Add Refresh Handling

```typescript
// In your ChatPage component
useEffect(() => {
  const handleRefresh = async () => {
    if (performance.navigation.type === 1) {
      await handleBrowserRefresh(userId);
    }
  };
  
  handleRefresh();
  
  // Set up periodic refresh
  const interval = setInterval(() => {
    refreshConversations();
  }, 30000);
  
  return () => clearInterval(interval);
}, [userId]);
```

## 🧪 TESTING PROCEDURES

### 1. Message Persistence Test

```javascript
// Test script for message persistence
describe('Chat Message Persistence', () => {
  test('Messages persist after navigation back', async () => {
    // Send a message
    const messageResult = await ChatService.sendMessage('match-123', 'user-1', 'Hello World');
    expect(messageResult.success).toBe(true);
    
    // Navigate back to conversations list
    await chatStore.handleNavigationBack('user-1');
    
    // Check if message appears in conversation preview
    const conversations = await chatStore.loadConversations('user-1');
    const conversation = conversations.find(c => c.matchId === 'match-123');
    expect(conversation.lastMessageContent).toBe('Hello World');
  });

  test('Messages persist after page refresh', async () => {
    // Send a message
    await ChatService.sendMessage('match-123', 'user-1', 'Test Message');
    
    // Simulate page refresh
    await chatStore.handleBrowserRefresh('user-1');
    
    // Check if message is still there
    const messages = await chatStore.loadMessages('match-123', 'user-1');
    expect(messages.some(m => m.content === 'Test Message')).toBe(true);
  });
});
```

### 2. Manual Testing Steps

1. **Send Message Test**:
   - Open a conversation
   - Send a message
   - Verify message appears immediately
   - Navigate back to conversations list
   - Verify message appears in conversation preview

2. **Refresh Test**:
   - Send a message
   - Refresh the browser (F5)
   - Verify conversation and messages are restored

3. **Navigation Test**:
   - Send multiple messages
   - Navigate between conversations
   - Verify all messages persist

4. **Multi-user Test**:
   - Open same conversation in two browsers
   - Send messages from both
   - Verify real-time sync

## ⚡ PERFORMANCE OPTIMIZATION

### 1. Database Indexes

```sql
-- Additional performance indexes
CREATE INDEX CONCURRENTLY idx_messages_match_created_desc 
ON public.messages(match_id, created_at DESC);

CREATE INDEX CONCURRENTLY idx_conversations_user_last_message 
ON public.matches(user1_id, last_message_at DESC);

CREATE INDEX CONCURRENTLY idx_conversations_user2_last_message 
ON public.matches(user2_id, last_message_at DESC);
```

### 2. Message Pagination

```typescript
// Implement pagination for large conversations
const loadMoreMessages = async (offset: number) => {
  const result = await ChatDatabaseService.getConversationMessages(
    matchId, 
    userId, 
    50, // limit
    offset
  );
  return result.messages;
};
```

### 3. Debounced Updates

```typescript
// Debounce frequent updates
import { debounce } from 'lodash';

const debouncedRefresh = debounce(refreshConversations, 1000);
```

## 📊 MONITORING AND MAINTENANCE

### 1. Message Volume Monitoring

```sql
-- Daily message volume
SELECT 
  DATE(created_at) as message_date,
  COUNT(*) as daily_messages,
  COUNT(DISTINCT match_id) as active_conversations
FROM public.messages 
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY message_date DESC;
```

### 2. Performance Monitoring

```sql
-- Slow query monitoring
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  rows
FROM pg_stat_statements
WHERE query LIKE '%messages%' OR query LIKE '%matches%'
ORDER BY mean_time DESC
LIMIT 10;
```

### 3. Cleanup Procedures

```sql
-- Archive old messages (run monthly)
SELECT archive_old_conversations(90); -- Archive conversations older than 90 days

-- Clean up orphaned data
SELECT cleanup_orphaned_conversations();
```

## 🔒 SECURITY CONSIDERATIONS

### 1. Row Level Security (RLS)
All SQL scripts include comprehensive RLS policies that ensure:
- Users can only see their own conversations
- Users can only send messages in their matches
- Users can only edit/delete their own messages

### 2. Message Encryption
The system includes placeholder encryption functions. For production:

```typescript
// Use proper encryption in production
import crypto from 'crypto';

const encryptMessage = (content: string, key: string): string => {
  const cipher = crypto.createCipher('aes-256-gcm', key);
  return cipher.update(content, 'utf8', 'hex') + cipher.final('hex');
};
```

### 3. Rate Limiting
Implement rate limiting for message sending:

```typescript
import rateLimit from 'express-rate-limit';

const messageRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 requests per minute
  message: 'Too many messages sent, please try again later'
});
```

## 🚀 DEPLOYMENT CHECKLIST

- [ ] Database scripts executed successfully
- [ ] All functions tested and working
- [ ] RLS policies verified
- [ ] Frontend components integrated
- [ ] Message persistence tested
- [ ] Browser refresh tested
- [ ] Navigation tested
- [ ] Performance optimized
- [ ] Monitoring set up
- [ ] Security reviewed
- [ ] Backup procedures in place

## 📞 SUPPORT AND TROUBLESHOOTING

### Common Issues

1. **Messages not persisting**: Check database connection and RLS policies
2. **Slow performance**: Verify indexes are created and optimize queries
3. **Sync issues**: Check network connectivity and Supabase configuration
4. **Permission errors**: Verify user authentication and RLS policies

### Debug Queries

```sql
-- Check recent messages for a user
SELECT m.*, p.name as sender_name
FROM public.messages m
JOIN public.profiles p ON m.sender_id = p.id
WHERE m.match_id IN (
  SELECT id FROM public.matches 
  WHERE user1_id = 'user-uuid' OR user2_id = 'user-uuid'
)
ORDER BY m.created_at DESC
LIMIT 10;

-- Check conversation state
SELECT * FROM public.conversation_read_state
WHERE user_id = 'user-uuid'
ORDER BY updated_at DESC;
```

---

**✅ Your chat system is now ready for production use with full message persistence across navigation and refresh!**