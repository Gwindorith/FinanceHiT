import { NextRequest, NextResponse } from 'next/server';
import { requireRole, getAllUsers } from '@/lib/auth';
import { getAllCateringOptions, createCateringOption } from '@/lib/database.pg';

// GET /api/catering-options - Get all catering options
export const GET = requireRole(['admin', 'manager'])(async (request: NextRequest) => {
  try {
    const cateringOptions = await getAllCateringOptions();
    return NextResponse.json({
      success: true,
      data: cateringOptions
    });
  } catch (error) {
    console.error('Get catering options error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// POST /api/catering-options - Create new catering option (admin only)
export const POST = requireRole(['admin'])(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { name, description, lunch_price_per_participant, dinner_price_per_participant, is_active } = body;

    if (!name || lunch_price_per_participant === undefined || dinner_price_per_participant === undefined) {
      return NextResponse.json(
        { error: 'Name, lunch price, and dinner price are required' },
        { status: 400 }
      );
    }

    if (lunch_price_per_participant < 0 || dinner_price_per_participant < 0) {
      return NextResponse.json(
        { error: 'Prices cannot be negative' },
        { status: 400 }
      );
    }

    const newCateringOption = await createCateringOption({
      name,
      description: description || '',
      lunch_price_per_participant: Number(lunch_price_per_participant),
      dinner_price_per_participant: Number(dinner_price_per_participant),
      is_active: is_active !== undefined ? Boolean(is_active) : true,
    });

    return NextResponse.json({
      success: true,
      data: newCateringOption,
      message: 'Catering option created successfully'
    });
  } catch (error) {
    console.error('Create catering option error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 