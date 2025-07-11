// Sample data to add via API
const sampleData = [
  // 2024 Data
  {
    invoice_number: '2024-003',
    invoice_date: '2024-03-15',
    customer: 'TechStart Inc',
    training_name: 'Node.js Backend Development',
    training_dates: [
      { date: '2024-03-20', start_time: '09:00', end_time: '17:00' },
      { date: '2024-03-21', start_time: '09:00', end_time: '17:00' },
      { date: '2024-03-22', start_time: '09:00', end_time: '16:00' },
    ],
    duration_days: 3,
    trainer_costs: 1800.00,
    office_costs: 450.00,
    margin_percentage: 20.00,
    total_invoice_amount: 2610.00,
    trainer_availability_emailed: true,
    masterclass_planning_added: true,
    lms_updated: true,
    navara_event_agenda_updated: true,
    catering_ordered: true,
    trainer_invoice_received: true
  },
  {
    invoice_number: '2024-004',
    invoice_date: '2024-04-10',
    customer: 'Digital Solutions',
    training_name: 'React Advanced Patterns',
    training_dates: [
      { date: '2024-04-15', start_time: '10:00', end_time: '18:00' },
      { date: '2024-04-16', start_time: '10:00', end_time: '18:00' },
    ],
    duration_days: 2,
    trainer_costs: 1400.00,
    office_costs: 320.00,
    margin_percentage: 25.00,
    total_invoice_amount: 2070.00,
    trainer_availability_emailed: true,
    masterclass_planning_added: false,
    lms_updated: true,
    navara_event_agenda_updated: true,
    catering_ordered: true,
    trainer_invoice_received: false
  },
  {
    invoice_number: '2024-005',
    invoice_date: '2024-05-05',
    customer: 'Innovation Labs',
    training_name: 'Python Data Science',
    training_dates: [
      { date: '2024-05-12', start_time: '09:00', end_time: '17:00' },
      { date: '2024-05-13', start_time: '09:00', end_time: '17:00' },
      { date: '2024-05-14', start_time: '09:00', end_time: '17:00' },
      { date: '2024-05-15', start_time: '09:00', end_time: '16:00' },
    ],
    duration_days: 4,
    trainer_costs: 2400.00,
    office_costs: 600.00,
    margin_percentage: 30.00,
    total_invoice_amount: 3720.00,
    trainer_availability_emailed: true,
    masterclass_planning_added: true,
    lms_updated: true,
    navara_event_agenda_updated: true,
    catering_ordered: true,
    trainer_invoice_received: true
  },
  {
    invoice_number: '2024-006',
    invoice_date: '2024-06-20',
    customer: 'Global Systems',
    training_name: 'DevOps Fundamentals',
    training_dates: [
      { date: '2024-06-25', start_time: '09:00', end_time: '17:00' },
      { date: '2024-06-26', start_time: '09:00', end_time: '17:00' },
    ],
    duration_days: 2,
    trainer_costs: 1600.00,
    office_costs: 400.00,
    margin_percentage: 22.00,
    total_invoice_amount: 2352.00,
    trainer_availability_emailed: true,
    masterclass_planning_added: false,
    lms_updated: true,
    navara_event_agenda_updated: true,
    catering_ordered: true,
    trainer_invoice_received: false
  },
  {
    invoice_number: '2024-007',
    invoice_date: '2024-07-12',
    customer: 'CloudTech Solutions',
    training_name: 'AWS Cloud Architecture',
    training_dates: [
      { date: '2024-07-18', start_time: '10:00', end_time: '18:00' },
      { date: '2024-07-19', start_time: '10:00', end_time: '18:00' },
      { date: '2024-07-20', start_time: '10:00', end_time: '16:00' },
    ],
    duration_days: 3,
    trainer_costs: 2200.00,
    office_costs: 550.00,
    margin_percentage: 28.00,
    total_invoice_amount: 3516.00,
    trainer_availability_emailed: true,
    masterclass_planning_added: true,
    lms_updated: true,
    navara_event_agenda_updated: true,
    catering_ordered: true,
    trainer_invoice_received: true
  },
  {
    invoice_number: '2024-008',
    invoice_date: '2024-08-08',
    customer: 'Mobile First',
    training_name: 'React Native Development',
    training_dates: [
      { date: '2024-08-15', start_time: '09:00', end_time: '17:00' },
      { date: '2024-08-16', start_time: '09:00', end_time: '17:00' },
    ],
    duration_days: 2,
    trainer_costs: 1300.00,
    office_costs: 300.00,
    margin_percentage: 25.00,
    total_invoice_amount: 1925.00,
    trainer_availability_emailed: false,
    masterclass_planning_added: false,
    lms_updated: false,
    navara_event_agenda_updated: false,
    catering_ordered: false,
    trainer_invoice_received: false
  },
  {
    invoice_number: '2024-009',
    invoice_date: '2024-09-25',
    customer: 'AI Innovations',
    training_name: 'Machine Learning Basics',
    training_dates: [
      { date: '2024-10-02', start_time: '09:00', end_time: '17:00' },
      { date: '2024-10-03', start_time: '09:00', end_time: '17:00' },
      { date: '2024-10-04', start_time: '09:00', end_time: '17:00' },
    ],
    duration_days: 3,
    trainer_costs: 2800.00,
    office_costs: 700.00,
    margin_percentage: 35.00,
    total_invoice_amount: 4725.00,
    trainer_availability_emailed: true,
    masterclass_planning_added: true,
    lms_updated: true,
    navara_event_agenda_updated: true,
    catering_ordered: true,
    trainer_invoice_received: true
  },
  {
    invoice_number: '2024-010',
    invoice_date: '2024-11-15',
    customer: 'Security Plus',
    training_name: 'Cybersecurity Fundamentals',
    training_dates: [
      { date: '2024-11-20', start_time: '10:00', end_time: '18:00' },
      { date: '2024-11-21', start_time: '10:00', end_time: '18:00' },
    ],
    duration_days: 2,
    trainer_costs: 1900.00,
    office_costs: 450.00,
    margin_percentage: 30.00,
    total_invoice_amount: 2925.00,
    trainer_availability_emailed: true,
    masterclass_planning_added: false,
    lms_updated: true,
    navara_event_agenda_updated: true,
    catering_ordered: true,
    trainer_invoice_received: false
  },
  {
    invoice_number: '2024-011',
    invoice_date: '2024-12-03',
    customer: 'Web Solutions',
    training_name: 'Full Stack Development',
    training_dates: [
      { date: '2024-12-10', start_time: '09:00', end_time: '17:00' },
      { date: '2024-12-11', start_time: '09:00', end_time: '17:00' },
      { date: '2024-12-12', start_time: '09:00', end_time: '17:00' },
      { date: '2024-12-13', start_time: '09:00', end_time: '16:00' },
    ],
    duration_days: 4,
    trainer_costs: 3200.00,
    office_costs: 800.00,
    margin_percentage: 25.00,
    total_invoice_amount: 4800.00,
    trainer_availability_emailed: true,
    masterclass_planning_added: true,
    lms_updated: true,
    navara_event_agenda_updated: true,
    catering_ordered: true,
    trainer_invoice_received: true
  },

  // 2025 Data
  {
    invoice_number: '2025-001',
    invoice_date: '2025-01-15',
    customer: 'Future Tech',
    training_name: 'Vue.js Masterclass',
    training_dates: [
      { date: '2025-01-22', start_time: '09:00', end_time: '17:00' },
      { date: '2025-01-23', start_time: '09:00', end_time: '17:00' },
    ],
    duration_days: 2,
    trainer_costs: 1400.00,
    office_costs: 350.00,
    margin_percentage: 25.00,
    total_invoice_amount: 2187.50,
    trainer_availability_emailed: true,
    masterclass_planning_added: true,
    lms_updated: true,
    navara_event_agenda_updated: true,
    catering_ordered: true,
    trainer_invoice_received: false
  },
  {
    invoice_number: '2025-002',
    invoice_date: '2025-02-10',
    customer: 'Data Analytics Corp',
    training_name: 'Advanced SQL & Database Design',
    training_dates: [
      { date: '2025-02-17', start_time: '10:00', end_time: '18:00' },
      { date: '2025-02-18', start_time: '10:00', end_time: '18:00' },
      { date: '2025-02-19', start_time: '10:00', end_time: '17:00' },
    ],
    duration_days: 3,
    trainer_costs: 2100.00,
    office_costs: 525.00,
    margin_percentage: 30.00,
    total_invoice_amount: 3412.50,
    trainer_availability_emailed: true,
    masterclass_planning_added: true,
    lms_updated: true,
    navara_event_agenda_updated: true,
    catering_ordered: true,
    trainer_invoice_received: true
  },
  {
    invoice_number: '2025-003',
    invoice_date: '2025-03-05',
    customer: 'Agile Solutions',
    training_name: 'Scrum Master Certification',
    training_dates: [
      { date: '2025-03-12', start_time: '09:00', end_time: '17:00' },
      { date: '2025-03-13', start_time: '09:00', end_time: '17:00' },
    ],
    duration_days: 2,
    trainer_costs: 1800.00,
    office_costs: 450.00,
    margin_percentage: 20.00,
    total_invoice_amount: 2700.00,
    trainer_availability_emailed: true,
    masterclass_planning_added: false,
    lms_updated: true,
    navara_event_agenda_updated: true,
    catering_ordered: true,
    trainer_invoice_received: false
  },
  {
    invoice_number: '2025-004',
    invoice_date: '2025-04-20',
    customer: 'Blockchain Ventures',
    training_name: 'Blockchain Development',
    training_dates: [
      { date: '2025-04-28', start_time: '10:00', end_time: '18:00' },
      { date: '2025-04-29', start_time: '10:00', end_time: '18:00' },
      { date: '2025-04-30', start_time: '10:00', end_time: '18:00' },
    ],
    duration_days: 3,
    trainer_costs: 2500.00,
    office_costs: 625.00,
    margin_percentage: 35.00,
    total_invoice_amount: 4218.75,
    trainer_availability_emailed: true,
    masterclass_planning_added: true,
    lms_updated: true,
    navara_event_agenda_updated: true,
    catering_ordered: true,
    trainer_invoice_received: true
  },
  {
    invoice_number: '2025-005',
    invoice_date: '2025-05-12',
    customer: 'IoT Innovations',
    training_name: 'Internet of Things Development',
    training_dates: [
      { date: '2025-05-19', start_time: '09:00', end_time: '17:00' },
      { date: '2025-05-20', start_time: '09:00', end_time: '17:00' },
      { date: '2025-05-21', start_time: '09:00', end_time: '17:00' },
      { date: '2025-05-22', start_time: '09:00', end_time: '16:00' },
    ],
    duration_days: 4,
    trainer_costs: 3000.00,
    office_costs: 750.00,
    margin_percentage: 30.00,
    total_invoice_amount: 4875.00,
    trainer_availability_emailed: true,
    masterclass_planning_added: true,
    lms_updated: true,
    navara_event_agenda_updated: true,
    catering_ordered: true,
    trainer_invoice_received: true
  },
  {
    invoice_number: '2025-006',
    invoice_date: '2025-06-08',
    customer: 'Microservices Inc',
    training_name: 'Microservices Architecture',
    training_dates: [
      { date: '2025-06-16', start_time: '10:00', end_time: '18:00' },
      { date: '2025-06-17', start_time: '10:00', end_time: '18:00' },
    ],
    duration_days: 2,
    trainer_costs: 1600.00,
    office_costs: 400.00,
    margin_percentage: 25.00,
    total_invoice_amount: 2500.00,
    trainer_availability_emailed: true,
    masterclass_planning_added: false,
    lms_updated: true,
    navara_event_agenda_updated: true,
    catering_ordered: true,
    trainer_invoice_received: false
  },
  {
    invoice_number: '2025-007',
    invoice_date: '2025-07-25',
    customer: 'API Solutions',
    training_name: 'RESTful API Design',
    training_dates: [
      { date: '2025-08-01', start_time: '09:00', end_time: '17:00' },
      { date: '2025-08-02', start_time: '09:00', end_time: '17:00' },
    ],
    duration_days: 2,
    trainer_costs: 1200.00,
    office_costs: 300.00,
    margin_percentage: 20.00,
    total_invoice_amount: 1800.00,
    trainer_availability_emailed: false,
    masterclass_planning_added: false,
    lms_updated: false,
    navara_event_agenda_updated: false,
    catering_ordered: false,
    trainer_invoice_received: false
  }
];

async function addSampleDataViaAPI() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  
  console.log('Adding sample data via API...');
  console.log(`Using API URL: ${baseUrl}`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const data of sampleData) {
    try {
      const response = await fetch(`${baseUrl}/api/training-invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          console.log(`✅ Added: ${data.training_name} (${data.customer})`);
          successCount++;
        } else {
          console.log(`❌ Failed to add: ${data.training_name} - ${result.error}`);
          errorCount++;
        }
      } else {
        console.log(`❌ HTTP Error ${response.status} for: ${data.training_name}`);
        errorCount++;
      }
      
      // Add a small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.log(`❌ Error adding ${data.training_name}:`, error.message);
      errorCount++;
    }
  }
  
  console.log('\n📊 Summary:');
  console.log(`✅ Successfully added: ${successCount} invoices`);
  console.log(`❌ Failed to add: ${errorCount} invoices`);
  console.log(`📈 Total processed: ${sampleData.length} invoices`);
  
  if (successCount > 0) {
    console.log('\n🎉 Sample data has been added! You can now view the dashboard with rich data.');
  }
}

// Run the function
addSampleDataViaAPI().catch(console.error); 