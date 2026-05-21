import { supabase } from '../lib/supabaseClient';

export interface StoreItem {
  id: number;
  name: string;
  description: string;
  category: string;
  price_flares: number;
  effect: Record<string, any>;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface StorePurchase {
  id: number;
  user_id: string;
  store_item_id: number;
  promo_code_id: number | null;
  flare_cost: number;
  status: string;
  created_at: string;
  store_items?: StoreItem;
}

export const storeService = {
  async getActiveItems(): Promise<StoreItem[]> {
    const { data, error } = await supabase
      .from('store_items')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Failed to fetch store items:', error);
      return [];
    }
    return data || [];
  },

  async getAllItems(): Promise<StoreItem[]> {
    const { data, error } = await supabase
      .from('store_items')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Failed to fetch all store items:', error);
      return [];
    }
    return data || [];
  },

  async purchaseItem(userId: string, itemId: number) {
    const { data, error } = await supabase.rpc('purchase_store_item', {
      p_user_id: userId,
      p_item_id: itemId,
    });

    if (error) {
      console.error('Purchase failed:', error);
      return { success: false, error: error.message };
    }
    return data as { success: boolean; error?: string; purchase_id?: number; promo_code?: string; promo_id?: number };
  },

  async getPurchaseHistory(userId: string, limit = 50): Promise<StorePurchase[]> {
    const { data, error } = await supabase
      .from('store_purchases')
      .select('*, store_items(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to fetch purchase history:', error);
      return [];
    }
    return data || [];
  },

  async getAllPurchases(limit = 100): Promise<StorePurchase[]> {
    const { data, error } = await supabase
      .from('store_purchases')
      .select('*, store_items(*), profiles!inner(name)')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to fetch all purchases:', error);
      return [];
    }
    return data || [];
  },

  async getActivePurchases(userId: string): Promise<StorePurchase[]> {
    const { data, error } = await supabase
      .from('store_purchases')
      .select('*, store_items(*)')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch active purchases:', error);
      return [];
    }
    return data || [];
  },

  // Admin CRUD
  async createItem(item: Omit<StoreItem, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('store_items')
      .insert(item)
      .select()
      .single();

    if (error) {
      console.error('Failed to create store item:', error);
      return null;
    }
    return data;
  },

  async updateItem(id: number, updates: Partial<StoreItem>) {
    const { data, error } = await supabase
      .from('store_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Failed to update store item:', error);
      return null;
    }
    return data;
  },

  async deleteItem(id: number) {
    const { error } = await supabase
      .from('store_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Failed to delete store item:', error);
      return false;
    }
    return true;
  },
};
