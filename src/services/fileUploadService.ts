
import { supabase } from '../lib/supabaseClient';

export const fileUploadService = {
  async upload(file: File, bucket: string): Promise<string> {
    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);

    if (error) {
      throw error;
    }

    // Get the public URL of the uploaded file
    const { data: publicUrlData } = await supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  },
};
