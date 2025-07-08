'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TrainingInvoice } from '@/lib/database';
import ParticipantsTable from './ParticipantsTable';

// Form validation schema
const InvoiceFormSchema = z.object({
  invoice_number: z.string().optional(),
  invoice_date: z.string().optional(),
  customer: z.string().min(1, 'Customer is required'),
  training_name: z.string().min(1, 'Training name is required'),
  training_dates: z.array(z.object({
    date: z.string().min(1, 'Date is required'),
    start_time: z.string().min(1, 'Start time is required'),
    end_time: z.string().min(1, 'End time is required'),
  })).min(1, 'At least one date is required'),
  trainer_costs: z.number().min(0, 'Trainer costs must be non-negative'),
  office_costs: z.number().min(0, 'Office costs must be non-negative'),
  margin_percentage: z.number().min(0, 'Margin percentage must be non-negative'),
  total_invoice_amount: z.number().min(0, 'Total invoice amount must be non-negative'),
});

type FormData = {
  invoice_number: string;
  invoice_date: string;
  customer: string;
  training_name: string;
  training_dates: Array<{
    date: string;
    start_time: string;
    end_time: string;
  }>;
  trainer_costs: number;
  office_costs: number;
  margin_percentage: number;
  total_invoice_amount: number;
};

interface InvoiceFormProps {
  invoice?: TrainingInvoice;
  onSuccess: (invoice: TrainingInvoice) => void;
  onCancel: () => void;
}

export default function InvoiceForm({ invoice, onSuccess, onCancel }: InvoiceFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calculatedTotal, setCalculatedTotal] = useState(0);
  const [duration, setDuration] = useState(1);
  const [dateFields, setDateFields] = useState<Array<{date: string; start_time: string; end_time: string}>>(
    invoice ? invoice.training_dates : [{ date: '', start_time: '09:00', end_time: '17:00' }]
  );
  const [activeTab, setActiveTab] = useState<'details' | 'participants'>('details');

  // Debug: log dateFields
  console.log('Training Dates:', dateFields);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(InvoiceFormSchema),
    defaultValues: invoice ? {
      invoice_number: invoice.invoice_number ?? '',
      invoice_date: invoice.invoice_date ?? '',
      customer: invoice.customer,
      training_name: invoice.training_name,
      training_dates: invoice.training_dates,
      trainer_costs: invoice.trainer_costs,
      office_costs: invoice.office_costs,
      margin_percentage: invoice.margin_percentage,
      total_invoice_amount: invoice.total_invoice_amount,
    } : {
      invoice_number: '',
      invoice_date: '',
      customer: '',
      training_name: '',
      training_dates: [{ date: '', start_time: '09:00', end_time: '17:00' }],
      trainer_costs: 0,
      office_costs: 0,
      margin_percentage: 25,
      total_invoice_amount: 0,
    },
  });

  // Sync dateFields with form value
  useEffect(() => {
    setValue('training_dates', dateFields);
  }, [dateFields, setValue]);

  // Always ensure at least one date field is present
  useEffect(() => {
    if (dateFields.length === 0) {
      setDateFields([{ date: '', start_time: '09:00', end_time: '17:00' }]);
    }
  }, [dateFields]);

  // Watch form values for automatic calculations
  const watchedValues = watch(['training_dates', 'trainer_costs', 'office_costs', 'margin_percentage']);

  // Calculate duration and total amount when relevant fields change
  useEffect(() => {
    const [trainingDates, trainerCosts, officeCosts, marginPercentage] = watchedValues;
    if (Array.isArray(trainingDates)) {
      const uniqueDates = Array.from(new Set(trainingDates.filter(d => d.date).map(d => d.date)));
      setDuration(uniqueDates.length);
    }
    if (trainerCosts !== undefined && officeCosts !== undefined && marginPercentage !== undefined) {
      const marginAmount = trainerCosts * (marginPercentage / 100);
      const total = trainerCosts + officeCosts + marginAmount;
      setCalculatedTotal(total);
      setValue('total_invoice_amount', total);
    }
  }, [watchedValues, setValue]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const url = invoice 
        ? `/api/training-invoices/${invoice.id}` 
        : '/api/training-invoices';
      
      const method = invoice ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        onSuccess(result.data);
      } else {
        alert(result.error || 'Failed to save invoice');
      }
    } catch (error) {
      alert('Failed to save invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex border-b mb-4">
        <button
          className={`px-4 py-2 -mb-px border-b-2 font-medium focus:outline-none ${activeTab === 'details' ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-500'}`}
          onClick={() => setActiveTab('details')}
        >
          Invoice Details
        </button>
        {invoice?.id && (
          <button
            className={`px-4 py-2 -mb-px border-b-2 font-medium focus:outline-none ${activeTab === 'participants' ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-500'}`}
            onClick={() => setActiveTab('participants')}
          >
            Participants
          </button>
        )}
      </div>
      {activeTab === 'details' && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Invoice Number */}
            <div>
              <label htmlFor="invoice_number" className="block text-sm font-medium text-gray-700">
                Invoice Number
              </label>
              <input
                type="text"
                id="invoice_number"
                {...register('invoice_number')}
                className="input-field mt-1 text-black"
                placeholder="Enter invoice number (optional)"
              />
            </div>

            {/* Invoice Date */}
            <div>
              <label htmlFor="invoice_date" className="block text-sm font-medium text-gray-700">
                Invoice Date *
              </label>
              <input
                type="date"
                id="invoice_date"
                {...register('invoice_date')}
                className="input-field mt-1 text-black"
              />
              {errors.invoice_date && (
                <p className="mt-1 text-sm text-red-600">{errors.invoice_date.message}</p>
              )}
            </div>

            {/* Customer */}
            <div>
              <label htmlFor="customer" className="block text-sm font-medium text-gray-700">
                Customer *
              </label>
              <input
                type="text"
                id="customer"
                {...register('customer')}
                className="input-field mt-1 text-black"
                placeholder="Enter customer name"
              />
              {errors.customer && (
                <p className="mt-1 text-sm text-red-600">{errors.customer.message}</p>
              )}
            </div>

            {/* Training Name */}
            <div className="md:col-span-2">
              <label htmlFor="training_name" className="block text-sm font-medium text-gray-700">
                Training Name *
              </label>
              <input
                type="text"
                id="training_name"
                {...register('training_name')}
                className="input-field mt-1 text-black"
                placeholder="Enter training name"
              />
              {errors.training_name && (
                <p className="mt-1 text-sm text-red-600">{errors.training_name.message}</p>
              )}
            </div>

            {/* Training Dates */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Training Dates *
              </label>
              <div className="space-y-2">
                {dateFields.map((date, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <input
                      type="date"
                      value={date.date || ''}
                      onChange={e => {
                        const newDates = [...dateFields];
                        newDates[idx] = { ...newDates[idx], date: e.target.value };
                        setDateFields(newDates);
                      }}
                      className="input-field text-black"
                    />
                    <div className="flex items-center space-x-1">
                      <label className="text-xs text-gray-500 whitespace-nowrap">Start:</label>
                      <input
                        type="time"
                        value={date.start_time || ''}
                        onChange={e => {
                          const newDates = [...dateFields];
                          newDates[idx] = { ...newDates[idx], start_time: e.target.value };
                          setDateFields(newDates);
                        }}
                        className="input-field text-black w-28"
                        step="900"
                        required
                        pattern="[0-9]{2}:[0-9]{2}"
                        inputMode="numeric"
                        lang="en"
                      />
                    </div>
                    <div className="flex items-center space-x-1">
                      <label className="text-xs text-gray-500 whitespace-nowrap">End:</label>
                      <input
                        type="time"
                        value={date.end_time || ''}
                        onChange={e => {
                          const newDates = [...dateFields];
                          newDates[idx] = { ...newDates[idx], end_time: e.target.value };
                          setDateFields(newDates);
                        }}
                        className="input-field text-black w-28"
                        step="900"
                        required
                        pattern="[0-9]{2}:[0-9]{2}"
                        inputMode="numeric"
                        lang="en"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setDateFields(dateFields.filter((_, i) => i !== idx))}
                      className="btn-secondary px-2 py-1"
                      disabled={dateFields.length === 1}
                      title="Remove date"
                    >
                      –
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => setDateFields([...dateFields, { date: '', start_time: '09:00', end_time: '17:00' }])}
                  className="btn-primary text-sm px-3 py-1"
                  title="Add training date"
                >
                  + Add Training Date
                </button>
              </div>
              {errors.training_dates && (
                <p className="mt-1 text-sm text-red-600">
                  {Array.isArray(errors.training_dates)
                    ? errors.training_dates.map((e, i) => e?.message && <span key={i}>{e.message}<br /></span>)
                    : (errors.training_dates as any)?.message}
                </p>
              )}
            </div>

            {/* Duration Days */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Duration (Days)
              </label>
              <input
                type="number"
                value={duration}
                readOnly
                className="input-field mt-1 bg-gray-50 text-black"
              />
            </div>

            {/* Margin Percentage */}
            <div>
              <label htmlFor="margin_percentage" className="block text-sm font-medium text-gray-700">
                Margin Percentage (%) *
              </label>
              <input
                type="number"
                id="margin_percentage"
                {...register('margin_percentage', { valueAsNumber: true })}
                className="input-field mt-1 text-black"
                min="0"
                step="0.01"
                placeholder="25"
              />
              {errors.margin_percentage && (
                <p className="mt-1 text-sm text-red-600">{errors.margin_percentage.message}</p>
              )}
            </div>

            {/* Trainer Costs */}
            <div>
              <label htmlFor="trainer_costs" className="block text-sm font-medium text-gray-700">
                Trainer Costs (€) *
              </label>
              <input
                type="number"
                id="trainer_costs"
                {...register('trainer_costs', { valueAsNumber: true })}
                className="input-field mt-1 text-black"
                min="0"
                step="0.01"
                placeholder="0.00"
              />
              {errors.trainer_costs && (
                <p className="mt-1 text-sm text-red-600">{errors.trainer_costs.message}</p>
              )}
            </div>

            {/* Office Costs */}
            <div>
              <label htmlFor="office_costs" className="block text-sm font-medium text-gray-700">
                Office Costs (€) *
              </label>
              <input
                type="number"
                id="office_costs"
                {...register('office_costs', { valueAsNumber: true })}
                className="input-field mt-1 text-black"
                min="0"
                step="0.01"
                placeholder="0.00"
              />
              {errors.office_costs && (
                <p className="mt-1 text-sm text-red-600">{errors.office_costs.message}</p>
              )}
            </div>

            {/* Total Invoice Amount */}
            <div className="md:col-span-2">
              <label htmlFor="total_invoice_amount" className="block text-sm font-medium text-gray-700">
                Total Invoice Amount (€) *
              </label>
              <input
                type="number"
                id="total_invoice_amount"
                {...register('total_invoice_amount', { valueAsNumber: true })}
                className="input-field mt-1 bg-gray-50 text-black"
                min="0"
                step="0.01"
                placeholder="0.00"
                readOnly
              />
              <p className="mt-1 text-sm text-gray-500">
                Calculated automatically based on costs and margin
              </p>
              {errors.total_invoice_amount && (
                <p className="mt-1 text-sm text-red-600">{errors.total_invoice_amount.message}</p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : (invoice ? 'Update Invoice' : 'Create Invoice')}
            </button>
          </div>
        </form>
      )}
      {activeTab === 'participants' && invoice?.id && (
        <ParticipantsTable trainingInvoiceId={invoice.id} />
      )}
    </div>
  );
} 