import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  if (password.length < 4) {
    return res.status(400).json({ error: 'Password must be at least 4 characters' });
  }

  try {
    // Check if user exists
    const existing = await sql`
      SELECT id FROM users WHERE username = ${username}
    `;

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Simple hash function
    const hash = simpleHash(password);

    // Create user
    const result = await sql`
      INSERT INTO users (username, password_hash)
      VALUES (${username}, ${hash})
      RETURNING id, username
    `;

    return res.status(201).json({ 
      success: true, 
      user: { id: result.rows[0].id, username: result.rows[0].username } 
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString();
}