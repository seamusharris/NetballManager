
import { db } from '../db';
import { sql } from 'drizzle-orm';

/**
 * Add description column to clubs table
 */
export async function addClubDescriptionColumn(): Promise<void> {
  try {
    console.log('Adding description column to clubs table...');

    // Check if description column already exists
    const columnExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'clubs'
        AND column_name = 'description'
      );
    `);

    if (columnExists.rows[0].exists) {
      console.log('description column already exists in clubs table');
      return;
    }

    // Add description column
    await db.execute(sql`
      ALTER TABLE clubs 
      ADD COLUMN description TEXT;
    `);

    console.log('Successfully added description column to clubs table');
  } catch (error) {
    console.error('Error adding description column to clubs table:', error);
    throw error;
  }
}
