import { createClient } from '@supabase/supabase-js';

// Use the Service Role Key for admin operations
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // A very basic form of authentication. In a real app, you'd verify a JWT or session.
    const adminSecret = req.headers['x-admin-secret'];
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 1. Find deactivated profiles older than 30 days
    const { data: profiles, error: fetchError } = await supabase
      .from('profiles')
      .select('id')
      .lt('deactivated_at', thirtyDaysAgo.toISOString());

    if (fetchError) {
      throw fetchError;
    }

    if (!profiles || profiles.length === 0) {
      return res.status(200).json({ message: 'No accounts to clean up.' });
    }

    const userIds = profiles.map(p => p.id);
    let deletedCount = 0;
    let failedDeletions = [];

    // 2. Delete each user from auth
    for (const userId of userIds) {
      const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
      if (deleteError) {
        console.error(`Failed to delete user ${userId}:`, deleteError.message);
        failedDeletions.push({ userId, error: deleteError.message });
      } else {
        deletedCount++;
      }
    }

    res.status(200).json({
      message: `Cleanup complete. Deleted ${deletedCount} accounts.`,
      deletedCount,
      failedDeletions,
    });

  } catch (err) {
    console.error('Error during cleanup:', err);
    res.status(500).json({ error: err.message || 'An internal server error occurred.' });
  }
}
