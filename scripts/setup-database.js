const Database = require('better-sqlite3');
const path = require('path');

// Create database directory if it doesn't exist
const dbPath = path.join(__dirname, '..', 'data', 'training-invoicing.db');

// Ensure data directory exists
const fs = require('fs');
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize database
const db = new Database(dbPath);

db.exec('DROP TABLE IF EXISTS training_invoices');

// Create training_invoices table with new fields
const createTableSQL = `
  CREATE TABLE IF NOT EXISTS training_invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_number TEXT UNIQUE,
    invoice_date TEXT,
    customer TEXT NOT NULL,
    training_name TEXT NOT NULL,
    training_dates TEXT NOT NULL, -- JSON array of dates
    duration_days INTEGER NOT NULL,
    trainer_costs DECIMAL(10,2) NOT NULL,
    office_costs DECIMAL(10,2) NOT NULL,
    margin_percentage DECIMAL(5,2) NOT NULL,
    total_invoice_amount DECIMAL(10,2) NOT NULL,
    trainer_availability_emailed BOOLEAN DEFAULT 0,
    masterclass_planning_added BOOLEAN DEFAULT 0,
    lms_updated BOOLEAN DEFAULT 0,
    navara_event_agenda_updated BOOLEAN DEFAULT 0,
    catering_ordered BOOLEAN DEFAULT 0,
    trainer_invoice_received BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`;

db.exec(createTableSQL);

// Create trigger to update updated_at timestamp
const createTriggerSQL = `
  CREATE TRIGGER IF NOT EXISTS update_training_invoices_updated_at
  AFTER UPDATE ON training_invoices
  FOR EACH ROW
  BEGIN
    UPDATE training_invoices SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END
`;

db.exec(createTriggerSQL);

// Create participants table
const createParticipantsTableSQL = `
  CREATE TABLE IF NOT EXISTS participants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    training_invoice_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT NOT NULL,
    FOREIGN KEY (training_invoice_id) REFERENCES training_invoices(id) ON DELETE CASCADE
  )
`;
db.exec(createParticipantsTableSQL);

console.log('Database initialized successfully!');
console.log('Database location:', dbPath);

// Insert some sample data
const sampleData = [
  {
    invoice_number: '2024-001',
    invoice_date: '2024-01-10',
    customer: 'Acme Corp',
    training_name: 'React Fundamentals',
    training_dates: JSON.stringify([
      { date: '2024-01-15', start_time: '09:00', end_time: '17:00' },
      { date: '2024-01-16', start_time: '09:00', end_time: '17:00' },
      { date: '2024-01-17', start_time: '09:00', end_time: '16:00' },
    ]),
    duration_days: 3,
    trainer_costs: 1500.00,
    office_costs: 300.00,
    margin_percentage: 25.00,
    total_invoice_amount: 2250.00,
    trainer_availability_emailed: 1,
    masterclass_planning_added: 1,
    lms_updated: 0,
    navara_event_agenda_updated: 1,
    catering_ordered: 0,
    trainer_invoice_received: 0
  },
  {
    invoice_number: '2024-002',
    invoice_date: '',
    customer: 'Beta Solutions',
    training_name: 'Advanced TypeScript',
    training_dates: JSON.stringify([
      { date: '2024-02-01', start_time: '10:00', end_time: '17:00' },
      { date: '2024-02-02', start_time: '10:00', end_time: '16:00' },
    ]),
    duration_days: 2,
    trainer_costs: 1200.00,
    office_costs: 200.00,
    margin_percentage: 30.00,
    total_invoice_amount: 1820.00,
    trainer_availability_emailed: 0,
    masterclass_planning_added: 0,
    lms_updated: 0,
    navara_event_agenda_updated: 0,
    catering_ordered: 0,
    trainer_invoice_received: 0
  }
];

const insertSQL = `
  INSERT INTO training_invoices 
  (invoice_number, invoice_date, customer, training_name, training_dates, duration_days, trainer_costs, office_costs, margin_percentage, total_invoice_amount, trainer_availability_emailed, masterclass_planning_added, lms_updated, navara_event_agenda_updated, catering_ordered, trainer_invoice_received)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

const insertStmt = db.prepare(insertSQL);

// Check if table is empty before inserting sample data
const countResult = db.prepare('SELECT COUNT(*) as count FROM training_invoices').get();
if (countResult.count === 0) {
  sampleData.forEach(data => {
    insertStmt.run(
      data.invoice_number,
      data.invoice_date,
      data.customer,
      data.training_name,
      data.training_dates,
      data.duration_days,
      data.trainer_costs,
      data.office_costs,
      data.margin_percentage,
      data.total_invoice_amount,
      data.trainer_availability_emailed,
      data.masterclass_planning_added,
      data.lms_updated,
      data.navara_event_agenda_updated,
      data.catering_ordered,
      data.trainer_invoice_received
    );
  });
  console.log('Sample data inserted successfully!');
} else {
  console.log('Database already contains data, skipping sample data insertion.');
}

// Insert some sample participants
const sampleParticipants = [
  { training_invoice_id: 1, name: 'Alice Janssen', email: 'alice@acme.com', company: 'Acme Corp' },
  { training_invoice_id: 1, name: 'Bob de Vries', email: 'bob@acme.com', company: 'Acme Corp' },
  { training_invoice_id: 2, name: 'Carla Bakker', email: 'carla@beta.com', company: 'Beta Solutions' },
];
const insertParticipantSQL = `
  INSERT INTO participants (training_invoice_id, name, email, company)
  VALUES (?, ?, ?, ?)
`;
const insertParticipantStmt = db.prepare(insertParticipantSQL);
sampleParticipants.forEach(p => {
  insertParticipantStmt.run(p.training_invoice_id, p.name, p.email, p.company);
});

db.close(); 