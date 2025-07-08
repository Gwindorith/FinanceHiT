import { TrainingInvoice } from './database.pg';
import { InvoiceFilters } from '@/components/InvoiceFilters';
import { AdminFilters } from '@/components/AdminFilters';

export function filterInvoices(invoices: TrainingInvoice[], filters: InvoiceFilters): TrainingInvoice[] {
  return invoices.filter(invoice => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        invoice.training_name.toLowerCase().includes(searchLower) ||
        (invoice.invoice_number && invoice.invoice_number.toLowerCase().includes(searchLower)) ||
        invoice.customer.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
    }

    // Customer filter
    if (filters.customer && invoice.customer !== filters.customer) {
      return false;
    }

    // Date range filter
    if (filters.dateFrom || filters.dateTo) {
      const invoiceDate = invoice.invoice_date ? new Date(invoice.invoice_date) : null;
      
      if (filters.dateFrom && invoiceDate) {
        const fromDate = new Date(filters.dateFrom);
        if (invoiceDate < fromDate) return false;
      }
      
      if (filters.dateTo && invoiceDate) {
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999); // End of day
        if (invoiceDate > toDate) return false;
      }
    }

    // Amount range filter
    if (filters.minAmount) {
      const minAmount = parseFloat(filters.minAmount);
      if (invoice.total_invoice_amount < minAmount) return false;
    }

    if (filters.maxAmount) {
      const maxAmount = parseFloat(filters.maxAmount);
      if (invoice.total_invoice_amount > maxAmount) return false;
    }

    return true;
  });
}

export function filterAdminTasks(invoices: TrainingInvoice[], filters: AdminFilters): TrainingInvoice[] {
  return invoices.filter(invoice => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        invoice.training_name.toLowerCase().includes(searchLower) ||
        invoice.customer.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
    }

    // Customer filter
    if (filters.customer && invoice.customer !== filters.customer) {
      return false;
    }

    // Date range filter (using first training date)
    if (filters.dateFrom || filters.dateTo) {
      const firstTrainingDate = invoice.training_dates?.[0]?.date ? new Date(invoice.training_dates[0].date) : null;
      
      if (filters.dateFrom && firstTrainingDate) {
        const fromDate = new Date(filters.dateFrom);
        if (firstTrainingDate < fromDate) return false;
      }
      
      if (filters.dateTo && firstTrainingDate) {
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999); // End of day
        if (firstTrainingDate > toDate) return false;
      }
    }

    // Task status filter
    if (filters.taskStatus) {
      const allTasks = [
        invoice.trainer_availability_emailed,
        invoice.masterclass_planning_added,
        invoice.lms_updated,
        invoice.navara_event_agenda_updated,
        invoice.catering_ordered,
        invoice.trainer_invoice_received
      ];

      const completedTasks = allTasks.filter(task => task).length;
      const totalTasks = allTasks.length;

      if (filters.taskStatus === 'completed' && completedTasks < totalTasks) {
        return false;
      }
      
      if (filters.taskStatus === 'pending' && completedTasks === totalTasks) {
        return false;
      }
    }

    return true;
  });
}

export function getUniqueCustomers(invoices: TrainingInvoice[]): string[] {
  const customers = invoices.map(invoice => invoice.customer);
  return Array.from(new Set(customers)).sort();
} 