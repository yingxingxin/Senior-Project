import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Ensure DATABASE_URL is defined in .env file
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined');
}

// Keep sensitive connection details out of the source code
const connectionString = process.env.DATABASE_URL;

// Create a PostgreSQL client connection using the connection string
const client = postgres(connectionString);

// Initialize Drizzle ORM with the PostgreSQL client and schema definitions
// This creates a type-safe database interface that knows about our table structure
export const db = drizzle(client, { schema });

// Re-export all schema definitions (tables, relations, types) for use throughout the app
export * from './schema';