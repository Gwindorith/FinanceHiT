import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { getAllTrainingRoomRentOptions, createTrainingRoomRentOption } from '@/lib/database.pg';

// GET /api/training-room-rent-options
export const GET = requireRole(['admin', 'manager'])(async (request: NextRequest) => {
  try {
    const options = await getAllTrainingRoomRentOptions();
    return NextResponse.json({ success: true, data: options });
  } catch (error) {
    console.error('Get training room rent options error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

// POST /api/training-room-rent-options
export const POST = requireRole(['admin'])(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { name, description, rent_per_hour, is_active } = body;
    if (!name || rent_per_hour === undefined) {
      return NextResponse.json({ error: 'Name and rent per hour are required' }, { status: 400 });
    }
    if (rent_per_hour < 0) {
      return NextResponse.json({ error: 'Rent per hour cannot be negative' }, { status: 400 });
    }
    const newOption = await createTrainingRoomRentOption({
      name,
      description: description || '',
      rent_per_hour: Number(rent_per_hour),
      is_active: is_active !== undefined ? Boolean(is_active) : true,
    });
    return NextResponse.json({ success: true, data: newOption, message: 'Training room rent option created successfully' });
  } catch (error) {
    console.error('Create training room rent option error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}); 