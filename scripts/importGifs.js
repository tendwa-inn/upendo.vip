import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import fetch from 'node-fetch';

const supabaseUrl = 'https://kvfockaztqldgdobpntf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2Zm9ja2F6dHFsZGdkb2JwbnRmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjc0MTkwNywiZXhwIjoyMDg4MzE3OTA3fQ.SAcvAqtOuYSXTFdd9YdOO8uKnt1yffaSALtSlX5okGI';
const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

const importGifs = async () => {
  const data = JSON.parse(fs.readFileSync('../GIFS/full_set.json', 'utf-8'));

  for (const gif of data.data) {
    try {
      const response = await fetch(gif.images.original.url);
      if (!response.ok) {
        console.error(`Failed to download GIF: ${gif.images.original.url}`);
        continue;
      }
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const fileName = `${Date.now()}-${gif.slug}.gif`;
      const { data: uploadData, error: uploadError } = await supabase.storage.from('gifs').upload(fileName, buffer, { contentType: 'image/gif' });

      if (uploadError) {
        console.error('Error uploading gif:', uploadError);
        continue;
      }

      const { data: urlData } = supabase.storage.from('gifs').getPublicUrl(fileName);
      const publicUrl = urlData.publicUrl;

      const keywords = gif.title.split(' ').map(k => k.toLowerCase());
      if (gif.slug) {
        keywords.push(...gif.slug.split('-').map(k => k.toLowerCase()));
      }

      const { error: dbError } = await supabase.from('gifs').insert({ url: publicUrl, keywords });
      if (dbError) {
        console.error('Error inserting gif:', dbError);
      }
    } catch (error) {
      console.error('An unexpected error occurred:', error);
    }
  }
};

importGifs();
