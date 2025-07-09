import { NextRequest, NextResponse } from 'next/server';
import { getAllTrainingInvoices, createTrainingInvoice, calculateTotalAmount, TrainingInvoice } from '@/lib/database.pg';
import { z } from 'zod';

// Validation schema for creating/updating training invoices
const TrainingInvoiceSchema = z.object({
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
  trainer_availability_emailed: z.boolean().optional(),
  masterclass_planning_added: z.boolean().optional(),
  lms_updated: z.boolean().optional(),
  navara_event_agenda_updated: z.boolean().optional(),
  catering_ordered: z.boolean().optional(),
  trainer_invoice_received: z.boolean().optional(),
});

export async function GET() {
  try {
    const invoices = await getAllTrainingInvoices();
    
    return NextResponse.json({ success: true, data: invoices });
  } catch (error) {
    console.error('Error fetching training invoices:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch training invoices' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = TrainingInvoiceSchema.parse(body);
    
    // Calculate duration as the number of unique dates
    const uniqueDates = Array.from(new Set(validatedData.training_dates.map(d => d.date)));
    const duration_days = uniqueDates.length;

    // Calculate total invoice amount if not provided
    let totalAmount = validatedData.total_invoice_amount;
    if (!totalAmount) {
      totalAmount = calculateTotalAmount(
        validatedData.trainer_costs,
        validatedData.office_costs,
        validatedData.margin_percentage
      );
    }
    
    const invoice = await createTrainingInvoice({
      ...validatedData,
      invoice_number: validatedData.invoice_number ?? '',
      training_dates: validatedData.training_dates,
      duration_days,
      total_invoice_amount: totalAmount,
    });
    
    return NextResponse.json({ success: true, data: invoice }, { status: 201 });
  } catch (error) {
    console.error('Error creating training invoice:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to create training invoice' },
      { status: 500 }
    );
  }
} 