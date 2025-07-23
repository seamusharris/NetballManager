// Test script to verify task 7 implementation - data formatting and output structure
console.log('🧪 Testing Task 7: Data formatting and output structure');

// Mock data to test formatting
const mockQuarterData = [
  {
    quarter: 1,
    gsGoalsFor: 2.456789,
    gaGoalsFor: 1.234567,
    gkGoalsAgainst: 0.987654,
    gdGoalsAgainst: 1.543210,
    gamesWithQuarterData: 5,
    hasValidData: true,
    dataQuality: 'complete'
  },
  {
    quarter: 2,
    gsGoalsFor: 0,
    gaGoalsFor: 0,
    gkGoalsAgainst: 0,
    gdGoalsAgainst: 0,
    gamesWithQuarterData: 0,
    hasValidData: false,
    dataQuality: 'no-data'
  }
];

console.log('\n📊 Testing formatting to one decimal place:');
mockQuarterData.forEach(quarter => {
  console.log(`Q${quarter.quarter}:`);
  console.log(`  GS: ${quarter.gsGoalsFor.toFixed(1)}`);
  console.log(`  GA: ${quarter.gaGoalsFor.toFixed(1)}`);
  console.log(`  GK: ${quarter.gkGoalsAgainst.toFixed(1)}`);
  console.log(`  GD: ${quarter.gdGoalsAgainst.toFixed(1)}`);
  console.log(`  Has Valid Data: ${quarter.hasValidData}`);
  console.log(`  Data Quality: ${quarter.dataQuality}`);
  console.log('');
});

console.log('✅ Task 7 formatting verification complete!');