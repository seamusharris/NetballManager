import { db } from '../server/db.ts';
import { divisions } from '../shared/schema.ts';

async function createTestDivisions() {
  try {
    console.log('Creating test divisions...');
    
    // Create one test division
    const testDivision = {
      ageGroupId: 4, // 15U
      sectionId: 1,  // Section 1
      seasonId: 1,   // Autumn 2025
      displayName: '15U/1',
      isActive: true
    };

    const result = await db.insert(divisions).values(testDivision).returning();
    console.log(`Created division: ${result[0].displayName}`);

    console.log('Test divisions created successfully!');
  } catch (error) {
    console.error('Error creating test divisions:', error);
  } finally {
    process.exit(0);
  }
}

createTestDivisions(); 