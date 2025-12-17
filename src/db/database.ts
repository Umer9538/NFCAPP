/**
 * SQLite Database Setup
 * Local database for the MedGuard app
 */

import * as SQLite from 'expo-sqlite';

const DB_NAME = 'medguard.db';

// Initialize database
export const db = SQLite.openDatabaseSync(DB_NAME);

/**
 * Initialize database schema
 */
export const initDatabase = async () => {
  console.log('[Database] Initializing database schema...');

  try {
    // Enable foreign keys
    await db.execAsync('PRAGMA foreign_keys = ON;');

    // Create Users table (matching web app schema)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS user (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        fullName TEXT NOT NULL,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        emailVerified INTEGER DEFAULT 1,
        twoFactorEnabled INTEGER DEFAULT 0,
        profileComplete INTEGER DEFAULT 1,
        phoneNumber TEXT,
        gender TEXT,
        dateOfBirth TEXT,
        address TEXT,
        city TEXT,
        province TEXT,
        postalCode TEXT,
        height TEXT,
        profilePicture TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
    `);

    // Create Subscription table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS subscription (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        plan TEXT NOT NULL,
        status TEXT NOT NULL,
        currentPeriodStart TEXT NOT NULL,
        currentPeriodEnd TEXT NOT NULL,
        cancelAtPeriodEnd INTEGER DEFAULT 0,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES user(id)
      );
    `);

    // Create Medical Profile table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS medical_profile (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        bloodType TEXT,
        height REAL,
        weight REAL,
        organDonor INTEGER DEFAULT 0,
        notes TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES user(id)
      );
    `);

    // Create Medical Conditions table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS medical_conditions (
        id TEXT PRIMARY KEY,
        medicalProfileId TEXT NOT NULL,
        name TEXT NOT NULL,
        diagnosedDate TEXT,
        severity TEXT,
        notes TEXT,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (medicalProfileId) REFERENCES medical_profile(id)
      );
    `);

    // Create Allergies table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS allergies (
        id TEXT PRIMARY KEY,
        medicalProfileId TEXT NOT NULL,
        allergen TEXT NOT NULL,
        reaction TEXT,
        severity TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (medicalProfileId) REFERENCES medical_profile(id)
      );
    `);

    // Create Medications table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS medications (
        id TEXT PRIMARY KEY,
        medicalProfileId TEXT NOT NULL,
        name TEXT NOT NULL,
        dosage TEXT,
        frequency TEXT,
        prescribedBy TEXT,
        startDate TEXT,
        notes TEXT,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (medicalProfileId) REFERENCES medical_profile(id)
      );
    `);

    // Create Emergency Contacts table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS emergency_contacts (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        name TEXT NOT NULL,
        relationship TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT,
        isPrimary INTEGER DEFAULT 0,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES user(id)
      );
    `);

    // Create Bracelet table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS bracelet (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        nfcId TEXT UNIQUE NOT NULL,
        status TEXT NOT NULL,
        linkedDate TEXT NOT NULL,
        lastAccessed TEXT,
        accessCount INTEGER DEFAULT 0,
        qrCodeUrl TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES user(id)
      );
    `);

    // Create Bracelet Access Logs table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS bracelet_access (
        id TEXT PRIMARY KEY,
        braceletId TEXT NOT NULL,
        accessedAt TEXT NOT NULL,
        location TEXT,
        ipAddress TEXT,
        FOREIGN KEY (braceletId) REFERENCES bracelet(id)
      );
    `);

    // Create Invoices table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS invoices (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        subscriptionId TEXT,
        amount REAL NOT NULL,
        currency TEXT NOT NULL,
        status TEXT NOT NULL,
        invoiceDate TEXT NOT NULL,
        dueDate TEXT,
        paidAt TEXT,
        invoiceUrl TEXT,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES user(id),
        FOREIGN KEY (subscriptionId) REFERENCES subscription(id)
      );
    `);

    // Create Activity Logs table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        type TEXT NOT NULL,
        description TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        metadata TEXT,
        FOREIGN KEY (userId) REFERENCES user(id)
      );
    `);

    console.log('[Database] Schema initialized successfully');
    return true;
  } catch (error) {
    console.error('[Database] Error initializing schema:', error);
    throw error;
  }
};

/**
 * Get database statistics
 */
export const getDatabaseStats = async () => {
  try {
    const stats: any = {};

    const tables = [
      'user',
      'subscription',
      'medical_profile',
      'medical_conditions',
      'allergies',
      'medications',
      'emergency_contacts',
      'bracelet',
      'bracelet_access',
      'invoices',
      'activity_logs',
    ];

    for (const table of tables) {
      const result = await db.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM ${table}`
      );
      stats[table] = result?.count || 0;
    }

    return stats;
  } catch (error) {
    console.error('[Database] Error getting stats:', error);
    return {};
  }
};

/**
 * Clear all data (for testing)
 */
export const clearAllData = async () => {
  try {
    await db.execAsync(`
      DELETE FROM activity_logs;
      DELETE FROM invoices;
      DELETE FROM bracelet_access;
      DELETE FROM emergency_contacts;
      DELETE FROM medications;
      DELETE FROM allergies;
      DELETE FROM medical_conditions;
      DELETE FROM medical_profile;
      DELETE FROM bracelet;
      DELETE FROM subscription;
      DELETE FROM user;
    `);
    console.log('[Database] All data cleared');
    return true;
  } catch (error) {
    console.error('[Database] Error clearing data:', error);
    return false;
  }
};

/**
 * Reset database - Drop all tables and recreate schema
 */
export const resetDatabase = async () => {
  try {
    console.log('[Database] Dropping all tables...');

    // Drop tables in reverse order of dependencies
    await db.execAsync(`
      DROP TABLE IF EXISTS activity_logs;
      DROP TABLE IF EXISTS invoices;
      DROP TABLE IF EXISTS bracelet_access;
      DROP TABLE IF EXISTS bracelet;
      DROP TABLE IF EXISTS emergency_contacts;
      DROP TABLE IF EXISTS medications;
      DROP TABLE IF EXISTS allergies;
      DROP TABLE IF EXISTS medical_conditions;
      DROP TABLE IF EXISTS medical_profile;
      DROP TABLE IF EXISTS subscription;
      DROP TABLE IF EXISTS user;
    `);

    console.log('[Database] Tables dropped successfully');

    // Reinitialize schema
    await initDatabase();

    console.log('[Database] Database reset completed');
    return true;
  } catch (error) {
    console.error('[Database] Error resetting database:', error);
    return false;
  }
};

export default db;
