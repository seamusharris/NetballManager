import { sql } from 'drizzle-orm';

export async function up(db: any) {
  // Remove columns from club_players
  await db.execute(sql`
    ALTER TABLE club_players
      DROP COLUMN IF EXISTS joined_date,
      DROP COLUMN IF EXISTS left_date,
      DROP COLUMN IF EXISTS is_active,
      DROP COLUMN IF EXISTS notes,
      DROP COLUMN IF EXISTS updated_at;
  `);

  // Remove columns from team_players
  await db.execute(sql`
    ALTER TABLE team_players
      DROP COLUMN IF EXISTS is_regular,
      DROP COLUMN IF EXISTS jersey_number,
      DROP COLUMN IF EXISTS position_preferences;
  `);
}

export async function down(db: any) {
  // Add columns back to club_players (types must match original schema)
  await db.execute(sql`
    ALTER TABLE club_players
      ADD COLUMN joined_date date,
      ADD COLUMN left_date date,
      ADD COLUMN is_active boolean DEFAULT true NOT NULL,
      ADD COLUMN notes text,
      ADD COLUMN updated_at timestamp DEFAULT now() NOT NULL;
  `);

  // Add columns back to team_players (types must match original schema)
  await db.execute(sql`
    ALTER TABLE team_players
      ADD COLUMN is_regular boolean DEFAULT true NOT NULL,
      ADD COLUMN jersey_number integer,
      ADD COLUMN position_preferences json;
  `);
} 