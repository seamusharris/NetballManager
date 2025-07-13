import { db } from './server/db.ts';
import { divisions } from '@shared/schema';
import { eq } from 'drizzle-orm';

async function testDivisionInsert() {
  try {
    console.log('Testing division insertion...');
    
    const testData = {
      ageGroupId: 1,
      sectionId: 1,
      seasonId: 1,
      displayName: '9U/1',
      description: 'Test division',
      isActive: true
    };
    
    console.log('Inserting test data:', testData);
    
    const result = await db.insert(divisions).values(testData).returning();
    
    console.log('✅ Insert successful:', result[0]);
    
    // Clean up - delete the test record
    await db.delete(divisions).where(eq(divisions.id, result[0].id));
    console.log('✅ Test record cleaned up');
    
  } catch (error) {
    console.error('❌ Insert failed:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint
    });
  } finally {
    process.exit(0);
  }
}

testDivisionInsert(); 