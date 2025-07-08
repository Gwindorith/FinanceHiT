# PostgreSQL Setup Guide

## Database Setup

### Option 1: Neon (Recommended - Free)
1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project
3. Copy the connection string (it looks like: `postgresql://user:password@host:5432/database`)
4. Add it to your `.env.local` file as `DATABASE_URL`

### Option 2: Supabase (Free)
1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to Settings > Database to find your connection string
4. Add it to your `.env.local` file as `DATABASE_URL`

### Option 3: Railway (Free tier available)
1. Go to [railway.app](https://railway.app) and create an account
2. Create a new PostgreSQL database
3. Copy the connection string
4. Add it to your `.env.local` file as `DATABASE_URL`

## Database Schema Setup

Once you have your database connection string:

1. **Create a `.env.local` file** in your project root:
   ```
   DATABASE_URL=your_postgresql_connection_string_here
   ```

2. **Run the database schema** using the `postgres-init.sql` file:
   - If using Neon: Go to the SQL Editor and paste the contents of `postgres-init.sql`
   - If using Supabase: Go to the SQL Editor and paste the contents of `postgres-init.sql`
   - If using Railway: Use the Railway CLI or web interface to run the SQL

3. **Test locally**:
   ```bash
   npm run dev
   ```

## Deployment

### Vercel Deployment
1. Add your `DATABASE_URL` as an environment variable in Vercel
2. Deploy your app - it should now work with PostgreSQL!

### Other Platforms
- Add `DATABASE_URL` as an environment variable
- Deploy your app

## Migration from SQLite

The app has been migrated from SQLite to PostgreSQL. All API routes now use the new PostgreSQL database utility (`src/lib/database.pg.ts`).

## Troubleshooting

- **Connection errors**: Make sure your `DATABASE_URL` is correct and the database is accessible
- **SSL errors**: The code automatically handles SSL for cloud databases
- **Schema errors**: Make sure you've run the `postgres-init.sql` script in your database 