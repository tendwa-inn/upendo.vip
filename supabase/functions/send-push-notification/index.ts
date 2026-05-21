import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const ONESIGNAL_APP_ID = '50e17550-2a2d-4343-9135-226f4aea3d6d'
const ONESIGNAL_API_KEY = Deno.env.get('ONESIGNAL_REST_API_KEY') || ''

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-application-name',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId, title, message, type, additionalData, priority } = await req.json()

    if (!userId || !title || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: userId, title, message' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!ONESIGNAL_API_KEY) {
      console.error('ONESIGNAL_REST_API_KEY not set')
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const notificationPayload = {
      app_id: ONESIGNAL_APP_ID,
      include_external_user_ids: [userId],
      headings: { en: title },
      contents: { en: message },
      data: {
        type: type || 'system',
        timestamp: new Date().toISOString(),
        ...additionalData,
      },
      priority: priority || (type === 'match' || type === 'message' ? 10 : type === 'system' ? 8 : 5),
      ttl: 86400,
    }

    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${ONESIGNAL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notificationPayload),
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('OneSignal API error:', result)
      return new Response(
        JSON.stringify({ error: 'Failed to send notification', details: result }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, id: result.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
