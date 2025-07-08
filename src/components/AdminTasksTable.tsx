'use client';

import { useState } from 'react';
import { TrainingInvoice } from '@/lib/database.pg';
import { format } from 'date-fns';
import { CheckSquare, Square, Calendar, FileText } from 'lucide-react';

interface AdminTasksTableProps {
  invoices: TrainingInvoice[];
  onUpdate: (invoice: TrainingInvoice) => void;
}

export default function AdminTasksTable({ invoices, onUpdate }: AdminTasksTableProps) {
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const handleCheckboxChange = async (invoiceId: number, field: keyof TrainingInvoice, value: boolean) => {
    setUpdatingId(invoiceId);
    try {
      const response = await fetch(`/api/training-invoices/${invoiceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [field]: value }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          onUpdate(data.data);
        }
      }
    } catch (error) {
      console.error('Failed to update task:', error);
    } finally {
      setUpdatingId(null);
    }
  };

  const getFirstTrainingDate = (trainingDates: any[]) => {
    if (!trainingDates || trainingDates.length === 0) return '-';
    const firstDate = trainingDates[0];
    return firstDate.date ? format(new Date(firstDate.date), 'dd-MM-yyyy') : '-';
  };

  if (invoices.length === 0) {
    return (
      <div className="card">
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No training invoices</h3>
          <p className="mt-1 text-sm text-gray-500">
            Create your first training invoice to see administrative tasks.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-0 flex-1">
                Training
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                Date
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                Trainer Email
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                Masterclass
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                LMS
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                Navara
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                Catering
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                Trainer Invoice
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-gray-50">
                <td className="px-3 py-4">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {invoice.training_name}
                  </div>
                  <div className="text-sm text-gray-500 truncate">
                    {invoice.customer}
                  </div>
                </td>
                <td className="px-3 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                    {getFirstTrainingDate(invoice.training_dates)}
                  </div>
                </td>
                <td className="px-3 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleCheckboxChange(invoice.id!, 'trainer_availability_emailed', !invoice.trainer_availability_emailed)}
                    disabled={updatingId === invoice.id}
                    className="flex items-center justify-center text-sm text-gray-900 hover:text-primary-600 disabled:opacity-50"
                  >
                    {invoice.trainer_availability_emailed ? (
                      <CheckSquare className="h-5 w-5 text-green-600" />
                    ) : (
                      <Square className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </td>
                <td className="px-3 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleCheckboxChange(invoice.id!, 'masterclass_planning_added', !invoice.masterclass_planning_added)}
                    disabled={updatingId === invoice.id}
                    className="flex items-center justify-center text-sm text-gray-900 hover:text-primary-600 disabled:opacity-50"
                  >
                    {invoice.masterclass_planning_added ? (
                      <CheckSquare className="h-5 w-5 text-green-600" />
                    ) : (
                      <Square className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </td>
                <td className="px-3 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleCheckboxChange(invoice.id!, 'lms_updated', !invoice.lms_updated)}
                    disabled={updatingId === invoice.id}
                    className="flex items-center justify-center text-sm text-gray-900 hover:text-primary-600 disabled:opacity-50"
                  >
                    {invoice.lms_updated ? (
                      <CheckSquare className="h-5 w-5 text-green-600" />
                    ) : (
                      <Square className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </td>
                <td className="px-3 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleCheckboxChange(invoice.id!, 'navara_event_agenda_updated', !invoice.navara_event_agenda_updated)}
                    disabled={updatingId === invoice.id}
                    className="flex items-center justify-center text-sm text-gray-900 hover:text-primary-600 disabled:opacity-50"
                  >
                    {invoice.navara_event_agenda_updated ? (
                      <CheckSquare className="h-5 w-5 text-green-600" />
                    ) : (
                      <Square className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </td>
                <td className="px-3 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleCheckboxChange(invoice.id!, 'catering_ordered', !invoice.catering_ordered)}
                    disabled={updatingId === invoice.id}
                    className="flex items-center justify-center text-sm text-gray-900 hover:text-primary-600 disabled:opacity-50"
                  >
                    {invoice.catering_ordered ? (
                      <CheckSquare className="h-5 w-5 text-green-600" />
                    ) : (
                      <Square className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </td>
                <td className="px-3 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleCheckboxChange(invoice.id!, 'trainer_invoice_received', !invoice.trainer_invoice_received)}
                    disabled={updatingId === invoice.id}
                    className="flex items-center justify-center text-sm text-gray-900 hover:text-primary-600 disabled:opacity-50"
                  >
                    {invoice.trainer_invoice_received ? (
                      <CheckSquare className="h-5 w-5 text-green-600" />
                    ) : (
                      <Square className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 