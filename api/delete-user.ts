import { createClient } from '@supabase/supabase-js'

// Use the Service Role Key for admin operations
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // IMPORTANT: Use the service role key
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { userId, reason } = req.body

    // 1. Validate userId
    if (!userId) {
      console.error("[delete-user] User ID is missing in the request body.")
      return res.status(400).json({ error: "User ID is required" })
    }
    console.log(`[delete-user] Received request to delete user ID: ${userId} for reason: ${reason}`)

    // 2. Delete user from auth schema. The ON DELETE CASCADE constraint will handle the public.profiles record.
    const { error } = await supabase.auth.admin.deleteUser(userId)

    if (error) {
      console.error('[delete-user] AUTH DELETE ERROR:', error) // Log the full error object
      throw error
    }

    console.log(`[delete-user] Successfully deleted auth user ID: ${userId}. The database cascade will handle the profile.`)
    return res.status(200).json({ message: "User deleted successfully" })

  } catch (err) {
    console.error('[delete-user] FULL ERROR:', err) // Log the full error object
    return res.status(500).json({ error: err.message || "An internal server error occurred" })
  }
}
