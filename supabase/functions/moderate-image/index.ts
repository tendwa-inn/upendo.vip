
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8'

const MODERATION_API_KEY = Deno.env.get('SIGHTENGINE_API_KEY')
const MODERATION_API_SECRET = Deno.env.get('SIGHTENGINE_API_SECRET')

interface WebhookPayload {
  type: 'INSERT';
  table: string;
  record: {
    name: string;
    bucket_id: string;
    owner_id: string;
  };
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405 });
  }

  const payload = await req.json() as WebhookPayload;
  const { record } = payload;

  if (record.bucket_id !== 'avatars') {
    return new Response(JSON.stringify({ message: 'Not an avatar, skipping.' }));
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const { data: { publicUrl } } = supabaseAdmin.storage
    .from(record.bucket_id)
    .getPublicUrl(record.name);

  const models = 'nudity-2.0,ai_generated';
  const apiUrl = `https://api.sightengine.com/1.0/check.json?models=${models}&url=${encodeURIComponent(publicUrl)}&api_user=${MODERATION_API_KEY}&api_secret=${MODERATION_API_SECRET}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    console.log('Moderation result:', JSON.stringify(data, null, 2));

    const userId = record.owner_id;
    const photoPath = record.name;

    // Case 1: Explicit Content Detected -> Ban User
    if (data.nudity.raw > 0.85) {
      console.log(`High confidence of nudity detected for user ${userId}. Banning user and deleting photo.`);
      
      // Delete the photo
      await supabaseAdmin.storage.from('avatars').remove([photoPath]);

      // Ban the user
      await supabaseAdmin.from('profiles').update({ is_banned: true }).eq('id', userId);

      return new Response(JSON.stringify({ status: 'success', action: 'user_banned', reason: 'explicit_content' }));
    }

    // Case 2: AI-Generated Content Detected -> Lower Visibility
    if (data.ai_generated > 0.9) {
      console.log(`High confidence of AI generation detected for user ${userId}. Deleting photo and lowering visibility.`);

      // Delete the photo
      await supabaseAdmin.storage.from('avatars').remove([photoPath]);

      // Lower user's visibility by applying a modifier (e.g., halving their score)
      const { data: profile, error } = await supabaseAdmin.from('profiles').select('visibility_modifier').eq('id', userId).single();
      if (profile) {
        const newModifier = (profile.visibility_modifier || 1.0) * 0.5; // Reduce by 50%
        await supabaseAdmin.from('profiles').update({ visibility_modifier: newModifier }).eq('id', userId);
      }

      return new Response(JSON.stringify({ status: 'success', action: 'photo_deleted', reason: 'ai_generated_content' }));
    }

    return new Response(JSON.stringify({ status: 'success', action: 'none', moderationData: data }));

  } catch (error) {
    console.error('Error in moderation function:', error);
    return new Response(JSON.stringify({ error: 'Moderation failed' }), { status: 500 });
  }
});
