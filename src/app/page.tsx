'use client';

import { useState, useEffect } from 'react';
import { TrainingInvoice } from '@/lib/database.pg';
import InvoiceList from '@/components/InvoiceList';
import AdminTasksTable from '@/components/AdminTasksTable';
import InvoiceForm from '@/components/InvoiceForm';
import InvoiceFilters, { InvoiceFilters as InvoiceFiltersType } from '@/components/InvoiceFilters';
import AdminFilters, { AdminFilters as AdminFiltersType } from '@/components/AdminFilters';
import { filterInvoices, filterAdminTasks, getUniqueCustomers } from '@/lib/filterUtils';
import { Plus, FileText, CheckSquare } from 'lucide-react';

export default function Home() {
  const [invoices, setInvoices] = useState<TrainingInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'invoices' | 'admin'>('invoices');
  const [invoiceFilters, setInvoiceFilters] = useState<InvoiceFiltersType>({
    search: '',
    customer: '',
    dateFrom: '',
    dateTo: '',
    minAmount: '',
    maxAmount: '',
  });
  const [adminFilters, setAdminFilters] = useState<AdminFiltersType>({
    search: '',
    customer: '',
    dateFrom: '',
    dateTo: '',
    taskStatus: '',
  });

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/training-invoices');
      const data = await response.json();
      
      if (data.success) {
        setInvoices(data.data);
      } else {
        setError(data.error || 'Failed to fetch invoices');
      }
    } catch (err) {
      setError('Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleInvoiceCreated = (newInvoice: TrainingInvoice) => {
    setInvoices([newInvoice, ...invoices]);
    setShowForm(false);
  };

  const handleInvoiceUpdated = (updatedInvoice: TrainingInvoice) => {
    setInvoices(invoices.map(invoice => 
      invoice.id === updatedInvoice.id ? updatedInvoice : invoice
    ));
  };

  const handleInvoiceDeleted = (id: number) => {
    setInvoices(invoices.filter(invoice => invoice.id !== id));
  };

  // Get unique customers for filter dropdowns
  const customers = getUniqueCustomers(invoices);

  // Filter data based on active tab
  const filteredInvoices = activeTab === 'invoices' 
    ? filterInvoices(invoices, invoiceFilters)
    : filterAdminTasks(invoices, adminFilters);

  const totalRevenue = invoices.reduce((sum, invoice) => sum + invoice.total_invoice_amount, 0);
  const totalTrainings = invoices.length;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Trainings</p>
              <p className="text-2xl font-bold text-gray-900">{totalTrainings}</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                €{totalRevenue.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Header with Tabs and Add Button */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-8">
          <h2 className="text-xl font-semibold text-gray-900">Training Management</h2>
          <div className="flex border-b border-gray-200">
            <button
              className={`px-4 py-2 -mb-px border-b-2 font-medium text-sm focus:outline-none ${
                activeTab === 'invoices' 
                  ? 'border-primary-600 text-primary-700' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('invoices')}
            >
              <FileText className="h-4 w-4 inline mr-2" />
              Invoices
            </button>
            <button
              className={`px-4 py-2 -mb-px border-b-2 font-medium text-sm focus:outline-none ${
                activeTab === 'admin' 
                  ? 'border-primary-600 text-primary-700' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('admin')}
            >
              <CheckSquare className="h-4 w-4 inline mr-2" />
              Administrative Tasks
            </button>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Training Invoice
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Invoice Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-[705px] mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add New Training Invoice</h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <InvoiceForm
              onSuccess={handleInvoiceCreated}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      {/* Content based on active tab */}
      {loading ? (
        <div className="card">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="ml-2 text-gray-600">Loading invoices...</span>
          </div>
        </div>
      ) : (
        <>
          {activeTab === 'invoices' && (
            <>
              <InvoiceFilters
                onFilterChange={setInvoiceFilters}
                customers={customers}
              />
              <InvoiceList
                invoices={filteredInvoices}
                onUpdate={handleInvoiceUpdated}
                onDelete={handleInvoiceDeleted}
              />
            </>
          )}
          {activeTab === 'admin' && (
            <>
              <AdminFilters
                onFilterChange={setAdminFilters}
                customers={customers}
              />
              <AdminTasksTable
                invoices={filteredInvoices}
                onUpdate={handleInvoiceUpdated}
              />
            </>
          )}
        </>
      )}
    </div>
  );
} 