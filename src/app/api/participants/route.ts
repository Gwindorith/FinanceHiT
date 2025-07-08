import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';
import { z } from 'zod';

const ParticipantSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  company: z.string().min(1, 'Company is required'),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const training_invoice_id = searchParams.get('training_invoice_id');
    
    if (!training_invoice_id) {
      return NextResponse.json({ success: false, error: 'training_invoice_id is required' }, { status: 400 });
    }
    
    const db = getDatabase();
    const invoiceId = parseInt(training_invoice_id);
    if (isNaN(invoiceId)) {
      return NextResponse.json({ success: false, error: 'Invalid training_invoice_id' }, { status: 400 });
    }
    
    const participants = db.getParticipantsByInvoice(invoiceId);
    return NextResponse.json({ success: true, data: participants });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch participants' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const training_invoice_id = searchParams.get('training_invoice_id');
    
    if (!training_invoice_id) {
      return NextResponse.json({ success: false, error: 'training_invoice_id is required' }, { status: 400 });
    }
    
    const db = getDatabase();
    const invoiceId = parseInt(training_invoice_id);
    if (isNaN(invoiceId)) {
      return NextResponse.json({ success: false, error: 'Invalid training_invoice_id' }, { status: 400 });
    }
    
    const body = await request.json();
    const validated = ParticipantSchema.parse(body);
    const participant = db.addParticipant({ training_invoice_id: invoiceId, ...validated });
    return NextResponse.json({ success: true, data: participant }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Failed to add participant' }, { status: 500 });
  }
} 