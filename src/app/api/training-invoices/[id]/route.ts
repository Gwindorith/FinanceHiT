import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, TrainingInvoice } from '@/lib/database';
import { z } from 'zod';

// Validation schema for updating training invoices
const TrainingInvoiceUpdateSchema = z.object({
  invoice_number: z.string().optional(),
  invoice_date: z.string().optional(),
  customer: z.string().optional(),
  training_name: z.string().min(1, 'Training name is required').optional(),
  training_dates: z.array(z.object({
    date: z.string().min(1, 'Date is required'),
    start_time: z.string().min(1, 'Start time is required'),
    end_time: z.string().min(1, 'End time is required'),
  })).min(1, 'At least one date is required').optional(),
  trainer_costs: z.number().min(0, 'Trainer costs must be non-negative').optional(),
  office_costs: z.number().min(0, 'Office costs must be non-negative').optional(),
  margin_percentage: z.number().min(0, 'Margin percentage must be non-negative').optional(),
  total_invoice_amount: z.number().min(0, 'Total invoice amount must be non-negative').optional(),
  trainer_availability_emailed: z.boolean().optional(),
  masterclass_planning_added: z.boolean().optional(),
  lms_updated: z.boolean().optional(),
  navara_event_agenda_updated: z.boolean().optional(),
  catering_ordered: z.boolean().optional(),
  trainer_invoice_received: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid ID' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    const invoice = db.getTrainingInvoiceById(id);
    
    if (!invoice) {
      return NextResponse.json(
        { success: false, error: 'Training invoice not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: invoice });
  } catch (error) {
    console.error('Error fetching training invoice:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch training invoice' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Validate input
    const validatedData = TrainingInvoiceUpdateSchema.parse(body);
    
    const db = getDatabase();
    
    // Calculate duration as the number of unique dates if training_dates is updated
    let updateData: any = { ...validatedData };
    if (validatedData.training_dates !== undefined) {
      const uniqueDates = Array.from(new Set(validatedData.training_dates.map(d => d.date)));
      updateData.duration_days = uniqueDates.length;
    }

    // Calculate total invoice amount if costs or margin changed
    if (
      validatedData.trainer_costs !== undefined || 
      validatedData.office_costs !== undefined || 
      validatedData.margin_percentage !== undefined
    ) {
      const current = db.getTrainingInvoiceById(id);
      if (!current) {
        return NextResponse.json(
          { success: false, error: 'Training invoice not found' },
          { status: 404 }
        );
      }
      const trainerCosts = validatedData.trainer_costs ?? current.trainer_costs;
      const officeCosts = validatedData.office_costs ?? current.office_costs;
      const marginPercentage = validatedData.margin_percentage ?? current.margin_percentage;
      updateData.total_invoice_amount = db.calculateTotalAmount(
        trainerCosts,
        officeCosts,
        marginPercentage
      );
    }
    
    const invoice = db.updateTrainingInvoice(id, updateData);
    
    if (!invoice) {
      return NextResponse.json(
        { success: false, error: 'Training invoice not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: invoice });
  } catch (error) {
    console.error('Error updating training invoice:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to update training invoice' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid ID' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    const deleted = db.deleteTrainingInvoice(id);
    
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Training invoice not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, message: 'Training invoice deleted successfully' });
  } catch (error) {
    console.error('Error deleting training invoice:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete training invoice' },
      { status: 500 }
    );
  }
} 