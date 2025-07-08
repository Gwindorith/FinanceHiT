'use client';

import { useState } from 'react';
import { TrainingInvoice } from '@/lib/database';
import { format } from 'date-fns';
import { Edit, Trash2, Calendar, Euro, Users } from 'lucide-react';
import InvoiceForm from './InvoiceForm';

interface InvoiceListProps {
  invoices: TrainingInvoice[];
  onUpdate: (invoice: TrainingInvoice) => void;
  onDelete: (id: number) => void;
}

export default function InvoiceList({ invoices, onUpdate, onDelete }: InvoiceListProps) {
  const [editingInvoice, setEditingInvoice] = useState<TrainingInvoice | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleEdit = (invoice: TrainingInvoice) => {
    setEditingInvoice(invoice);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this training invoice?')) {
      return;
    }

    try {
      setDeletingId(id);
      const response = await fetch(`/api/training-invoices/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onDelete(id);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete invoice');
      }
    } catch (error) {
      alert('Failed to delete invoice');
    } finally {
      setDeletingId(null);
    }
  };

  const handleUpdateSuccess = (updatedInvoice: TrainingInvoice) => {
    onUpdate(updatedInvoice);
    setEditingInvoice(null);
  };

  if (invoices.length === 0) {
    return (
      <div className="card">
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No training invoices</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first training invoice.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  Invoice #
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  Date
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-0 flex-1">
                  Training
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                  Days
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                  Costs
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                  Margin
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                  Total
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-0 flex-1">
                  Customer
                </th>
                <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-3 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {invoice.invoice_number || <span className="text-gray-400 italic">-</span>}
                    </div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {invoice.invoice_date ? format(new Date(invoice.invoice_date), 'dd-MM-yyyy') : '-'}
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {invoice.training_name}
                    </div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Users className="h-4 w-4 mr-1 text-gray-400" />
                      {invoice.duration_days}
                    </div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div>€{invoice.trainer_costs.toLocaleString('nl-NL', { minimumFractionDigits: 0 })}</div>
                      <div>€{invoice.office_costs.toLocaleString('nl-NL', { minimumFractionDigits: 0 })}</div>
                    </div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {invoice.margin_percentage}%
                    </div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm font-medium text-gray-900">
                      <Euro className="h-4 w-4 mr-1 text-green-600" />
                      €{invoice.total_invoice_amount.toLocaleString('nl-NL', { minimumFractionDigits: 0 })}
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <div className="text-sm text-gray-900 truncate">
                      {invoice.customer}
                    </div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-1">
                      <button
                        onClick={() => handleEdit(invoice)}
                        className="text-primary-600 hover:text-primary-900 p-1"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(invoice.id!)}
                        disabled={deletingId === invoice.id}
                        className="text-red-600 hover:text-red-900 p-1 disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-[705px] mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Edit Training Invoice</h3>
              <button
                onClick={() => setEditingInvoice(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <InvoiceForm
              invoice={editingInvoice}
              onSuccess={handleUpdateSuccess}
              onCancel={() => setEditingInvoice(null)}
            />
          </div>
        </div>
      )}
    </>
  );
} 