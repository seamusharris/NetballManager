#!/usr/bin/env node

/**
 * Database Connection Test Script
 * Tests the database connection and provides diagnostic information
 */

import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('🔍 Database Connection Diagnostic');
console.log('================================');

// Check environment variables
console.log('📊 Environment Variables:');
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? 'set' : 'NOT SET'}`);
if (process.env.DATABASE_URL) {
  // Parse and display connection details (without password)
  try {
    const url = new URL(process.env.DATABASE_URL);
    console.log(`  Host: ${url.hostname}`);
    console.log(`  Port: ${url.port}`);
    console.log(`  Database: ${url.pathname.slice(1)}`);
    console.log(`  Username: ${url.username}`);
    console.log(`  SSL: ${url.searchParams.get('sslmode') || 'not specified'}`);
  } catch (error) {
    console.log(`  Invalid URL format: ${error.message}`);
  }
}

// Test connection
console.log('\n🔌 Testing Database Connection...');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1, // Only need one connection for testing
  connectionTimeoutMillis: 5000,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function testConnection() {
  let client;
  try {
    console.log('⏳ Attempting to connect...');
    client = await pool.connect();
    console.log('✅ Connection successful!');
    
    // Test a simple query
    console.log('⏳ Testing query execution...');
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('✅ Query successful!');
    console.log(`📅 Current time: ${result.rows[0].current_time}`);
    console.log(`🗄️ PostgreSQL version: ${result.rows[0].pg_version.split(' ')[0]}`);
    
    // Test if our tables exist
    console.log('⏳ Checking for application tables...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    if (tablesResult.rows.length > 0) {
      console.log('✅ Found application tables:');
      tablesResult.rows.forEach(row => {
        console.log(`  - ${row.table_name}`);
      });
    } else {
      console.log('⚠️ No application tables found - database may need migration');
    }
    
  } catch (error) {
    console.log('❌ Connection failed!');
    console.log(`Error: ${error.message}`);
    console.log(`Code: ${error.code}`);
    
    if (error.code === 'ENOTFOUND') {
      console.log('\n💡 Troubleshooting ENOTFOUND:');
      console.log('  - Check if the database host is correct');
      console.log('  - Verify DNS resolution');
      console.log('  - Ensure the database server is running');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Troubleshooting ECONNREFUSED:');
      console.log('  - Check if PostgreSQL is running');
      console.log('  - Verify the port number (default: 5432)');
      console.log('  - Check firewall settings');
    } else if (error.code === '28P01') {
      console.log('\n💡 Troubleshooting Authentication:');
      console.log('  - Check username and password');
      console.log('  - Verify database user permissions');
    }
    
    process.exit(1);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

// Run the test
testConnection()
  .then(() => {
    console.log('\n🎉 Database connection test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.log('\n💥 Database connection test failed:', error.message);
    process.exit(1);
  });