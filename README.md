# Real-time News Aggregator

A Next.js application that aggregates news from multiple sources (Economic Times, NDTV, CNN, BBC, MoneyControl, The Hindu, and Times of India) and displays them in real-time with keyword filtering.

## Features

- Real-time news updates from multiple sources
- Server-side RSS polling using worker threads
- Keyword filtering
- Responsive design
- Server-side rendering
- Automatic client updates every 30 seconds

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/news_aggregator"
   NEXT_PUBLIC_BASE_URL="http://localhost:3000"
   CRON_SECRET="your-secure-secret-key"
   ```

4. Initialize the database:
   ```bash
   npx prisma db push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. The worker thread will automatically start when the server starts and poll for news every 5 minutes.

7. Open [http://localhost:3000](http://localhost:3000) in your browser

## Technologies Used

- Next.js 14
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL
- RSS Parser
- React Icons
- Date-fns
- Worker Threads

## Project Structure

- `/src/app` - Next.js app router pages and API routes
- `/src/types` - TypeScript type definitions
- `/src/workers` - Background worker threads
- `/prisma` - Database schema and migrations
- `/public` - Static assets

## Contributing

Feel free to submit issues and enhancement requests!
