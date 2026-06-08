import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { dbGet, dbQuery, dbRun } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'lexcounsel_secret_key_12345';

app.use(cors());
app.use(express.json());

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token.' });
    }
    req.user = user;
    next();
  });
};

// Admin Auth Middleware
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
  }
  next();
};

// Advocate Auth Middleware
const requireAdvocate = (req, res, next) => {
  if (req.user.role !== 'advocate') {
    return res.status(403).json({ error: 'Access denied. Advocate privileges required.' });
  }
  next();
};

// --- ROUTES ---

// 1. Register User & Advocate Profile
app.post('/api/auth/register', async (req, res) => {
  const { 
    email, password, role, full_name, bar_number, experience_years, 
    specialty, court, state, district, bio, case_theory_approach, 
    contact_phone, contact_email, profile_image 
  } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ error: 'Email, password and role are required.' });
  }

  try {
    // Check if user already exists
    const existingUser = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const userResult = await dbRun(
      'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
      [email, hashedPassword, role]
    );
    const userId = userResult.lastID;

    // If role is advocate, insert advocate details
    if (role === 'advocate') {
      if (!full_name || !bar_number || !experience_years || !specialty || !court || !state || !district) {
        // Cleanup user if details fail
        await dbRun('DELETE FROM users WHERE id = ?', [userId]);
        return res.status(400).json({ error: 'All advocate details (name, bar number, experience, specialty, court, state, district) are required.' });
      }

      // Check if bar number already exists
      const existingBar = await dbGet('SELECT * FROM advocates WHERE bar_number = ?', [bar_number]);
      if (existingBar) {
        await dbRun('DELETE FROM users WHERE id = ?', [userId]);
        return res.status(400).json({ error: 'Bar Council Registration Number already registered.' });
      }

      await dbRun(
        `INSERT INTO advocates (user_id, full_name, bar_number, experience_years, specialty, court, state, district, bio, case_theory_approach, contact_phone, contact_email, profile_image, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
        [
          userId,
          full_name,
          bar_number,
          parseInt(experience_years),
          specialty,
          court,
          state,
          district,
          bio || '',
          case_theory_approach || '',
          contact_phone || '',
          contact_email || email,
          profile_image || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=400&fit=crop',
        ]
      );
    }

    // Generate JWT token
    const token = jwt.sign({ id: userId, email, role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: { id: userId, email, role }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// 2. Login User
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const user = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials.' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: { id: user.id, email: user.email, role: user.role }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// 3. Get Logged In User details
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await dbGet('SELECT id, email, role FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    let advocateProfile = null;
    if (user.role === 'advocate') {
      advocateProfile = await dbGet('SELECT * FROM advocates WHERE user_id = ?', [user.id]);
    }

    res.json({ user, advocateProfile });
  } catch (error) {
    console.error('Auth check error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

// 4. Get Advocates list (Search & Filters)
app.get('/api/advocates', async (req, res) => {
  const { q, specialty, state, district } = req.query;

  let query = 'SELECT * FROM advocates WHERE status = "verified"';
  let params = [];

  if (q) {
    query += ' AND (full_name LIKE ? OR bio LIKE ? OR court LIKE ?)';
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }

  if (specialty) {
    query += ' AND specialty = ?';
    params.push(specialty);
  }

  if (state) {
    query += ' AND state LIKE ?';
    params.push(`%${state}%`);
  }

  if (district) {
    query += ' AND district LIKE ?';
    params.push(`%${district}%`);
  }

  query += ' ORDER BY experience_years DESC';

  try {
    const advocates = await dbQuery(query, params);
    res.json(advocates);
  } catch (error) {
    console.error('Search advocates error:', error);
    res.status(500).json({ error: 'Error fetching advocates directory.' });
  }
});

// 5. Get Single Advocate Details
app.get('/api/advocates/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const advocate = await dbGet('SELECT * FROM advocates WHERE id = ?', [id]);
    if (!advocate) {
      return res.status(404).json({ error: 'Advocate profile not found.' });
    }
    res.json(advocate);
  } catch (error) {
    console.error('Fetch advocate detail error:', error);
    res.status(500).json({ error: 'Error fetching profile details.' });
  }
});

// 6. Get Advocate Cases (Portfolio)
app.get('/api/advocates/:id/cases', async (req, res) => {
  const { id } = req.params;
  try {
    const cases = await dbQuery('SELECT * FROM advocate_cases WHERE advocate_id = ? ORDER BY case_year DESC', [id]);
    res.json(cases);
  } catch (error) {
    console.error('Fetch advocate cases error:', error);
    res.status(500).json({ error: 'Error fetching case histories.' });
  }
});

// 7. Send Message to Advocate
app.post('/api/advocates/:id/message', async (req, res) => {
  const { id } = req.params;
  const { sender_name, sender_email, sender_phone, message_text } = req.body;

  if (!sender_name || !sender_email || !message_text) {
    return res.status(400).json({ error: 'Sender name, email, and message body are required.' });
  }

  try {
    const advocate = await dbGet('SELECT id FROM advocates WHERE id = ?', [id]);
    if (!advocate) {
      return res.status(404).json({ error: 'Advocate profile not found.' });
    }

    await dbRun(
      'INSERT INTO messages (sender_name, sender_email, sender_phone, advocate_id, message_text) VALUES (?, ?, ?, ?, ?)',
      [sender_name, sender_email, sender_phone || '', id, message_text]
    );

    res.status(201).json({ message: 'Message sent successfully.' });
  } catch (error) {
    console.error('Post message error:', error);
    res.status(500).json({ error: 'Error sending message.' });
  }
});

// 8. Protected Route: Get Advocate Dashboard Details
app.get('/api/dashboard/advocate', authenticateToken, requireAdvocate, async (req, res) => {
  try {
    const advocate = await dbGet('SELECT * FROM advocates WHERE user_id = ?', [req.user.id]);
    if (!advocate) {
      return res.status(404).json({ error: 'Advocate profile not found.' });
    }

    const messages = await dbQuery(
      'SELECT * FROM messages WHERE advocate_id = ? ORDER BY created_at DESC',
      [advocate.id]
    );

    const cases = await dbQuery(
      'SELECT * FROM advocate_cases WHERE advocate_id = ? ORDER BY case_year DESC',
      [advocate.id]
    );

    res.json({ profile: advocate, messages, cases });
  } catch (error) {
    console.error('Advocate dashboard fetch error:', error);
    res.status(500).json({ error: 'Error retrieving dashboard data.' });
  }
});

// 9. Protected Route: Update Advocate Profile Details
app.put('/api/dashboard/advocate/profile', authenticateToken, requireAdvocate, async (req, res) => {
  const { bio, case_theory_approach, contact_phone, contact_email, profile_image, court, specialty, experience_years } = req.body;

  try {
    const advocate = await dbGet('SELECT id FROM advocates WHERE user_id = ?', [req.user.id]);
    if (!advocate) {
      return res.status(404).json({ error: 'Advocate profile not found.' });
    }

    await dbRun(
      `UPDATE advocates 
       SET bio = ?, case_theory_approach = ?, contact_phone = ?, contact_email = ?, profile_image = ?, court = ?, specialty = ?, experience_years = ?
       WHERE user_id = ?`,
      [
        bio || '',
        case_theory_approach || '',
        contact_phone || '',
        contact_email || '',
        profile_image || '',
        court || '',
        specialty || '',
        experience_years ? parseInt(experience_years) : 0,
        req.user.id
      ]
    );

    res.json({ message: 'Profile updated successfully.' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Error updating profile.' });
  }
});

// 10. Protected Route: Advocate Add Case Portfolio
app.post('/api/dashboard/advocate/cases', authenticateToken, requireAdvocate, async (req, res) => {
  const { title, description, result, case_year } = req.body;

  if (!title || !description || !result || !case_year) {
    return res.status(400).json({ error: 'All case details are required.' });
  }

  try {
    const advocate = await dbGet('SELECT id FROM advocates WHERE user_id = ?', [req.user.id]);
    if (!advocate) {
      return res.status(404).json({ error: 'Advocate profile not found.' });
    }

    await dbRun(
      'INSERT INTO advocate_cases (advocate_id, title, description, result, case_year) VALUES (?, ?, ?, ?, ?)',
      [advocate.id, title, description, result, parseInt(case_year)]
    );

    res.status(201).json({ message: 'Case study added successfully.' });
  } catch (error) {
    console.error('Add case error:', error);
    res.status(500).json({ error: 'Error saving case portfolio.' });
  }
});

// 11. Protected Route: Advocate Delete Case Portfolio
app.delete('/api/dashboard/advocate/cases/:caseId', authenticateToken, requireAdvocate, async (req, res) => {
  const { caseId } = req.params;

  try {
    const advocate = await dbGet('SELECT id FROM advocates WHERE user_id = ?', [req.user.id]);
    if (!advocate) {
      return res.status(404).json({ error: 'Advocate profile not found.' });
    }

    const caseData = await dbGet('SELECT advocate_id FROM advocate_cases WHERE id = ?', [caseId]);
    if (!caseData || caseData.advocate_id !== advocate.id) {
      return res.status(403).json({ error: 'Unauthorized to delete this case.' });
    }

    await dbRun('DELETE FROM advocate_cases WHERE id = ?', [caseId]);
    res.json({ message: 'Case study deleted successfully.' });
  } catch (error) {
    console.error('Delete case error:', error);
    res.status(500).json({ error: 'Error deleting case study.' });
  }
});

// 12. Browse & Search Daily Life Rules / Legal Guides
app.get('/api/articles', async (req, res) => {
  const { q, category } = req.query;

  let query = 'SELECT * FROM articles WHERE 1=1';
  let params = [];

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }

  if (q) {
    query += ' AND (title LIKE ? OR content LIKE ? OR tags LIKE ?)';
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }

  try {
    const articles = await dbQuery(query, params);
    res.json(articles);
  } catch (error) {
    console.error('Fetch articles error:', error);
    res.status(500).json({ error: 'Error searching legal guides.' });
  }
});

// 13. Browse & Search Simplified Constitutional Articles
app.get('/api/constitution', async (req, res) => {
  const { q, category } = req.query;

  let query = 'SELECT * FROM constitution_articles WHERE 1=1';
  let params = [];

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }

  if (q) {
    query += ' AND (article_number LIKE ? OR title LIKE ? OR summary LIKE ?)';
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }

  try {
    const articles = await dbQuery(query, params);
    res.json(articles);
  } catch (error) {
    console.error('Fetch constitution error:', error);
    res.status(500).json({ error: 'Error searching constitutional explorer.' });
  }
});

// 14. AI Lawyer Matchmaker Recommender
app.post('/api/matchmaker', async (req, res) => {
  const { description } = req.body;

  if (!description || description.trim().length < 10) {
    return res.status(400).json({ error: 'Please enter a more detailed case description (minimum 10 characters).' });
  }

  const desc = description.toLowerCase();

  // Specialty keyword dictionaries
  const keywordMappings = {
    'Criminal': ['jail', 'bail', 'arrest', 'police', 'theft', 'crime', 'murder', 'fraud', 'assault', 'criminal', 'cheating', 'kidnap', 'scam', 'extortion'],
    'Corporate': ['company', 'business', 'contract', 'incorporate', 'partner', 'founders', 'merger', 'funding', 'shares', 'corporate', 'startup', 'board', 'incorporation'],
    'Family': ['divorce', 'custody', 'marriage', 'wife', 'husband', 'child', 'alimony', 'maintenance', 'family', 'partition', 'will', 'estate', 'property inheritance', 'domestic'],
    'Intellectual Property': ['patent', 'trademark', 'copyright', 'logo', 'brand', 'design copyright', 'infringement', 'intellectual property', 'copycat', 'patent filing', 'ip protection'],
    'Tax': ['tax', 'gst', 'audit', 'customs', 'income tax', 'revenue', 'finance', 'it returns', 'excise', 'taxation', 'service tax'],
    'Cyber': ['hack', 'cyber', 'online', 'scam', 'data leak', 'privacy', 'phishing', 'defamation', 'internet', 'social media', 'profile hacked', 'otp fraud']
  };

  let matchedSpecialty = null;
  let maxMatchesCount = 0;

  // Count matches in query
  for (const [specialty, keywords] of Object.entries(keywordMappings)) {
    let matchesCount = 0;
    for (const word of keywords) {
      if (desc.includes(word)) {
        matchesCount++;
      }
    }
    if (matchesCount > maxMatchesCount) {
      maxMatchesCount = matchesCount;
      matchedSpecialty = specialty;
    }
  }

  try {
    let advocates = [];
    if (matchedSpecialty) {
      // Fetch matching specialty first
      advocates = await dbQuery(
        'SELECT * FROM advocates WHERE status = "verified" AND specialty = ? ORDER BY experience_years DESC LIMIT 3',
        [matchedSpecialty]
      );
    }

    // If no matching specialty or not enough lawyers, fall back to general high-experience lawyers
    if (advocates.length < 3) {
      const existingIds = advocates.map(a => a.id);
      let fallbackQuery = 'SELECT * FROM advocates WHERE status = "verified"';
      let fallbackParams = [];

      if (existingIds.length > 0) {
        fallbackQuery += ` AND id NOT IN (${existingIds.map(() => '?').join(',')})`;
        fallbackParams = [...existingIds];
      }

      fallbackQuery += ' ORDER BY experience_years DESC LIMIT ?';
      fallbackParams.push(3 - advocates.length);

      const fallbacks = await dbQuery(fallbackQuery, fallbackParams);
      advocates = [...advocates, ...fallbacks];
    }

    res.json({
      specialtyMatched: matchedSpecialty || 'General Practice / Combined Consultation',
      matchScore: maxMatchesCount,
      advocates
    });

  } catch (error) {
    console.error('Matchmaker error:', error);
    res.status(500).json({ error: 'Matchmaking engine encountered an error.' });
  }
});

// 15. Protected Route: Admin view all advocates (to moderate)
app.get('/api/admin/advocates', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const advocates = await dbQuery('SELECT * FROM advocates ORDER BY created_at DESC');
    res.json(advocates);
  } catch (error) {
    console.error('Admin fetch advocates error:', error);
    res.status(500).json({ error: 'Error retrieving advocate listings.' });
  }
});

// 16. Protected Route: Admin verify or reject advocate
app.put('/api/admin/advocates/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['verified', 'rejected', 'pending'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status type.' });
  }

  try {
    const result = await dbRun('UPDATE advocates SET status = ? WHERE id = ?', [status, id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Advocate profile not found.' });
    }
    res.json({ message: `Advocate status updated to ${status}.` });
  } catch (error) {
    console.error('Admin status update error:', error);
    res.status(500).json({ error: 'Error updating advocate status.' });
  }
});

app.listen(PORT, () => {
  console.log(`Express server running on port ${PORT}`);
});
