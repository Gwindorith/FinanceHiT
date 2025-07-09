import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { getCateringOptionById, updateCateringOption, deleteCateringOption } from '@/lib/database.pg';

// PUT /api/catering-options/[id] - Update catering option (admin only)
export const PUT = requireRole(['admin'])(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const cateringOptionId = parseInt(params.id);
    const body = await request.json();
    const { name, description, lunch_price_per_participant, dinner_price_per_participant, is_active } = body;

    // Check if catering option exists
    const existingOption = await getCateringOptionById(cateringOptionId);
    if (!existingOption) {
      return NextResponse.json(
        { error: 'Catering option not found' },
        { status: 404 }
      );
    }

    // Validate required fields if provided
    if (name !== undefined && !name.trim()) {
      return NextResponse.json(
        { error: 'Name cannot be empty' },
        { status: 400 }
      );
    }

    if (lunch_price_per_participant !== undefined && lunch_price_per_participant < 0) {
      return NextResponse.json(
        { error: 'Lunch price cannot be negative' },
        { status: 400 }
      );
    }

    if (dinner_price_per_participant !== undefined && dinner_price_per_participant < 0) {
      return NextResponse.json(
        { error: 'Dinner price cannot be negative' },
        { status: 400 }
      );
    }

    // Update catering option
    const updatedOption = await updateCateringOption(cateringOptionId, {
      name: name !== undefined ? name : undefined,
      description: description !== undefined ? description : undefined,
      lunch_price_per_participant: lunch_price_per_participant !== undefined ? Number(lunch_price_per_participant) : undefined,
      dinner_price_per_participant: dinner_price_per_participant !== undefined ? Number(dinner_price_per_participant) : undefined,
      is_active: is_active !== undefined ? Boolean(is_active) : undefined,
    });

    if (!updatedOption) {
      return NextResponse.json(
        { error: 'Failed to update catering option' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedOption,
      message: 'Catering option updated successfully'
    });
  } catch (error) {
    console.error('Update catering option error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// DELETE /api/catering-options/[id] - Delete catering option (admin only)
export const DELETE = requireRole(['admin'])(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const cateringOptionId = parseInt(params.id);

    // Check if catering option exists
    const existingOption = await getCateringOptionById(cateringOptionId);
    if (!existingOption) {
      return NextResponse.json(
        { error: 'Catering option not found' },
        { status: 404 }
      );
    }

    // Delete catering option
    const success = await deleteCateringOption(cateringOptionId);
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete catering option' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Catering option deleted successfully'
    });
  } catch (error) {
    console.error('Delete catering option error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 