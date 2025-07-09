import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { getTrainingRoomRentOptionById, updateTrainingRoomRentOption, deleteTrainingRoomRentOption } from '@/lib/database.pg';

// PUT /api/training-room-rent-options/[id]
export const PUT = requireRole(['admin'])(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { name, description, rent_per_hour, is_active } = body;
    const existing = await getTrainingRoomRentOptionById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Training room rent option not found' }, { status: 404 });
    }
    if (name !== undefined && !name.trim()) {
      return NextResponse.json({ error: 'Name cannot be empty' }, { status: 400 });
    }
    if (rent_per_hour !== undefined && rent_per_hour < 0) {
      return NextResponse.json({ error: 'Rent per hour cannot be negative' }, { status: 400 });
    }
    const updated = await updateTrainingRoomRentOption(id, {
      name: name !== undefined ? name : undefined,
      description: description !== undefined ? description : undefined,
      rent_per_hour: rent_per_hour !== undefined ? Number(rent_per_hour) : undefined,
      is_active: is_active !== undefined ? Boolean(is_active) : undefined,
    });
    if (!updated) {
      return NextResponse.json({ error: 'Failed to update training room rent option' }, { status: 500 });
    }
    return NextResponse.json({ success: true, data: updated, message: 'Training room rent option updated successfully' });
  } catch (error) {
    console.error('Update training room rent option error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

// DELETE /api/training-room-rent-options/[id]
export const DELETE = requireRole(['admin'])(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const id = parseInt(params.id);
    const existing = await getTrainingRoomRentOptionById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Training room rent option not found' }, { status: 404 });
    }
    const success = await deleteTrainingRoomRentOption(id);
    if (!success) {
      return NextResponse.json({ error: 'Failed to delete training room rent option' }, { status: 500 });
    }
    return NextResponse.json({ success: true, message: 'Training room rent option deleted successfully' });
  } catch (error) {
    console.error('Delete training room rent option error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}); 