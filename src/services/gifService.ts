import { supabase } from '../lib/supabaseClient';

export const gifService = {
  async getGifs() {
    const { data, error } = await supabase.from('gifs').select('*');
    if (error) {
      console.error('Error fetching gifs:', error);
      throw error;
    }
    return data;
  },

  async uploadGif(file: File, keywords: string[]) {
    const fileName = `${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage.from('gifs').upload(fileName, file);
    if (uploadError) {
      console.error('Error uploading gif:', uploadError);
      throw uploadError;
    }

    const { data: urlData } = supabase.storage.from('gifs').getPublicUrl(fileName);
    const publicUrl = urlData.publicUrl;

    const { data: dbData, error: dbError } = await supabase.from('gifs').insert({ url: publicUrl, keywords });
    if (dbError) {
      console.error('Error saving gif to db:', dbError);
      throw dbError;
    }

    return dbData;
  },

  async deleteGif(id: number) {
    const { error } = await supabase.from('gifs').delete().eq('id', id);
    if (error) {
      console.error('Error deleting gif:', error);
      throw error;
    }
  },

  async updateGif(id: number, keywords: string[]) {
    const { error } = await supabase.from('gifs').update({ keywords }).eq('id', id);
    if (error) {
      console.error('Error updating gif:', error);
      throw error;
    }
  },
};
