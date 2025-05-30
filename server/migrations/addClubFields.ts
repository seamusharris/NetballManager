
import { db } from '../db';
import { sql } from 'drizzle-orm';

/**
 * Add missing fields to clubs table (address, contact details, colors)
 */
export async function addClubFields(): Promise<void> {
  try {
    console.log('Adding missing fields to clubs table...');

    // Check which columns already exist
    const columnsResult = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'clubs'
    `);

    const existingColumns = columnsResult.rows.map(row => row.column_name);

    // Add missing columns
    const fieldsToAdd = [
      { name: 'address', type: 'TEXT' },
      { name: 'contact_email', type: 'TEXT' },
      { name: 'contact_phone', type: 'TEXT' },
      { name: 'logo_url', type: 'TEXT' },
      { name: 'primary_color', type: 'TEXT NOT NULL DEFAULT \'#1f2937\'' },
      { name: 'secondary_color', type: 'TEXT NOT NULL DEFAULT \'#ffffff\'' },
      { name: 'is_active', type: 'BOOLEAN NOT NULL DEFAULT true' },
      { name: 'created_at', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' },
      { name: 'updated_at', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' }
    ];

    for (const field of fieldsToAdd) {
      if (!existingColumns.includes(field.name)) {
        console.log(`Adding ${field.name} column...`);
        await db.execute(sql.raw(`
          ALTER TABLE clubs 
          ADD COLUMN ${field.name} ${field.type}
        `));
      } else {
        console.log(`${field.name} column already exists`);
      }
    }

    console.log('Successfully added missing fields to clubs table');
  } catch (error) {
    console.error('Error adding fields to clubs table:', error);
    throw error;
  }
}
