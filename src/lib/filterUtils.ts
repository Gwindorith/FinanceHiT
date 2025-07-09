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

    // Month filter
    if (filters.months && filters.months.length > 0) {
      const invoiceDate = invoice.invoice_date ? new Date(invoice.invoice_date) : null;
      if (!invoiceDate) return false;
      
      const invoiceMonthKey = `${invoiceDate.getFullYear()}-${String(invoiceDate.getMonth() + 1).padStart(2, '0')}`;
      if (!filters.months.includes(invoiceMonthKey)) return false;
    }

    // Year filter
    if (filters.years && filters.years.length > 0) {
      const invoiceDate = invoice.invoice_date ? new Date(invoice.invoice_date) : null;
      if (!invoiceDate) return false;
      
      if (!filters.years.includes(invoiceDate.getFullYear())) return false;
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

    // Month filter (using first training date)
    if (filters.months && filters.months.length > 0) {
      const firstTrainingDate = invoice.training_dates?.[0]?.date ? new Date(invoice.training_dates[0].date) : null;
      if (!firstTrainingDate) return false;
      
      const trainingMonthKey = `${firstTrainingDate.getFullYear()}-${String(firstTrainingDate.getMonth() + 1).padStart(2, '0')}`;
      if (!filters.months.includes(trainingMonthKey)) return false;
    }

    // Year filter (using first training date)
    if (filters.years && filters.years.length > 0) {
      const firstTrainingDate = invoice.training_dates?.[0]?.date ? new Date(invoice.training_dates[0].date) : null;
      if (!firstTrainingDate) return false;
      
      if (!filters.years.includes(firstTrainingDate.getFullYear())) return false;
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

export function getAvailableMonths(invoices: TrainingInvoice[]): { value: string; label: string }[] {
  const months = new Set<string>();
  
  invoices.forEach(invoice => {
    // Check invoice date
    if (invoice.invoice_date) {
      const date = new Date(invoice.invoice_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months.add(monthKey);
    }
    
    // Check training dates
    if (invoice.training_dates && invoice.training_dates.length > 0) {
      invoice.training_dates.forEach(trainingDate => {
        if (trainingDate.date) {
          const date = new Date(trainingDate.date);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          months.add(monthKey);
        }
      });
    }
  });
  
  return Array.from(months)
    .sort()
    .map(monthKey => {
      const [year, month] = monthKey.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return {
        value: monthKey,
        label: date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
      };
    });
}

export function getAvailableYears(invoices: TrainingInvoice[]): number[] {
  const years = new Set<number>();
  
  invoices.forEach(invoice => {
    // Check invoice date
    if (invoice.invoice_date) {
      const date = new Date(invoice.invoice_date);
      years.add(date.getFullYear());
    }
    
    // Check training dates
    if (invoice.training_dates && invoice.training_dates.length > 0) {
      invoice.training_dates.forEach(trainingDate => {
        if (trainingDate.date) {
          const date = new Date(trainingDate.date);
          years.add(date.getFullYear());
        }
      });
    }
  });
  
  return Array.from(years).sort((a, b) => b - a); // Sort descending
} 