import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from '../stores/authStore';

export interface FilteredWord {
  id: number;
  word: string;
  action: 'warning' | 'strike' | 'ban';
  severity: number;
  word_actions?: Array<{
    id: number;
    word_id: number;
    action_type: 'warning' | 'suspension' | 'ban';
    duration_days: number | null;
  }>;
}

export interface FlaggedContent {
  id: number;
  user_id: string;
  word_id: number;
  content: string;
  context: string;
  created_at: string;
  user?: {
    id: string;
    name: string;
  };
  word?: {
    id: number;
    word: string;
  };
}

export interface UserAction {
  id: number;
  user_id: string;
  action_type: 'warning' | 'suspension' | 'ban';
  reason: string | null;
  admin_id: string | null;
  created_at: string;
  expires_at: string | null;
  status: string | null;
  appeal_reason: string | null;
  user?: {
    id: string;
    name: string;
  };
  admin?: {
    id: string;
    name: string;
  };
}

class WordFilterService {
  private filteredWords: FilteredWord[] = [];

  async loadFilteredWords() {
    console.log('[DEBUG] wordFilterService: Loading filtered words...');
    try {
      const { data, error } = await supabase.from('word_filter').select('*');
      if (error) {
        console.error('Error loading filtered words:', error);
        // Don't throw, just log and continue with empty array
        this.filteredWords = [];
        return;
      }
      this.filteredWords = data || [];
      console.log('[DEBUG] wordFilterService: Loaded', this.filteredWords.length, 'words.', this.filteredWords);
    } catch (error) {
      console.error('Exception loading filtered words:', error);
      this.filteredWords = [];
    }
  }

  getFilteredWords(): FilteredWord[] {
    return this.filteredWords;
  }

  isWordFiltered(word: string): FilteredWord | undefined {
    return this.filteredWords.find(fw => fw.word.toLowerCase() === word.toLowerCase());
  }

  async checkMessage(message: string): Promise<FilteredWord | null> {
    console.log(`[DEBUG] wordFilterService: Checking message: "${message}"`);
    if (this.filteredWords.length === 0) {
      console.log('[DEBUG] wordFilterService: Filtered words not loaded, loading now...');
      await this.loadFilteredWords();
    }

    const words = message.toLowerCase().split(/\s+/);
    for (const word of words) {
      const found = this.filteredWords.find(fw => fw.word.toLowerCase() === word);
      if (found) {
        console.log(`[DEBUG] wordFilterService: Found filtered word: "${word}"`);
        return found;
      }
    }
    console.log('[DEBUG] wordFilterService: No filtered words found in message.');
    return null;
  }

  // Admin methods
  async getFilteredWordsWithActions(): Promise<FilteredWord[]> {
    console.log('Fetching filtered words with actions...');
    const { data, error } = await supabase
      .from('word_filter')
      .select(`
        *,
        word_actions:word_actions!word_id (
          id,
          word_id,
          action_type,
          duration_days
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading filtered words with actions:', error);
      throw error;
    }

    console.log('Filtered words data:', data);
    return data || [];
  }

  async getFlaggedContent(): Promise<FlaggedContent[]> {
    console.log('[DEBUG] getFlaggedContent: Fetching...');
    const { data, error } = await supabase
      .from('flagged_content')
      .select(`
        *,
        user:profiles!flagged_content_user_id_fkey (id, name),
        word:word_filter!flagged_content_word_id_fkey (id, word)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[DEBUG] getFlaggedContent: Supabase error:', error);
      throw error;
    }

    console.log('[DEBUG] getFlaggedContent: Raw data received:', data);
    return data || [];
  }

  async addFilteredWord(word: string): Promise<void> {
    const { error } = await supabase
      .from('word_filter')
      .insert([{ word }]);

    if (error) {
      console.error('Error adding filtered word:', error);
      throw error;
    }
  }

  async removeFilteredWord(id: number): Promise<void> {
    const { error } = await supabase
      .from('word_filter')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error removing filtered word:', error);
      throw error;
    }
  }

  /**
   * @deprecated Use addWordWithAction instead for atomic operations.
   */
  async setWordAction(wordId: number, actionType: 'warning' | 'suspension' | 'ban', durationDays: number | null = null): Promise<void> {
    console.warn('setWordAction is deprecated. Use addWordWithAction instead.');
    const { error } = await supabase
      .from('word_actions')
      .upsert(
        {
          word_id: wordId,
          action_type: actionType,
          duration_days: durationDays,
        },
        {
          onConflict: 'word_id',
        }
      );

    if (error) {
      console.error('Error setting word action:', error);
      throw error;
    }
  }

  async addWordWithAction(word: string, actionType: 'warning' | 'suspension' | 'ban', durationDays: number | null = null): Promise<any> {
    const { data, error } = await supabase.rpc('add_word_and_action', {
      word_text: word,
      action_type_text: actionType,
      duration_days_value: durationDays
    });

    if (error) {
      console.error('Error in add_word_and_action RPC:', error);
      throw error;
    }
    return data;
  }

  async getUserActions(): Promise<UserAction[]> {
    const { data, error } = await supabase
      .from('user_actions')
      .select(`
        *,
        user:profiles!user_actions_user_id_fkey (
          id,
          name
        ),
        admin:profiles!user_actions_admin_id_fkey (
          id,
          name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading user actions:', error);
      throw error;
    }

    return data || [];
  }

  async handleAppeal(actionId: number, appealReason: string): Promise<void> {
    const { error } = await supabase
      .from('user_actions')
      .update({ 
        appeal_reason: appealReason,
        status: 'appealed'
      })
      .eq('id', actionId);

    if (error) {
      console.error('Error handling appeal:', error);
      throw error;
    }
  }

  async takeUserAction(userId: string, actionType: 'warning' | 'suspension' | 'ban', reason?: string, expiresAt?: string, flaggedWord?: string): Promise<void> {
    const user = useAuthStore.getState().user;
    
    // Handle warning with strike system
    if (actionType === 'warning') {
      // Use the record_strike function to handle strikes and notifications
      const { error: strikeError } = await supabase.rpc('record_strike', {
        p_user_id: userId,
        p_reason: reason || 'Automatic warning for inappropriate content',
        p_word: flaggedWord
      });

      if (strikeError) {
        console.error('Error recording strike:', strikeError);
        throw strikeError;
      }
      
      // Also record the user action for admin tracking
      const { error: actionError } = await supabase
        .from('user_actions')
        .insert([{
          user_id: userId,
          action_type: actionType,
          reason: reason || 'Automatic warning for inappropriate content',
          admin_id: user?.id || null,
          status: 'active'
        }]);

      if (actionError) {
        console.error('Error recording user action:', actionError);
        throw actionError;
      }
    } else {
      // For suspension and ban, record user action with expiration
      const { error } = await supabase
        .from('user_actions')
        .insert([{
          user_id: userId,
          action_type: actionType,
          reason,
          expires_at: expiresAt,
          admin_id: user?.id || null,
          status: 'active'
        }]);

      if (error) {
        console.error('Error taking user action:', error);
        throw error;
      }
    }
  }
}

export const wordFilterService = new WordFilterService();