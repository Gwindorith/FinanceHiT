CREATE TABLE IF NOT EXISTS training_invoices (
    id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(255),
    invoice_date DATE,
    customer VARCHAR(255) NOT NULL,
    training_name VARCHAR(255) NOT NULL,
    training_dates JSONB NOT NULL,
    duration_days INTEGER NOT NULL,
    trainer_costs NUMERIC(12,2) NOT NULL,
    office_costs NUMERIC(12,2) NOT NULL,
    margin_percentage NUMERIC(5,2) NOT NULL,
    total_invoice_amount NUMERIC(12,2) NOT NULL,
    trainer_availability_emailed BOOLEAN DEFAULT FALSE,
    masterclass_planning_added BOOLEAN DEFAULT FALSE,
    lms_updated BOOLEAN DEFAULT FALSE,
    navara_event_agenda_updated BOOLEAN DEFAULT FALSE,
    catering_ordered BOOLEAN DEFAULT FALSE,
    trainer_invoice_received BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);


CREATE TABLE IF NOT EXISTS participants (
    id SERIAL PRIMARY KEY,
    training_invoice_id INTEGER NOT NULL REFERENCES training_invoices(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'user', 'manager')),
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'user', 'manager')),
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Insert default admin user (password will be hashed by the application)
-- This is just a placeholder - the actual admin user will be created by the application
-- with proper bcrypt hashing

-- Create catering_options table
CREATE TABLE IF NOT EXISTS catering_options (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  lunch_price_per_participant DECIMAL(10,2) NOT NULL,
  dinner_price_per_participant DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on name for faster lookups
CREATE INDEX IF NOT EXISTS idx_catering_options_name ON catering_options(name); 