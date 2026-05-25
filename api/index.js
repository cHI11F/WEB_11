import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { createClient } from '@libsql/client';

const app = express();

// --- CORS: allow local dev + deployed Vercel frontend ---
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL, // set this in Vercel env vars, e.g. https://your-app.vercel.app
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // In production on Vercel, frontend & API share the same domain, so origin matches
    return callback(null, true);
  },
  credentials: true,
}));

app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-dev';

// --- Turso DB Connection ---
const db = createClient({
  url: process.env.TURSO_DATABASE_URL || 'libsql://dev-chi11f.aws-eu-west-1.turso.io',
  authToken: process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Nzk2NTYzMzAsImlkIjoiMDE5ZTViYzItZmEwMS03MDE5LTk2ZDEtM2NiZWM1NTY3MTYzIiwicmlkIjoiZWQ2MzcxMjEtYThmZC00ZjExLWI3OWItNjcyYTY2NTc3ZDkxIn0.Q2Sl1pQeLYE6pTcrSmjN5xF2M9hYvKKgfZ2FjN382jpbTWASYx8kI6qckumoe-LkHmkHKtMGCBn9aHpCarZ1AQ',
});

// --- Middleware ---
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = decoded;
    next();
  });
};

const authorize = (roles = []) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};

// --- AUTH ---
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const existing = await db.execute({ sql: 'SELECT id FROM users WHERE email = ?', args: [email] });
    if (existing.rows.length > 0) return res.status(400).json({ error: 'Email already exists' });

    const password_hash = await bcrypt.hash(password, 10);
    const userRole = role || 'Member';
    const result = await db.execute({
      sql: 'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      args: [name, email, password_hash, userRole],
    });

    const id = Number(result.lastInsertRowid);

    if (userRole === 'Trainer') {
      await db.execute({ sql: 'INSERT INTO trainers (user_id) VALUES (?)', args: [id] });
    }

    const token = jwt.sign({ id, role: userRole }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id, name, email, role: userRole } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await db.execute({ sql: 'SELECT * FROM users WHERE email = ?', args: [email] });
    if (result.rows.length === 0) return res.status(400).json({ error: 'Invalid credentials' });

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- PUBLIC ---
app.get('/api/classes', async (req, res) => {
  try {
    const result = await db.execute(
      'SELECT classes.*, users.name as trainer_name FROM classes JOIN trainers ON classes.trainer_id = trainers.id JOIN users ON trainers.user_id = users.id ORDER BY classes.date ASC, classes.start_time ASC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/memberships', async (req, res) => {
  try {
    const result = await db.execute('SELECT * FROM memberships');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/trainers', async (req, res) => {
  try {
    const result = await db.execute('SELECT trainers.id as trainer_id, users.id as user_id, users.name, users.email, trainers.specialty, trainers.bio FROM trainers JOIN users ON trainers.user_id = users.id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// --- PROTECTED (ME / MEMBER) ---
app.get('/api/users/me', authenticate, async (req, res) => {
  try {
    const result = await db.execute({ sql: 'SELECT id, name, email, role, created_at FROM users WHERE id = ?', args: [req.user.id] });
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    
    // Also fetch their active membership if they are a member
    let membership = null;
    const memRes = await db.execute({
      sql: `SELECT m.name, um.end_date FROM user_memberships um JOIN memberships m ON um.membership_id = m.id 
            WHERE um.user_id = ? AND um.status = 'active' ORDER BY um.id DESC LIMIT 1`,
      args: [req.user.id]
    });
    if (memRes.rows.length > 0) membership = memRes.rows[0];

    res.json({ ...result.rows[0], membership });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/users/me/membership', authenticate, authorize(['Member', 'Admin']), async (req, res) => {
  const { membership_id } = req.body;
  try {
    // Cancel existing
    await db.execute({ sql: "UPDATE user_memberships SET status = 'cancelled' WHERE user_id = ? AND status = 'active'", args: [req.user.id] });
    // Add new (simulated 1 month duration)
    const startDate = new Date().toISOString().split('T')[0];
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);
    
    await db.execute({
      sql: "INSERT INTO user_memberships (user_id, membership_id, start_date, end_date, status) VALUES (?, ?, ?, ?, 'active')",
      args: [req.user.id, Number(membership_id), startDate, endDate.toISOString().split('T')[0]]
    });
    res.json({ message: 'Membership updated successfully' });
  } catch (err) {
    console.error('Membership POST error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/bookings', authenticate, authorize(['Member', 'Admin']), async (req, res) => {
  const { class_id } = req.body;
  try {
    const existing = await db.execute({ sql: 'SELECT id FROM bookings WHERE user_id = ? AND class_id = ?', args: [req.user.id, class_id] });
    if (existing.rows.length > 0) return res.status(400).json({ error: 'Already booked' });
    await db.execute({ sql: 'INSERT INTO bookings (user_id, class_id) VALUES (?, ?)', args: [req.user.id, class_id] });
    res.json({ message: 'Booked successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/bookings/me', authenticate, async (req, res) => {
  try {
    const result = await db.execute({
      sql: 'SELECT bookings.*, classes.name as class_name, classes.date, classes.start_time, classes.end_time FROM bookings JOIN classes ON bookings.class_id = classes.id WHERE bookings.user_id = ?',
      args: [req.user.id],
    });
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/bookings/:id', authenticate, async (req, res) => {
  try {
    await db.execute({ sql: 'DELETE FROM bookings WHERE id = ? AND user_id = ?', args: [req.params.id, req.user.id] });
    res.json({ message: 'Booking cancelled' });
  } catch (err) {
    console.error('Booking DELETE error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/workouts/me', authenticate, async (req, res) => {
  try {
    const result = await db.execute({ sql: 'SELECT * FROM workouts WHERE user_id = ? ORDER BY date DESC', args: [req.user.id] });
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/workouts', authenticate, async (req, res) => {
  const { date, duration_minutes, type, calories_burned, notes } = req.body;
  try {
    await db.execute({
      sql: 'INSERT INTO workouts (user_id, date, duration_minutes, type, calories_burned, notes) VALUES (?, ?, ?, ?, ?, ?)',
      args: [
        req.user.id, 
        date, 
        Number(duration_minutes) || 0, 
        type, 
        (calories_burned !== undefined && calories_burned !== '') ? Number(calories_burned) : null, 
        notes || null
      ],
    });
    res.json({ message: 'Workout logged' });
  } catch (err) {
    console.error('Workout POST error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/workouts/:id', authenticate, async (req, res) => {
  const { date, duration_minutes, type, calories_burned, notes } = req.body;
  try {
    await db.execute({
      sql: 'UPDATE workouts SET date = ?, duration_minutes = ?, type = ?, calories_burned = ?, notes = ? WHERE id = ? AND user_id = ?',
      args: [
        date, 
        Number(duration_minutes) || 0, 
        type, 
        (calories_burned !== undefined && calories_burned !== '') ? Number(calories_burned) : null, 
        notes || null, 
        req.params.id, 
        req.user.id
      ],
    });
    res.json({ message: 'Workout updated' });
  } catch (err) {
    console.error('Workout PUT error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/workouts/:id', authenticate, async (req, res) => {
  try {
    await db.execute({ sql: 'DELETE FROM workouts WHERE id = ? AND user_id = ?', args: [req.params.id, req.user.id] });
    res.json({ message: 'Workout deleted' });
  } catch (err) {
    console.error('Workout DELETE error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


// --- TRAINER ROUTES ---
app.get('/api/trainer/classes', authenticate, authorize(['Trainer', 'Admin']), async (req, res) => {
  try {
    // get trainer id from user id
    const tRes = await db.execute({ sql: 'SELECT id FROM trainers WHERE user_id = ?', args: [req.user.id] });
    if (tRes.rows.length === 0) return res.status(404).json({ error: 'Trainer profile not found' });
    const trainer_id = tRes.rows[0].id;
    
    const result = await db.execute({
      sql: 'SELECT * FROM classes WHERE trainer_id = ? ORDER BY date ASC, start_time ASC',
      args: [trainer_id]
    });
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/trainer/clients', authenticate, authorize(['Trainer', 'Admin']), async (req, res) => {
  try {
    const tRes = await db.execute({ sql: 'SELECT id FROM trainers WHERE user_id = ?', args: [req.user.id] });
    if (tRes.rows.length === 0) return res.status(404).json({ error: 'Trainer profile not found' });
    const trainer_id = tRes.rows[0].id;

    // Get unique users who booked this trainer's classes
    const result = await db.execute({
      sql: `SELECT DISTINCT u.id, u.name, u.email 
            FROM users u 
            JOIN bookings b ON u.id = b.user_id 
            JOIN classes c ON b.class_id = c.id 
            WHERE c.trainer_id = ?`,
      args: [trainer_id]
    });
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/trainer/clients/:id/workouts', authenticate, authorize(['Trainer', 'Admin']), async (req, res) => {
  try {
    const result = await db.execute({ sql: 'SELECT * FROM workouts WHERE user_id = ? ORDER BY date DESC', args: [req.params.id] });
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Trainer adds notes to client workout
app.put('/api/trainer/workouts/:id/notes', authenticate, authorize(['Trainer', 'Admin']), async (req, res) => {
  const { notes } = req.body;
  try {
    // Append to existing notes
    const wRes = await db.execute({ sql: 'SELECT notes FROM workouts WHERE id = ?', args: [req.params.id] });
    if (wRes.rows.length === 0) return res.status(404).json({ error: 'Workout not found' });
    
    const existingNotes = wRes.rows[0].notes || '';
    const newNotes = existingNotes ? `${existingNotes}\nTrainer Note: ${notes}` : `Trainer Note: ${notes}`;
    
    await db.execute({
      sql: 'UPDATE workouts SET notes = ? WHERE id = ?',
      args: [newNotes, req.params.id]
    });
    res.json({ message: 'Notes added' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Trainer deletes their own class
app.delete('/api/trainer/classes/:id', authenticate, authorize(['Trainer', 'Admin']), async (req, res) => {
  try {
    const tRes = await db.execute({ sql: 'SELECT id FROM trainers WHERE user_id = ?', args: [req.user.id] });
    if (tRes.rows.length === 0 && req.user.role !== 'Admin') return res.status(403).json({ error: 'Forbidden' });
    const trainer_id = req.user.role === 'Admin' ? null : tRes.rows[0].id;
    
    if (trainer_id) {
       await db.execute({ sql: 'DELETE FROM classes WHERE id = ? AND trainer_id = ?', args: [req.params.id, trainer_id] });
    } else {
       await db.execute({ sql: 'DELETE FROM classes WHERE id = ?', args: [req.params.id] });
    }
    res.json({ message: 'Class cancelled' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});


// --- ADMIN ROUTES ---
app.get('/api/admin/stats', authenticate, authorize(['Admin']), async (req, res) => {
  try {
    const users = await db.execute('SELECT COUNT(*) as count FROM users');
    const classes = await db.execute('SELECT COUNT(*) as count FROM classes');
    const bookings = await db.execute('SELECT COUNT(*) as count FROM bookings');
    const revenue = await db.execute("SELECT SUM(amount) as total FROM payments WHERE status = 'completed'");
    
    res.json({
      totalUsers: users.rows[0].count,
      totalClasses: classes.rows[0].count,
      totalBookings: bookings.rows[0].count,
      totalRevenue: revenue.rows[0].total || 0
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin Users CRUD
app.get('/api/admin/users', authenticate, authorize(['Admin']), async (req, res) => {
  try {
    const result = await db.execute('SELECT id, name, email, role, created_at FROM users ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/admin/users/:id', authenticate, authorize(['Admin']), async (req, res) => {
  const { name, email, role } = req.body;
  try {
    await db.execute({
      sql: 'UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?',
      args: [name, email, role, req.params.id]
    });
    res.json({ message: 'User updated' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/admin/users/:id', authenticate, authorize(['Admin']), async (req, res) => {
  try {
    await db.execute({ sql: 'DELETE FROM users WHERE id = ?', args: [req.params.id] });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin Classes CRUD
app.post('/api/admin/classes', authenticate, authorize(['Admin', 'Trainer']), async (req, res) => {
  const { name, description, trainer_id, capacity, date, start_time, end_time } = req.body;
  try {
    let t_id = trainer_id;
    // If Trainer role, auto-fill their own trainer id
    if (req.user.role === 'Trainer' && !t_id) {
       const tRes = await db.execute({ sql: 'SELECT id FROM trainers WHERE user_id = ?', args: [req.user.id] });
       if (tRes.rows.length > 0) t_id = tRes.rows[0].id;
    }
    // If Admin didn't pick a trainer, default to the first trainer in the system
    if (!t_id) {
      const fallback = await db.execute('SELECT id FROM trainers LIMIT 1');
      if (fallback.rows.length > 0) t_id = fallback.rows[0].id;
    }
    if (!t_id) return res.status(400).json({ error: 'No trainers exist in the system. Please create a trainer account first.' });

    await db.execute({
      sql: 'INSERT INTO classes (name, description, trainer_id, capacity, date, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?, ?)',
      args: [name, description, t_id, capacity, date, start_time, end_time],
    });
    res.json({ message: 'Class created' });
  } catch (err) {
    console.error('Create class error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/admin/classes/:id', authenticate, authorize(['Admin', 'Trainer']), async (req, res) => {
  const { name, description, capacity, date, start_time, end_time } = req.body;
  try {
    // For simplicity, we just update the class details.
    await db.execute({
      sql: 'UPDATE classes SET name=?, description=?, capacity=?, date=?, start_time=?, end_time=? WHERE id=?',
      args: [name, description, capacity, date, start_time, end_time, req.params.id],
    });
    res.json({ message: 'Class updated' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/admin/classes/:id', authenticate, authorize(['Admin']), async (req, res) => {
  try {
    await db.execute({ sql: 'DELETE FROM classes WHERE id = ?', args: [req.params.id] });
    res.json({ message: 'Class deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin Memberships CRUD
app.post('/api/admin/memberships', authenticate, authorize(['Admin']), async (req, res) => {
  const { name, description, price, duration_months, features } = req.body;
  try {
    // features may arrive as an array or a string; normalize it
    const featuresArr = Array.isArray(features) ? features : (typeof features === 'string' ? features.split(',').map(s => s.trim()).filter(Boolean) : []);
    await db.execute({
      sql: 'INSERT INTO memberships (name, description, price, duration_months, features) VALUES (?, ?, ?, ?, ?)',
      args: [name, description || '', price, duration_months, JSON.stringify(featuresArr)],
    });
    res.json({ message: 'Membership created' });
  } catch (err) {
    console.error('Create membership error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/admin/memberships/:id', authenticate, authorize(['Admin']), async (req, res) => {
  const { name, description, price, duration_months, features } = req.body;
  try {
    const featuresArr = Array.isArray(features) ? features : (typeof features === 'string' ? features.split(',').map(s => s.trim()).filter(Boolean) : []);
    await db.execute({
      sql: 'UPDATE memberships SET name=?, description=?, price=?, duration_months=?, features=? WHERE id=?',
      args: [name, description || '', price, duration_months, JSON.stringify(featuresArr), req.params.id],
    });
    res.json({ message: 'Membership updated' });
  } catch (err) {
    console.error('Update membership error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/admin/memberships/:id', authenticate, authorize(['Admin']), async (req, res) => {
  try {
    await db.execute({ sql: 'DELETE FROM memberships WHERE id = ?', args: [req.params.id] });
    res.json({ message: 'Membership deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// For local dev: listen on port
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;
