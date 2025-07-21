#!/usr/bin/env node

/**
 * Manual Case Conversion Test
 * Tests the case conversion system by making direct API calls
 */

import dotenv from 'dotenv';
import fetch from 'node-fetch';

// Load environment variables
dotenv.config();

const API_BASE = 'http://localhost:3000';

console.log('🧪 Manual Case Conversion Test');
console.log('==============================');

async function testCaseConversion() {
  console.log('🚀 Starting server test...');
  
  try {
    // Test 1: Health check
    console.log('\n📊 Test 1: Health Check');
    const healthResponse = await fetch(`${API_BASE}/api/health`);
    const healthData = await healthResponse.json();
    console.log(`Status: ${healthResponse.status}`);
    console.log(`Health: ${healthData.status}`);
    
    if (healthResponse.status !== 200) {
      console.log('❌ Server not healthy, stopping tests');
      return;
    }
    
    // Test 2: Debug case conversion endpoint
    console.log('\n📊 Test 2: Debug Case Conversion');
    const debugData = {
      testField: 'value',
      camelCaseField: 'camelCase',
      anotherField: 123,
      nestedObject: {
        nestedField: 'nested',
        anotherNested: true
      }
    };
    
    const debugResponse = await fetch(`${API_BASE}/api/debug/case-conversion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(debugData)
    });
    
    const debugResult = await debugResponse.json();
    console.log(`Status: ${debugResponse.status}`);
    console.log('Response:', JSON.stringify(debugResult, null, 2));
    
    // Test 3: Create a club with camelCase
    console.log('\n📊 Test 3: Club Creation with camelCase');
    const clubData = {
      name: `Manual Test Club ${Date.now()}`,
      code: `MTC${Date.now()}`,
      address: '123 Manual Test Street',
      contactInfo: 'manual@test.com',
      isActive: true
    };
    
    const clubResponse = await fetch(`${API_BASE}/api/clubs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(clubData)
    });
    
    console.log(`Status: ${clubResponse.status}`);
    
    if (clubResponse.status === 201) {
      const clubResult = await clubResponse.json();
      console.log('✅ Club created successfully!');
      console.log('Response fields:');
      Object.keys(clubResult).forEach(key => {
        console.log(`  - ${key}: ${typeof clubResult[key]}`);
      });
      
      // Check for snake_case fields (should not exist)
      const snakeCaseFields = Object.keys(clubResult).filter(key => key.includes('_'));
      if (snakeCaseFields.length > 0) {
        console.log('⚠️ Found snake_case fields in response:', snakeCaseFields);
      } else {
        console.log('✅ No snake_case fields found - case conversion working!');
      }
      
      // Test 4: Update the club
      console.log('\n📊 Test 4: Club Update with camelCase');
      const updateData = {
        name: `Updated Manual Test Club ${Date.now()}`,
        isActive: false,
        contactInfo: 'updated@manual.test'
      };
      
      const updateResponse = await fetch(`${API_BASE}/api/clubs/${clubResult.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });
      
      console.log(`Update Status: ${updateResponse.status}`);
      
      if (updateResponse.status === 200) {
        const updateResult = await updateResponse.json();
        console.log('✅ Club updated successfully!');
        console.log(`Name: ${updateResult.name}`);
        console.log(`isActive: ${updateResult.isActive}`);
        console.log(`contactInfo: ${updateResult.contactInfo}`);
        
        // Verify no snake_case fields
        const updateSnakeFields = Object.keys(updateResult).filter(key => key.includes('_'));
        if (updateSnakeFields.length > 0) {
          console.log('⚠️ Found snake_case fields in update response:', updateSnakeFields);
        } else {
          console.log('✅ Update response properly converted to camelCase!');
        }
      } else {
        const updateError = await updateResponse.json();
        console.log('❌ Update failed:', updateError);
      }
      
      // Test 5: Fetch the club back
      console.log('\n📊 Test 5: Club Retrieval');
      const fetchResponse = await fetch(`${API_BASE}/api/clubs/${clubResult.id}`);
      console.log(`Fetch Status: ${fetchResponse.status}`);
      
      if (fetchResponse.status === 200) {
        const fetchResult = await fetchResponse.json();
        console.log('✅ Club fetched successfully!');
        console.log('Data integrity check:');
        console.log(`  Name matches: ${fetchResult.name === updateData.name}`);
        console.log(`  isActive matches: ${fetchResult.isActive === updateData.isActive}`);
        console.log(`  contactInfo matches: ${fetchResult.contactInfo === updateData.contactInfo}`);
      }
      
      // Cleanup
      console.log('\n🧹 Cleanup: Deleting test club');
      const deleteResponse = await fetch(`${API_BASE}/api/clubs/${clubResult.id}`, {
        method: 'DELETE'
      });
      console.log(`Delete Status: ${deleteResponse.status}`);
      
    } else {
      const clubError = await clubResponse.json();
      console.log('❌ Club creation failed:', clubError);
    }
    
    console.log('\n🎉 Manual test completed!');
    
  } catch (error) {
    console.log('💥 Test failed with error:', error.message);
    console.log('Make sure the server is running on http://localhost:3000');
  }
}

// Run the test
testCaseConversion();