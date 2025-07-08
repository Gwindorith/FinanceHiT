import Database from 'better-sqlite3';
import path from 'path';

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
  training_dates: TrainingDate[]; // Array of {date, start_time, end_time}
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

class DatabaseManager {
  private db: Database.Database;

  constructor() {
    const dbPath = path.join(process.cwd(), 'data', 'training-invoicing.db');
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
  }

  // Get all training invoices
  getAllTrainingInvoices(): TrainingInvoice[] {
    const stmt = this.db.prepare(`
      SELECT * FROM training_invoices 
      ORDER BY created_at DESC
    `);
    return stmt.all().map(this.deserializeInvoice) as TrainingInvoice[];
  }

  // Get training invoice by ID
  getTrainingInvoiceById(id: number): TrainingInvoice | undefined {
    const stmt = this.db.prepare(`
      SELECT * FROM training_invoices WHERE id = ?
    `);
    const row = stmt.get(id);
    return row ? this.deserializeInvoice(row) : undefined;
  }

  // Create new training invoice
  createTrainingInvoice(invoice: Omit<TrainingInvoice, 'id' | 'created_at' | 'updated_at'>): TrainingInvoice {
    const stmt = this.db.prepare(`
      INSERT INTO training_invoices 
      (invoice_number, invoice_date, customer, training_name, training_dates, duration_days, trainer_costs, office_costs, margin_percentage, total_invoice_amount, trainer_availability_emailed, masterclass_planning_added, lms_updated, navara_event_agenda_updated, catering_ordered, trainer_invoice_received)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
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
      invoice.trainer_availability_emailed ? 1 : 0,
      invoice.masterclass_planning_added ? 1 : 0,
      invoice.lms_updated ? 1 : 0,
      invoice.navara_event_agenda_updated ? 1 : 0,
      invoice.catering_ordered ? 1 : 0,
      invoice.trainer_invoice_received ? 1 : 0
    );

    return this.getTrainingInvoiceById(result.lastInsertRowid as number)!;
  }

  // Update training invoice
  updateTrainingInvoice(id: number, invoice: Partial<TrainingInvoice>): TrainingInvoice | undefined {
    const current = this.getTrainingInvoiceById(id);
    if (!current) return undefined;

    const updatedInvoice = { ...current, ...invoice };
    
    const stmt = this.db.prepare(`
      UPDATE training_invoices 
      SET invoice_number = ?, invoice_date = ?, customer = ?, training_name = ?, training_dates = ?, duration_days = ?, 
          trainer_costs = ?, office_costs = ?, margin_percentage = ?, total_invoice_amount = ?,
          trainer_availability_emailed = ?, masterclass_planning_added = ?, lms_updated = ?, 
          navara_event_agenda_updated = ?, catering_ordered = ?, trainer_invoice_received = ?
      WHERE id = ?
    `);
    
    stmt.run(
      updatedInvoice.invoice_number ?? '',
      updatedInvoice.invoice_date ?? '',
      updatedInvoice.customer ?? '',
      updatedInvoice.training_name ?? '',
      JSON.stringify(updatedInvoice.training_dates ?? []),
      updatedInvoice.duration_days ?? 0,
      updatedInvoice.trainer_costs ?? 0,
      updatedInvoice.office_costs ?? 0,
      updatedInvoice.margin_percentage ?? 0,
      updatedInvoice.total_invoice_amount ?? 0,
      updatedInvoice.trainer_availability_emailed ? 1 : 0,
      updatedInvoice.masterclass_planning_added ? 1 : 0,
      updatedInvoice.lms_updated ? 1 : 0,
      updatedInvoice.navara_event_agenda_updated ? 1 : 0,
      updatedInvoice.catering_ordered ? 1 : 0,
      updatedInvoice.trainer_invoice_received ? 1 : 0,
      id
    );

    return this.getTrainingInvoiceById(id);
  }

  // Delete training invoice
  deleteTrainingInvoice(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM training_invoices WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // --- Participant CRUD ---
  getParticipantsByInvoice(training_invoice_id: number): Participant[] {
    const stmt = this.db.prepare('SELECT * FROM participants WHERE training_invoice_id = ? ORDER BY id ASC');
    return stmt.all(training_invoice_id) as Participant[];
  }

  addParticipant(participant: Omit<Participant, 'id'>): Participant {
    const stmt = this.db.prepare('INSERT INTO participants (training_invoice_id, name, email, company) VALUES (?, ?, ?, ?)');
    const result = stmt.run(
      participant.training_invoice_id,
      participant.name,
      participant.email,
      participant.company
    );
    return this.getParticipantById(result.lastInsertRowid as number)!;
  }

  getParticipantById(id: number): Participant | undefined {
    const stmt = this.db.prepare('SELECT * FROM participants WHERE id = ?');
    return stmt.get(id) as Participant | undefined;
  }

  updateParticipant(id: number, participant: Partial<Participant>): Participant | undefined {
    const current = this.getParticipantById(id);
    if (!current) return undefined;
    const updated = { ...current, ...participant };
    const stmt = this.db.prepare('UPDATE participants SET name = ?, email = ?, company = ? WHERE id = ?');
    stmt.run(updated.name, updated.email, updated.company, id);
    return this.getParticipantById(id);
  }

  deleteParticipant(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM participants WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // Calculate total invoice amount based on costs and margin
  calculateTotalAmount(trainerCosts: number, officeCosts: number, marginPercentage: number): number {
    const marginAmount = trainerCosts * (marginPercentage / 100);
    return trainerCosts + officeCosts + marginAmount;
  }

  // Helper to deserialize training_dates JSON
  private deserializeInvoice(row: any): TrainingInvoice {
    return {
      ...row,
      training_dates: JSON.parse(row.training_dates),
      trainer_availability_emailed: Boolean(row.trainer_availability_emailed),
      masterclass_planning_added: Boolean(row.masterclass_planning_added),
      lms_updated: Boolean(row.lms_updated),
      navara_event_agenda_updated: Boolean(row.navara_event_agenda_updated),
      catering_ordered: Boolean(row.catering_ordered),
      trainer_invoice_received: Boolean(row.trainer_invoice_received),
    };
  }

  // Close database connection
  close(): void {
    this.db.close();
  }
}

// Export singleton instance
let dbManager: DatabaseManager | null = null;

export function getDatabase(): DatabaseManager {
  if (!dbManager) {
    dbManager = new DatabaseManager();
  }
  return dbManager;
}

export function closeDatabase(): void {
  if (dbManager) {
    dbManager.close();
    dbManager = null;
  }
} 