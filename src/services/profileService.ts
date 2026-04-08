import { supabase } from '../utils/supabase';

export const profileService = {
  // Get a profile by its ID
  async getProfileById(profileId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', profileId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  },

  // Create the system profile
  async createSystemProfile() {
    const { data, error } = await supabase
      .from('profiles')
      .insert([{ id: '00000000-0000-0000-0000-000000000000', name: 'Upendo', role: 'system' }]);

    if (error) throw error;
    return data;
  },

  // Get profiles for the discover page, excluding the system user
  async getDiscoverProfiles(currentUserId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .not('role', 'eq', 'system')
      .not('is_blocked', 'eq', true)
      .not('id', 'eq', currentUserId);

    if (error) throw error;
    return data;
  },

  // Update a profile
  async updateProfile(profileId: string, updates: any) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', profileId);

    if (error) throw error;
    return data;
  },

  // Search for profiles by name
  async searchProfiles(searchTerm: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('id,name,dob,photos')
      .ilike('name', `%${searchTerm}%`)
      .not('role', 'eq', 'system');

    if (error) throw error;
    return data;
  },

  // Get all profiles
  async getAllProfiles() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .not('role', 'eq', 'system');

    if (error) throw error;
    return data;
  },

  // Delete a profile
  async deleteProfile(profileId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', profileId);

    if (error) throw error;
    return data;
  },

  // Block a profile
  async blockProfile(profileId: string) {
    return await this.updateProfile(profileId, { is_blocked: true });
  },

  // Unblock a profile
  async unblockProfile(profileId: string) {
    return await this.updateProfile(profileId, { is_blocked: false });
  },

  // Get dormant profiles
  async getDormantProfiles() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('is_deactivated', true);

    if (error) throw error;
    return data;
  },
};
