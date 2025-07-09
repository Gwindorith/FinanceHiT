import { Pool } from 'pg';

export interface TrainingDate {
  date: string;
  start_time: string;
  end_time: string;
}

export interface TrainingInvoice {
  id?: number;
  invoice_number?: string;
  invoice_date?: string;
  customer: string;
  training_name: string;
  training_dates: TrainingDate[];
  duration_days: number;
  trainer_costs: number;
  office_costs: number;
  margin_percentage: number;
  total_invoice_amount: number;
  trainer_availability_emailed?: boolean;
  masterclass_planning_added?: boolean;
  lms_updated?: boolean;
  navara_event_agenda_updated?: boolean;
  catering_ordered?: boolean;
  trainer_invoice_received?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Participant {
  id?: number;
  training_invoice_id: number;
  name: string;
  email: string;
  company: string;
}

export interface User {
  id?: number;
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'user' | 'manager';
  name: string;
  created_at?: string;
  updated_at?: string;
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false },
});

export async function getAllTrainingInvoices(): Promise<TrainingInvoice[]> {
  const res = await pool.query('SELECT * FROM training_invoices ORDER BY created_at DESC');
  return res.rows.map(deserializeInvoice);
}

export async function getTrainingInvoiceById(id: number): Promise<TrainingInvoice | undefined> {
  const res = await pool.query('SELECT * FROM training_invoices WHERE id = $1', [id]);
  return res.rows[0] ? deserializeInvoice(res.rows[0]) : undefined;
}

export async function createTrainingInvoice(invoice: Omit<TrainingInvoice, 'id' | 'created_at' | 'updated_at'>): Promise<TrainingInvoice> {
  const res = await pool.query(
    `INSERT INTO training_invoices 
      (invoice_number, invoice_date, customer, training_name, training_dates, duration_days, trainer_costs, office_costs, margin_percentage, total_invoice_amount, trainer_availability_emailed, masterclass_planning_added, lms_updated, navara_event_agenda_updated, catering_ordered, trainer_invoice_received)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
      RETURNING *`,
    [
      invoice.invoice_number ?? '',
      invoice.invoice_date ?? '',
      invoice.customer,
      invoice.training_name,
      JSON.stringify(invoice.training_dates),
      invoice.duration_days,
      invoice.trainer_costs,
      invoice.office_costs,
      invoice.margin_percentage,
      invoice.total_invoice_amount,
      invoice.trainer_availability_emailed ?? false,
      invoice.masterclass_planning_added ?? false,
      invoice.lms_updated ?? false,
      invoice.navara_event_agenda_updated ?? false,
      invoice.catering_ordered ?? false,
      invoice.trainer_invoice_received ?? false
    ]
  );
  return deserializeInvoice(res.rows[0]);
}

export async function updateTrainingInvoice(id: number, invoice: Partial<TrainingInvoice>): Promise<TrainingInvoice | undefined> {
  const current = await getTrainingInvoiceById(id);
  if (!current) return undefined;
  const updated = { ...current, ...invoice };
  const res = await pool.query(
    `UPDATE training_invoices SET
      invoice_number = $1,
      invoice_date = $2,
      customer = $3,
      training_name = $4,
      training_dates = $5,
      duration_days = $6,
      trainer_costs = $7,
      office_costs = $8,
      margin_percentage = $9,
      total_invoice_amount = $10,
      trainer_availability_emailed = $11,
      masterclass_planning_added = $12,
      lms_updated = $13,
      navara_event_agenda_updated = $14,
      catering_ordered = $15,
      trainer_invoice_received = $16,
      updated_at = NOW()
    WHERE id = $17 RETURNING *`,
    [
      updated.invoice_number ?? '',
      updated.invoice_date ?? '',
      updated.customer,
      updated.training_name,
      JSON.stringify(updated.training_dates),
      updated.duration_days,
      updated.trainer_costs,
      updated.office_costs,
      updated.margin_percentage,
      updated.total_invoice_amount,
      updated.trainer_availability_emailed ?? false,
      updated.masterclass_planning_added ?? false,
      updated.lms_updated ?? false,
      updated.navara_event_agenda_updated ?? false,
      updated.catering_ordered ?? false,
      updated.trainer_invoice_received ?? false,
      id
    ]
  );
  return deserializeInvoice(res.rows[0]);
}

export async function deleteTrainingInvoice(id: number): Promise<boolean> {
  const res = await pool.query('DELETE FROM training_invoices WHERE id = $1', [id]);
  return (res.rowCount ?? 0) > 0;
}

export async function getParticipantsByInvoice(training_invoice_id: number): Promise<Participant[]> {
  const res = await pool.query('SELECT * FROM participants WHERE training_invoice_id = $1 ORDER BY id ASC', [training_invoice_id]);
  return res.rows;
}

export async function addParticipant(participant: Omit<Participant, 'id'>): Promise<Participant> {
  const res = await pool.query(
    'INSERT INTO participants (training_invoice_id, name, email, company) VALUES ($1, $2, $3, $4) RETURNING *',
    [participant.training_invoice_id, participant.name, participant.email, participant.company]
  );
  return res.rows[0];
}

export async function updateParticipant(id: number, participant: Partial<Participant>): Promise<Participant | undefined> {
  const current = await getParticipantById(id);
  if (!current) return undefined;
  const updated = { ...current, ...participant };
  const res = await pool.query(
    'UPDATE participants SET name = $1, email = $2, company = $3 WHERE id = $4 RETURNING *',
    [updated.name, updated.email, updated.company, id]
  );
  return res.rows[0];
}

export async function getParticipantById(id: number): Promise<Participant | undefined> {
  const res = await pool.query('SELECT * FROM participants WHERE id = $1', [id]);
  return res.rows[0];
}

export async function deleteParticipant(id: number): Promise<boolean> {
  const res = await pool.query('DELETE FROM participants WHERE id = $1', [id]);
  return (res.rowCount ?? 0) > 0;
}

export function calculateTotalAmount(trainerCosts: number, officeCosts: number, marginPercentage: number): number {
  const marginAmount = trainerCosts * (marginPercentage / 100);
  return trainerCosts + officeCosts + marginAmount;
}

function deserializeInvoice(row: any): TrainingInvoice {
  return {
    ...row,
    training_dates: typeof row.training_dates === 'string' ? JSON.parse(row.training_dates) : row.training_dates,
    trainer_costs: Number(row.trainer_costs),
    office_costs: Number(row.office_costs),
    margin_percentage: Number(row.margin_percentage),
    total_invoice_amount: Number(row.total_invoice_amount),
    trainer_availability_emailed: Boolean(row.trainer_availability_emailed),
    masterclass_planning_added: Boolean(row.masterclass_planning_added),
    lms_updated: Boolean(row.lms_updated),
    navara_event_agenda_updated: Boolean(row.navara_event_agenda_updated),
    catering_ordered: Boolean(row.catering_ordered),
    trainer_invoice_received: Boolean(row.trainer_invoice_received),
  };
}

// User management functions
export async function getAllUsers(): Promise<Omit<User, 'password'>[]> {
  const res = await pool.query('SELECT id, username, email, role, name, created_at, updated_at FROM users ORDER BY created_at DESC');
  return res.rows;
}

export async function getUserById(id: number): Promise<Omit<User, 'password'> | undefined> {
  const res = await pool.query('SELECT id, username, email, role, name, created_at, updated_at FROM users WHERE id = $1', [id]);
  return res.rows[0];
}

export async function getUserByUsername(username: string): Promise<User | undefined> {
  const res = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  return res.rows[0];
}

export async function createUser(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<Omit<User, 'password'>> {
  const res = await pool.query(
    'INSERT INTO users (username, email, password, role, name) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email, role, name, created_at, updated_at',
    [user.username, user.email, user.password, user.role, user.name]
  );
  return res.rows[0];
}

export async function updateUser(id: number, user: Partial<Omit<User, 'id' | 'password' | 'created_at' | 'updated_at'>>): Promise<Omit<User, 'password'> | undefined> {
  const current = await getUserById(id);
  if (!current) return undefined;

  const fields = [];
  const values = [];
  let paramCount = 1;

  if (user.username !== undefined) {
    fields.push(`username = $${paramCount++}`);
    values.push(user.username);
  }
  if (user.email !== undefined) {
    fields.push(`email = $${paramCount++}`);
    values.push(user.email);
  }
  if (user.role !== undefined) {
    fields.push(`role = $${paramCount++}`);
    values.push(user.role);
  }
  if (user.name !== undefined) {
    fields.push(`name = $${paramCount++}`);
    values.push(user.name);
  }

  if (fields.length === 0) return current;

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const res = await pool.query(
    `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING id, username, email, role, name, created_at, updated_at`,
    values
  );
  return res.rows[0];
}

export async function updateUserPassword(id: number, password: string): Promise<boolean> {
  const res = await pool.query('UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2', [password, id]);
  return (res.rowCount ?? 0) > 0;
}

export async function deleteUser(id: number): Promise<boolean> {
  const res = await pool.query('DELETE FROM users WHERE id = $1', [id]);
  return (res.rowCount ?? 0) > 0;
}

export async function initializeDefaultAdmin(): Promise<void> {
  // Check if admin user already exists
  const existingAdmin = await getUserByUsername('admin');
  if (existingAdmin) return;

  // Create default admin user
  const bcrypt = require('bcrypt');
  const hashedPassword = await bcrypt.hash('admin', 10);
  
  await createUser({
    username: 'admin',
    email: 'admin@example.com',
    password: hashedPassword,
    role: 'admin',
    name: 'Administrator',
  });
} 