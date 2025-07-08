import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';
import { z } from 'zod';

const ParticipantSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  company: z.string().min(1, 'Company is required'),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDatabase();
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: 'Invalid participant id' }, { status: 400 });
    }
    const participant = db.getParticipantById(id);
    if (!participant) {
      return NextResponse.json({ success: false, error: 'Participant not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: participant });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch participant' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDatabase();
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: 'Invalid participant id' }, { status: 400 });
    }
    const body = await request.json();
    const validated = ParticipantSchema.parse(body);
    const participant = db.updateParticipant(id, validated);
    if (!participant) {
      return NextResponse.json({ success: false, error: 'Participant not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: participant });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Failed to update participant' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDatabase();
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: 'Invalid participant id' }, { status: 400 });
    }
    const deleted = db.deleteParticipant(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Participant not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Participant deleted' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete participant' }, { status: 500 });
  }
} 