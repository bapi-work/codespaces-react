/**
 * Database Setup Module
 * Handles automatic database initialization on first run
 */

import mongoose from 'mongoose';
import initializeDatabase from './initializeDatabase.js';

const DB_CHECK_RETRIES = 5;
const DB_CHECK_DELAY = 2000; // 2 seconds

/**
 * Check if database needs initialization
 */
export async function isDatabaseInitialized() {
  try {
    const dbName = mongoose.connection.db.databaseName;
    const collections = await mongoose.connection.db.listCollections().toArray();
    const hasCollections = collections.length > 0;
    
    console.log(`Database: ${dbName}, Collections: ${collections.length}`);
    return hasCollections;
  } catch (error) {
    console.error('Error checking database status:', error.message);
    return false;
  }
}

/**
 * Wait for database connection with retries
 */
export async function waitForDatabase(retries = DB_CHECK_RETRIES) {
  for (let i = 0; i < retries; i++) {
    try {
      if (mongoose.connection.readyState === 1) { // Connected
        return true;
      }
      console.log(`Waiting for database connection... (${i + 1}/${retries})`);
      await new Promise(resolve => setTimeout(resolve, DB_CHECK_DELAY));
    } catch (error) {
      console.error(`Connection attempt ${i + 1} failed:`, error.message);
    }
  }
  return false;
}

/**
 * Auto-initialize database if needed
 */
export async function autoInitializeDatabase(options = {}) {
  const {
    force = false,
    verbose = true
  } = options;

  try {
    // Wait for database connection
    const connected = await waitForDatabase();
    if (!connected) {
      console.error('Failed to connect to database after retries');
      return false;
    }

    // Check if initialization is needed
    const isInitialized = await isDatabaseInitialized();
    
    if (isInitialized && !force) {
      if (verbose) {
        console.log('✅ Database already initialized. Skipping setup.');
      }
      return true;
    }

    if (force) {
      console.log('⚠️  Force initialization requested. Proceeding with setup...');
    } else {
      console.log('📊 Database is empty. Starting initialization...');
    }

    // Run initialization
    await initializeDatabase();
    
    console.log('✅ Database initialization completed');
    return true;

  } catch (error) {
    console.error('❌ Database auto-initialization failed:', error.message);
    return false;
  }
}

export default autoInitializeDatabase;
