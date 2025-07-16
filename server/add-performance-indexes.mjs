import { db } from './db.js';
import { readFileSync } from 'fs';

async function addPerformanceIndexes() {
  try {
    console.log('🚀 Adding performance indexes...');
    
    const sql = readFileSync('server/performance-indexes.sql', 'utf8');
    const statements = sql.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await db.execute(statement);
          console.log('✅ Executed:', statement.split('\n')[0].trim());
        } catch (err) {
          console.warn('⚠️ Skipped (may already exist):', err.message.split('\n')[0]);
        }
      }
    }
    
    console.log('🎉 Performance indexes setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding indexes:', error.message);
    process.exit(1);
  }
}

addPerformanceIndexes();