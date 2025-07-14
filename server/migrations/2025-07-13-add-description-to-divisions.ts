import { sql } from 'drizzle-orm';

export async function up(db: any) {
  await db.execute(sql`ALTER TABLE divisions ADD COLUMN description text;`);
}

export async function down(db: any) {
  await db.execute(sql`ALTER TABLE divisions DROP COLUMN description;`);
} 