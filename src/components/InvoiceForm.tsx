'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TrainingInvoice, CateringOption, TrainingRoomRentOption } from '@/lib/database.pg';
import ParticipantsTable from './ParticipantsTable';
import TrainingDayOptionsModal from './TrainingDayOptionsModal';

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
    room_rent_option_id: z.number().nullable().optional(),
    lunch_catering_option_id: z.number().nullable().optional(),
    dinner_catering_option_id: z.number().nullable().optional(),
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
    room_rent_option_id: number | null;
    lunch_catering_option_id: number | null;
    dinner_catering_option_id: number | null;
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
  const [calculatedOfficeCosts, setCalculatedOfficeCosts] = useState(0);
  const [duration, setDuration] = useState(1);
  const [participantsCount, setParticipantsCount] = useState(0);
  const [cateringOptions, setCateringOptions] = useState<CateringOption[]>([]);
  const [roomRentOptions, setRoomRentOptions] = useState<TrainingRoomRentOption[]>([]);
  const [dateFields, setDateFields] = useState<Array<{
    date: string;
    start_time: string;
    end_time: string;
    room_rent_option_id: number | null;
    lunch_catering_option_id: number | null;
    dinner_catering_option_id: number | null;
  }>>(
    invoice ? invoice.training_dates.map(d => ({
      date: d.date,
      start_time: d.start_time,
      end_time: d.end_time,
      room_rent_option_id: d.room_rent_option_id ?? null,
      lunch_catering_option_id: d.lunch_catering_option_id ?? null,
      dinner_catering_option_id: d.dinner_catering_option_id ?? null,
    })) : [{ date: '', start_time: '09:00', end_time: '17:00', room_rent_option_id: null, lunch_catering_option_id: null, dinner_catering_option_id: null }]
  );
  const [activeTab, setActiveTab] = useState<'details' | 'participants'>('details');
  const [optionsModalOpen, setOptionsModalOpen] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);

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
      training_dates: [{ date: '', start_time: '09:00', end_time: '17:00', room_rent_option_id: null, lunch_catering_option_id: null, dinner_catering_option_id: null }],
      trainer_costs: 0,
      office_costs: 0,
      margin_percentage: 25,
      total_invoice_amount: 0,
    },
  });

  // Fetch options data
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [cateringResponse, roomResponse] = await Promise.all([
          fetch('/api/catering-options'),
          fetch('/api/training-room-rent-options')
        ]);
        
        const cateringData = await cateringResponse.json();
        const roomData = await roomResponse.json();
        
        if (cateringData.success) setCateringOptions(cateringData.data);
        if (roomData.success) setRoomRentOptions(roomData.data);
      } catch (error) {
        console.error('Failed to fetch options:', error);
      }
    };
    
    fetchOptions();
  }, []);

  // Fetch participants count if editing existing invoice
  useEffect(() => {
    if (invoice?.id) {
      const fetchParticipants = async () => {
        try {
          const response = await fetch(`/api/participants?training_invoice_id=${invoice.id}`);
          const data = await response.json();
          if (data.success) {
            setParticipantsCount(data.data.length);
          }
        } catch (error) {
          console.error('Failed to fetch participants:', error);
        }
      };
      fetchParticipants();
    }
  }, [invoice?.id]);

  // Sync dateFields with form value
  useEffect(() => {
    setValue('training_dates', dateFields);
  }, [dateFields, setValue]);

  // Always ensure at least one date field is present
  useEffect(() => {
    if (dateFields.length === 0) {
      setDateFields([{ date: '', start_time: '09:00', end_time: '17:00', room_rent_option_id: null, lunch_catering_option_id: null, dinner_catering_option_id: null }]);
    }
  }, [dateFields]);

  // Calculate office costs based on room rent and catering
  const calculateOfficeCosts = () => {
    let totalOfficeCosts = 0;

    dateFields.forEach(dateField => {
      // Calculate room rent costs
      if (dateField.room_rent_option_id) {
        const roomOption = roomRentOptions.find(r => r.id === dateField.room_rent_option_id);
        if (roomOption) {
          const startTime = new Date(`2000-01-01T${dateField.start_time}`);
          const endTime = new Date(`2000-01-01T${dateField.end_time}`);
          const hoursDiff = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
          totalOfficeCosts += hoursDiff * roomOption.rent_per_hour;
        }
      }

      // Calculate catering costs
      if (dateField.lunch_catering_option_id) {
        const lunchOption = cateringOptions.find(c => c.id === dateField.lunch_catering_option_id);
        if (lunchOption) {
          totalOfficeCosts += participantsCount * lunchOption.lunch_price_per_participant;
        }
      }

      if (dateField.dinner_catering_option_id) {
        const dinnerOption = cateringOptions.find(c => c.id === dateField.dinner_catering_option_id);
        if (dinnerOption) {
          totalOfficeCosts += participantsCount * dinnerOption.dinner_price_per_participant;
        }
      }
    });

    return totalOfficeCosts;
  };

  // Watch form values for automatic calculations
  const watchedValues = watch(['training_dates', 'trainer_costs', 'margin_percentage']);

  // Calculate duration, office costs and total amount when relevant fields change
  useEffect(() => {
    const [trainingDates, trainerCosts, marginPercentage] = watchedValues;
    if (Array.isArray(trainingDates)) {
      const uniqueDates = Array.from(new Set(trainingDates.filter(d => d.date).map(d => d.date)));
      setDuration(uniqueDates.length);
    }
    
    // Calculate office costs
    const officeCosts = calculateOfficeCosts();
    setCalculatedOfficeCosts(officeCosts);
    setValue('office_costs', officeCosts);
    
    if (trainerCosts !== undefined && marginPercentage !== undefined) {
      const marginAmount = trainerCosts * (marginPercentage / 100);
      const total = trainerCosts + officeCosts + marginAmount;
      setCalculatedTotal(total);
      setValue('total_invoice_amount', total);
    }
  }, [watchedValues, setValue, dateFields, participantsCount, cateringOptions, roomRentOptions]);

  // Handle participants count change from ParticipantsTable
  const handleParticipantsChange = (count: number) => {
    setParticipantsCount(count);
    // Trigger recalculation immediately
    const officeCosts = calculateOfficeCosts();
    setCalculatedOfficeCosts(officeCosts);
    setValue('office_costs', officeCosts);
    
    const trainerCosts = watch('trainer_costs');
    const marginPercentage = watch('margin_percentage');
    
    if (trainerCosts !== undefined && marginPercentage !== undefined) {
      const marginAmount = trainerCosts * (marginPercentage / 100);
      const total = trainerCosts + officeCosts + marginAmount;
      setCalculatedTotal(total);
      setValue('total_invoice_amount', total);
    }
  };

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

  const handleOpenOptionsModal = (index: number) => {
    setSelectedDayIndex(index);
    setOptionsModalOpen(true);
  };

  const handleSaveOptions = (options: {
    room_rent_option_id: number | null;
    lunch_catering_option_id: number | null;
    dinner_catering_option_id: number | null;
  }) => {
    if (selectedDayIndex !== null) {
      const newDates = [...dateFields];
      newDates[selectedDayIndex] = { ...newDates[selectedDayIndex], ...options };
      setDateFields(newDates);
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
            <div>
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
                      onClick={() => handleOpenOptionsModal(idx)}
                      className="btn-secondary text-sm px-3 py-1"
                    >
                      Configure Options
                    </button>
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
                  onClick={() => setDateFields([...dateFields, { date: '', start_time: '09:00', end_time: '17:00', room_rent_option_id: null, lunch_catering_option_id: null, dinner_catering_option_id: null }])}
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

            {/* Participants Count (for existing invoices) */}
            {invoice?.id && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Participants Count
                </label>
                <input
                  type="number"
                  value={participantsCount}
                  readOnly
                  className="input-field mt-1 bg-gray-50 text-black"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Add participants in the Participants tab
                </p>
              </div>
            )}

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

            {/* Office Costs (Calculated) */}
            <div>
              <label htmlFor="office_costs" className="block text-sm font-medium text-gray-700">
                Office Costs (€) *
              </label>
              <input
                type="number"
                id="office_costs"
                {...register('office_costs', { valueAsNumber: true })}
                className="input-field mt-1 bg-gray-50 text-black"
                min="0"
                step="0.01"
                placeholder="0.00"
                readOnly
              />
              <p className="mt-1 text-sm text-gray-500">
                Calculated from room rent and catering options
              </p>
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
        <ParticipantsTable 
          trainingInvoiceId={invoice.id} 
          onParticipantsChange={handleParticipantsChange}
        />
      )}
      {optionsModalOpen && selectedDayIndex !== null && (
        <TrainingDayOptionsModal
          isOpen={optionsModalOpen}
          onClose={() => setOptionsModalOpen(false)}
          trainingDay={dateFields[selectedDayIndex]}
          onSave={handleSaveOptions}
        />
      )}
    </div>
  );
} 