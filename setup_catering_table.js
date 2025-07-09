const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Read .env.local file manually
function loadEnvFile() {
  const envPath = path.join(__dirname, '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        process.env[key.trim()] = valueParts.join('=').trim();
      }
    });
  }
}

loadEnvFile();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function setupCateringTable() {
  try {
    console.log('Setting up catering options table...');
    
    // Create catering_options table
    await pool.query(`
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
    `);

    // Create index on name for faster lookups
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_catering_options_name ON catering_options(name);
    `);

    console.log('Catering options table created successfully!');
    
    // Check if table exists and show structure
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'catering_options' 
      ORDER BY ordinal_position;
    `);
    
    console.log('\nTable structure:');
    result.rows.forEach(row => {
      console.log(`${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });

    // Create training_room_rent_options table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS training_room_rent_options (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        rent_per_hour DECIMAL(10,2) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Create index on name for faster lookups
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_training_room_rent_options_name ON training_room_rent_options(name);
    `);

    console.log('Training room rent options table created successfully!');
    
    // Check if table exists and show structure
    const trainingResult = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'training_room_rent_options' 
      ORDER BY ordinal_position;
    `);
    
    console.log('\nTraining room rent options table structure:');
    trainingResult.rows.forEach(row => {
      console.log(`${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });

    // Create training_days table for room and catering selections
    await pool.query(`
      CREATE TABLE IF NOT EXISTS training_days (
        id SERIAL PRIMARY KEY,
        invoice_id INTEGER NOT NULL,
        training_date DATE NOT NULL,
        room_rent_option_id INTEGER REFERENCES training_room_rent_options(id),
        lunch_catering_option_id INTEGER REFERENCES catering_options(id),
        dinner_catering_option_id INTEGER REFERENCES catering_options(id),
        hours_rented DECIMAL(4,2) DEFAULT 8.00,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_training_days_invoice_id ON training_days(invoice_id);
      CREATE INDEX IF NOT EXISTS idx_training_days_date ON training_days(training_date);
    `);

    console.log('Training days table created successfully!');
    
    // Check if table exists and show structure
    const trainingDaysResult = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'training_days' 
      ORDER BY ordinal_position;
    `);
    
    console.log('\nTraining days table structure:');
    trainingDaysResult.rows.forEach(row => {
      console.log(`${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });

  } catch (error) {
    console.error('Error setting up catering table:', error);
  } finally {
    await pool.end();
  }
}

setupCateringTable(); 