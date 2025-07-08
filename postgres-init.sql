-- Table: training_invoices
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

-- Table: participants
CREATE TABLE IF NOT EXISTS participants (
    id SERIAL PRIMARY KEY,
    training_invoice_id INTEGER NOT NULL REFERENCES training_invoices(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL
); 