import { db } from './server/db.ts';

async function checkDivisionsSchema() {
  try {
    const result = await db.execute(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'divisions' 
      ORDER BY ordinal_position
    `);
    
    console.log('Divisions table columns:');
    result.rows.forEach(row => {
      console.log(`${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    
    // Also check if there are any existing divisions
    const divisions = await db.execute('SELECT * FROM divisions LIMIT 5');
    console.log('\nExisting divisions:', divisions.rows.length);
    divisions.rows.forEach(div => console.log(div));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

checkDivisionsSchema(); 