import { createClient } from '@libsql/client';
import bcrypt from 'bcrypt';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL || 'libsql://dev-chi11f.aws-eu-west-1.turso.io',
  authToken: process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Nzk2NTYzMzAsImlkIjoiMDE5ZTViYzItZmEwMS03MDE5LTk2ZDEtM2NiZWM1NTY3MTYzIiwicmlkIjoiZWQ2MzcxMjEtYThmZC00ZjExLWI3OWItNjcyYTY2NTc3ZDkxIn0.Q2Sl1pQeLYE6pTcrSmjN5xF2M9hYvKKgfZ2FjN382jpbTWASYx8kI6qckumoe-LkHmkHKtMGCBn9aHpCarZ1AQ',
});

async function setup() {
  console.log('🔧 Creating tables...');

  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'Member' CHECK(role IN ('Admin', 'Member', 'Trainer')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS memberships (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      duration_months INTEGER NOT NULL,
      features TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_memberships (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      membership_id INTEGER REFERENCES memberships(id) ON DELETE CASCADE,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'expired', 'cancelled')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS trainers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      specialty TEXT,
      bio TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS classes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      trainer_id INTEGER REFERENCES trainers(id) ON DELETE SET NULL,
      capacity INTEGER NOT NULL,
      date DATE NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
      status TEXT DEFAULT 'booked' CHECK(status IN ('booked', 'cancelled')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS workouts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      date DATE NOT NULL,
      duration_minutes INTEGER NOT NULL,
      type TEXT NOT NULL,
      calories_burned INTEGER,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      amount REAL NOT NULL,
      payment_date DATE NOT NULL,
      status TEXT DEFAULT 'completed' CHECK(status IN ('completed', 'pending', 'failed')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log('✅ Tables structure ready!');

  // Drop and recreate to avoid FK issues
  console.log('🧹 Dropping existing tables...');
  await db.executeMultiple(`
    DROP TABLE IF EXISTS payments;
    DROP TABLE IF EXISTS workouts;
    DROP TABLE IF EXISTS bookings;
    DROP TABLE IF EXISTS classes;
    DROP TABLE IF EXISTS trainers;
    DROP TABLE IF EXISTS user_memberships;
    DROP TABLE IF EXISTS memberships;
    DROP TABLE IF EXISTS users;
  `);

  console.log('🔧 Recreating tables...');
  await db.executeMultiple(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'Member' CHECK(role IN ('Admin', 'Member', 'Trainer')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE memberships (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      duration_months INTEGER NOT NULL,
      features TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE user_memberships (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      membership_id INTEGER REFERENCES memberships(id) ON DELETE CASCADE,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'expired', 'cancelled')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE trainers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      specialty TEXT,
      bio TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE classes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      trainer_id INTEGER REFERENCES trainers(id) ON DELETE SET NULL,
      capacity INTEGER NOT NULL,
      date DATE NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
      status TEXT DEFAULT 'booked' CHECK(status IN ('booked', 'cancelled')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE workouts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      date DATE NOT NULL,
      duration_minutes INTEGER NOT NULL,
      type TEXT NOT NULL,
      calories_burned INTEGER,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      amount REAL NOT NULL,
      payment_date DATE NOT NULL,
      status TEXT DEFAULT 'completed' CHECK(status IN ('completed', 'pending', 'failed')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed data
  console.log('🌱 Seeding data...');
  const password_hash = await bcrypt.hash('password123', 10);

  // Users
  await db.execute({ sql: 'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)', args: ['Admin User', 'admin@fitness.com', password_hash, 'Admin'] });
  await db.execute({ sql: 'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)', args: ['Trainer Jane', 'jane@fitness.com', password_hash, 'Trainer'] });
  await db.execute({ sql: 'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)', args: ['Trainer Max', 'max@fitness.com', password_hash, 'Trainer'] });
  await db.execute({ sql: 'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)', args: ['Member John', 'john@fitness.com', password_hash, 'Member'] });
  await db.execute({ sql: 'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)', args: ['Member Maria', 'maria@fitness.com', password_hash, 'Member'] });

  // Trainers
  await db.execute({ sql: 'INSERT INTO trainers (user_id, specialty, bio) VALUES (?, ?, ?)', args: [2, 'Yoga & Pilates', 'Certified yoga instructor with 10+ years of experience.'] });
  await db.execute({ sql: 'INSERT INTO trainers (user_id, specialty, bio) VALUES (?, ?, ?)', args: [3, 'Strength & CrossFit', 'Former athlete and master of sport. Will help you achieve your best results.'] });

  // Memberships
  await db.execute({ sql: 'INSERT INTO memberships (name, description, price, duration_months, features) VALUES (?, ?, ?, ?, ?)', args: ['Basic', 'Access to gym equipment anytime.', 29.99, 1, '["Gym Access", "Locker Room", "Showers"]'] });
  await db.execute({ sql: 'INSERT INTO memberships (name, description, price, duration_months, features) VALUES (?, ?, ?, ?, ?)', args: ['Pro', 'Gym access plus all group classes.', 59.99, 1, '["Gym Access", "Locker Room", "Showers", "All Group Classes"]'] });
  await db.execute({ sql: 'INSERT INTO memberships (name, description, price, duration_months, features) VALUES (?, ?, ?, ?, ?)', args: ['Elite', 'Full access with personal training sessions.', 99.99, 1, '["Gym Access", "Locker Room", "Showers", "All Group Classes", "2 PT Sessions/mo", "Sauna"]'] });

  // Classes
  await db.execute({ sql: 'INSERT INTO classes (name, description, trainer_id, capacity, date, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?, ?)', args: ['Morning Yoga', 'Start your day with harmony of body and mind.', 1, 20, '2026-06-01', '08:00', '09:00'] });
  await db.execute({ sql: 'INSERT INTO classes (name, description, trainer_id, capacity, date, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?, ?)', args: ['HIIT Blast', 'High intensity interval training for endurance.', 2, 15, '2026-06-01', '19:00', '20:00'] });
  await db.execute({ sql: 'INSERT INTO classes (name, description, trainer_id, capacity, date, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?, ?)', args: ['Pilates Core', 'Strengthen your core muscles and improve posture.', 1, 15, '2026-06-02', '10:00', '11:00'] });

  // Bookings
  await db.execute({ sql: 'INSERT INTO bookings (user_id, class_id, status) VALUES (?, ?, ?)', args: [4, 1, 'booked'] });
  await db.execute({ sql: 'INSERT INTO bookings (user_id, class_id, status) VALUES (?, ?, ?)', args: [4, 2, 'booked'] });
  await db.execute({ sql: 'INSERT INTO bookings (user_id, class_id, status) VALUES (?, ?, ?)', args: [5, 1, 'booked'] });

  // Workouts
  await db.execute({ sql: 'INSERT INTO workouts (user_id, date, duration_minutes, type, calories_burned, notes) VALUES (?, ?, ?, ?, ?, ?)', args: [4, '2026-05-18', 30, 'Cardio', 250, 'Light treadmill run'] });
  await db.execute({ sql: 'INSERT INTO workouts (user_id, date, duration_minutes, type, calories_burned, notes) VALUES (?, ?, ?, ?, ?, ?)', args: [4, '2026-05-20', 45, 'Cardio', 350, 'Running 5km on treadmill'] });
  await db.execute({ sql: 'INSERT INTO workouts (user_id, date, duration_minutes, type, calories_burned, notes) VALUES (?, ?, ?, ?, ?, ?)', args: [4, '2026-05-22', 60, 'Strength', 400, 'Chest and triceps workout'] });
  await db.execute({ sql: 'INSERT INTO workouts (user_id, date, duration_minutes, type, calories_burned, notes) VALUES (?, ?, ?, ?, ?, ?)', args: [4, '2026-05-24', 50, 'Strength', 380, 'Leg day — squats and lunges'] });
  await db.execute({ sql: 'INSERT INTO workouts (user_id, date, duration_minutes, type, calories_burned, notes) VALUES (?, ?, ?, ?, ?, ?)', args: [5, '2026-05-21', 60, 'Yoga', 200, 'Great relaxing session'] });

  // Payments
  await db.execute({ sql: 'INSERT INTO payments (user_id, amount, payment_date, status) VALUES (?, ?, ?, ?)', args: [4, 59.99, '2026-05-01', 'completed'] });
  await db.execute({ sql: 'INSERT INTO payments (user_id, amount, payment_date, status) VALUES (?, ?, ?, ?)', args: [5, 99.99, '2026-05-15', 'completed'] });

  console.log('✅ Seed data inserted!');
  console.log('🎉 Database setup complete!');
}

setup().catch(console.error);
