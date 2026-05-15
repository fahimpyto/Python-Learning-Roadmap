-- Run this in Vercel Postgres Query Runner
-- Creates tables for users and progress tracking

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Progress table
CREATE TABLE IF NOT EXISTS progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  day INTEGER NOT NULL,
  UNIQUE(user_id, day)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_progress_user ON progress(user_id);