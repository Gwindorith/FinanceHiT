# Training Invoicing System

A modern React web application for managing training invoices with a SQLite database backend. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Training Invoice Management**: Create, read, update, and delete training invoices
- **Automatic Calculations**: Automatically calculates duration and total invoice amount
- **Form Validation**: Comprehensive form validation using Zod
- **Responsive Design**: Modern, mobile-friendly UI built with Tailwind CSS
- **Real-time Updates**: Instant UI updates when data changes
- **Database Persistence**: SQLite database for reliable data storage

## Data Fields

Each training invoice includes:
- **Training Name**: Name of the training course
- **Start Date**: When the training begins
- **End Date**: When the training ends
- **Duration Days**: Automatically calculated from start/end dates
- **Trainer Costs**: Cost for the trainer (€)
- **Office Costs**: Office/venue costs (€)
- **Margin Percentage**: Profit margin percentage
- **Total Invoice Amount**: Automatically calculated total (costs + margin)

## Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite with better-sqlite3
- **Form Handling**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone or download the project files**

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up the database**:
   ```bash
   npm run db:setup
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser** and navigate to `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:setup` - Initialize database with sample data

## API Endpoints

### Training Invoices

- `GET /api/training-invoices` - Get all training invoices
- `POST /api/training-invoices` - Create a new training invoice
- `GET /api/training-invoices/[id]` - Get a specific training invoice
- `PUT /api/training-invoices/[id]` - Update a training invoice
- `DELETE /api/training-invoices/[id]` - Delete a training invoice

## Database Schema

The application uses a SQLite database with the following table structure:

```sql
CREATE TABLE training_invoices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  training_name TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  duration_days INTEGER NOT NULL,
  trainer_costs DECIMAL(10,2) NOT NULL,
  office_costs DECIMAL(10,2) NOT NULL,
  margin_percentage DECIMAL(5,2) NOT NULL,
  total_invoice_amount DECIMAL(10,2) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Usage

### Adding a New Training Invoice

1. Click the "Add Training Invoice" button
2. Fill in the training details:
   - Training name
   - Start and end dates
   - Trainer and office costs
   - Margin percentage
3. The duration and total amount are calculated automatically
4. Click "Create Invoice" to save

### Editing an Invoice

1. Click the edit icon (pencil) next to any invoice
2. Modify the fields as needed
3. Click "Update Invoice" to save changes

### Deleting an Invoice

1. Click the delete icon (trash) next to any invoice
2. Confirm the deletion in the popup dialog

## File Structure

```
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── api/               # API routes
│   │   │   └── training-invoices/
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Main page
│   ├── components/            # React components
│   │   ├── InvoiceForm.tsx    # Form for creating/editing invoices
│   │   └── InvoiceList.tsx    # Table displaying all invoices
│   └── lib/                   # Utility functions
│       └── database.ts        # Database operations
├── scripts/
│   └── setup-database.js      # Database initialization script
├── data/                      # SQLite database files (created automatically)
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## Customization

### Styling

The application uses Tailwind CSS for styling. You can customize the design by modifying:
- `tailwind.config.js` - Tailwind configuration
- `src/app/globals.css` - Global styles and custom components

### Database

The database file is stored in `data/training-invoicing.db`. You can:
- Backup the database file for data preservation
- Modify the schema in `scripts/setup-database.js`
- Add new fields to the `TrainingInvoice` interface in `src/lib/database.ts`

## Troubleshooting

### Common Issues

1. **Database not found**: Run `npm run db:setup` to initialize the database
2. **Port already in use**: Change the port in `package.json` scripts or kill the existing process
3. **TypeScript errors**: Make sure all dependencies are installed with `npm install`

### Development

- The application uses Next.js 14 with the app directory structure
- API routes are serverless functions in the `app/api` directory
- The database connection is managed as a singleton to prevent connection issues

## License

This project is open source and available under the MIT License. 