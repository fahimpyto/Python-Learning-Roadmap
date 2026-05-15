import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: 'Username required' });
  }

  // GET - Get user progress
  if (req.method === 'GET') {
    try {
      const result = await sql`
        SELECT day FROM progress 
        WHERE user_id = (SELECT id FROM users WHERE username = ${username})
        ORDER BY day
      `;

      const days = result.rows.map(row => row.day);
      return res.status(200).json({ success: true, progress: days });
    } catch (error) {
      console.error('Get progress error:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  // POST - Toggle day completion
  if (req.method === 'POST') {
    const { day, completed } = req.body;

    if (!day) {
      return res.status(400).json({ error: 'Day required' });
    }

    try {
      // Get user ID
      const userResult = await sql`
        SELECT id FROM users WHERE username = ${username}
      `;

      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const userId = userResult.rows[0].id;

      if (completed) {
        // Add to progress
        await sql`
          INSERT INTO progress (user_id, day) 
          VALUES (${userId}, ${day})
          ON CONFLICT (user_id, day) DO NOTHING
        `;
      } else {
        // Remove from progress
        await sql`
          DELETE FROM progress WHERE user_id = ${userId} AND day = ${day}
        `;
      }

      // Get updated progress
      const result = await sql`
        SELECT day FROM progress 
        WHERE user_id = ${userId}
        ORDER BY day
      `;

      const days = result.rows.map(row => row.day);
      return res.status(200).json({ success: true, progress: days });
    } catch (error) {
      console.error('Update progress error:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}