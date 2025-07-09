import { initializeDefaultAdmin } from './database.pg';
import { createCateringOption } from './database.pg';

export async function initializeApp() {
  try {
    console.log('Initializing application...');
    
    // Initialize default admin user
    await initializeDefaultAdmin();
    
    // Initialize default catering options
    await initializeDefaultCateringOptions();
    
    console.log('Application initialized successfully');
  } catch (error) {
    console.error('Failed to initialize application:', error);
  }
}

async function initializeDefaultCateringOptions() {
  try {
    // Check if catering options already exist
    const { getAllCateringOptions } = await import('./database.pg');
    const existingOptions = await getAllCateringOptions();
    
    if (existingOptions.length > 0) {
      console.log('Catering options already exist, skipping initialization');
      return;
    }

    // Create default catering options
    const defaultOptions = [
      {
        name: 'Standard Catering',
        description: 'Standard lunch and dinner options with coffee/tea service',
        lunch_price_per_participant: 15.00,
        dinner_price_per_participant: 25.00,
        is_active: true,
      },
      {
        name: 'Premium Catering',
        description: 'Premium catering with gourmet options and extended menu',
        lunch_price_per_participant: 25.00,
        dinner_price_per_participant: 40.00,
        is_active: true,
      },
      {
        name: 'Light Refreshments',
        description: 'Light refreshments, coffee, tea, and snacks only',
        lunch_price_per_participant: 8.00,
        dinner_price_per_participant: 12.00,
        is_active: true,
      },
    ];

    for (const option of defaultOptions) {
      await createCateringOption(option);
    }

    console.log('Default catering options created successfully');
  } catch (error) {
    console.error('Failed to initialize catering options:', error);
  }
} 