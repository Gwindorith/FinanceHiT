import { initializeDefaultAdmin } from './database.pg';

export async function initializeApp() {
  try {
    console.log('Initializing application...');
    
    // Initialize default admin user
    await initializeDefaultAdmin();
    
    console.log('Application initialized successfully');
  } catch (error) {
    console.error('Failed to initialize application:', error);
  }
} 