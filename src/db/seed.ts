/**
 * Database Seed
 * Populate database with dummy data for testing
 */

import { db } from './database';

const generateId = () => Math.random().toString(36).substring(2, 15);
const now = new Date().toISOString();

export const seedDatabase = async () => {
  console.log('[Seed] Starting database seed...');

  try {
    // Create users from web app database
    const users = [
      {
        id: 'cmh1rmkaq000c0fifq9x1amtv',
        email: 'saad@gmail.com',
        fullName: 'Saad Ahmed',
        username: 'saad',
        password: 'Password123!', // Plain text for mobile demo
        phoneNumber: '+1 (416) 555-0101',
      },
      {
        id: 'cmh28pw6l00020frbcy2s2v51',
        email: 'john@gmail.com',
        fullName: 'John Smith',
        username: 'john',
        password: 'Password123!',
        phoneNumber: '+1 (647) 555-0201',
      },
      {
        id: 'cmh1r7eh100000fuw6ixzrjr9',
        email: 'a@b.com',
        fullName: 'ABC',
        username: 'abc',
        password: 'Password123!',
        phoneNumber: '+1-555-0123',
      },
    ];

    for (const user of users) {
      await db.runAsync(
        `INSERT OR REPLACE INTO user (id, email, fullName, username, password, emailVerified, profileComplete, phoneNumber, dateOfBirth, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user.id,
          user.email,
          user.fullName,
          user.username,
          user.password,
          1, // emailVerified
          1, // profileComplete
          user.phoneNumber,
          '1990-01-01',
          now,
          now,
        ]
      );
    }
    console.log(`[Seed] ${users.length} users created`);

    // Use first user for demo data
    const userId = users[0].id;

    // Create subscription
    const subscriptionId = 'sub-demo-001';
    await db.runAsync(
      `INSERT INTO subscription (id, userId, plan, status, currentPeriodStart, currentPeriodEnd, cancelAtPeriodEnd, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        subscriptionId,
        userId,
        'monthly',
        'active',
        new Date('2025-01-01').toISOString(),
        new Date('2025-02-01').toISOString(),
        0,
        now,
        now,
      ]
    );
    console.log('[Seed] Subscription created');

    // Create medical profile
    const medicalProfileId = 'med-profile-001';
    await db.runAsync(
      `INSERT INTO medical_profile (id, userId, bloodType, height, weight, organDonor, notes, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        medicalProfileId,
        userId,
        'O+',
        175.5,
        75.0,
        1,
        'Patient is generally healthy with regular checkups.',
        now,
        now,
      ]
    );
    console.log('[Seed] Medical profile created');

    // Create medical conditions
    const conditions = [
      {
        id: generateId(),
        name: 'Type 2 Diabetes',
        diagnosedDate: '2020-03-15',
        severity: 'moderate',
        notes: 'Managed with diet and medication',
      },
      {
        id: generateId(),
        name: 'Hypertension',
        diagnosedDate: '2019-11-20',
        severity: 'mild',
        notes: 'Controlled with medication',
      },
      {
        id: generateId(),
        name: 'Asthma',
        diagnosedDate: '2010-05-10',
        severity: 'mild',
        notes: 'Exercise-induced, uses rescue inhaler',
      },
    ];

    for (const condition of conditions) {
      await db.runAsync(
        `INSERT INTO medical_conditions (id, medicalProfileId, name, diagnosedDate, severity, notes, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          condition.id,
          medicalProfileId,
          condition.name,
          condition.diagnosedDate,
          condition.severity,
          condition.notes,
          now,
        ]
      );
    }
    console.log('[Seed] Medical conditions created');

    // Create allergies
    const allergies = [
      {
        id: generateId(),
        allergen: 'Penicillin',
        reaction: 'Severe rash and difficulty breathing',
        severity: 'severe',
      },
      {
        id: generateId(),
        allergen: 'Peanuts',
        reaction: 'Anaphylaxis',
        severity: 'severe',
      },
      {
        id: generateId(),
        allergen: 'Shellfish',
        reaction: 'Hives and swelling',
        severity: 'moderate',
      },
      {
        id: generateId(),
        allergen: 'Latex',
        reaction: 'Contact dermatitis',
        severity: 'mild',
      },
    ];

    for (const allergy of allergies) {
      await db.runAsync(
        `INSERT INTO allergies (id, medicalProfileId, allergen, reaction, severity, createdAt)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          allergy.id,
          medicalProfileId,
          allergy.allergen,
          allergy.reaction,
          allergy.severity,
          now,
        ]
      );
    }
    console.log('[Seed] Allergies created');

    // Create medications
    const medications = [
      {
        id: generateId(),
        name: 'Metformin',
        dosage: '500mg',
        frequency: 'Twice daily',
        prescribedBy: 'Dr. Sarah Johnson',
        startDate: '2020-03-20',
        notes: 'Take with meals',
      },
      {
        id: generateId(),
        name: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily',
        prescribedBy: 'Dr. Michael Chen',
        startDate: '2019-12-01',
        notes: 'Take in the morning',
      },
      {
        id: generateId(),
        name: 'Albuterol Inhaler',
        dosage: '90mcg',
        frequency: 'As needed',
        prescribedBy: 'Dr. Emily Rodriguez',
        startDate: '2010-06-15',
        notes: 'Use before exercise or when symptoms occur',
      },
      {
        id: generateId(),
        name: 'Aspirin',
        dosage: '81mg',
        frequency: 'Once daily',
        prescribedBy: 'Dr. Sarah Johnson',
        startDate: '2021-01-10',
        notes: 'Low-dose for heart health',
      },
    ];

    for (const medication of medications) {
      await db.runAsync(
        `INSERT INTO medications (id, medicalProfileId, name, dosage, frequency, prescribedBy, startDate, notes, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          medication.id,
          medicalProfileId,
          medication.name,
          medication.dosage,
          medication.frequency,
          medication.prescribedBy,
          medication.startDate,
          medication.notes,
          now,
        ]
      );
    }
    console.log('[Seed] Medications created');

    // Create emergency contacts
    const contacts = [
      {
        id: generateId(),
        name: 'Jane Doe',
        relationship: 'Spouse',
        phone: '+1-555-0124',
        email: 'jane.doe@example.com',
        isPrimary: 1,
      },
      {
        id: generateId(),
        name: 'Robert Doe',
        relationship: 'Son',
        phone: '+1-555-0125',
        email: 'robert.doe@example.com',
        isPrimary: 0,
      },
      {
        id: generateId(),
        name: 'Mary Smith',
        relationship: 'Sister',
        phone: '+1-555-0126',
        email: 'mary.smith@example.com',
        isPrimary: 0,
      },
      {
        id: generateId(),
        name: 'Dr. Sarah Johnson',
        relationship: 'Primary Care Physician',
        phone: '+1-555-0127',
        email: 'dr.johnson@medicalcenter.com',
        isPrimary: 0,
      },
    ];

    for (const contact of contacts) {
      await db.runAsync(
        `INSERT INTO emergency_contacts (id, userId, name, relationship, phone, email, isPrimary, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          contact.id,
          userId,
          contact.name,
          contact.relationship,
          contact.phone,
          contact.email,
          contact.isPrimary,
          now,
        ]
      );
    }
    console.log('[Seed] Emergency contacts created');

    // Create bracelet
    const braceletId = 'bracelet-demo-001';
    const nfcId = 'NFC-MG-2024-001234';
    await db.runAsync(
      `INSERT INTO bracelet (id, userId, nfcId, status, linkedDate, lastAccessed, accessCount, qrCodeUrl, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        braceletId,
        userId,
        nfcId,
        'active',
        new Date('2024-12-01').toISOString(),
        new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        15,
        `https://medguard.app/emergency/${userId}?nfc=${nfcId}`,
        now,
        now,
      ]
    );
    console.log('[Seed] Bracelet created');

    // Create bracelet access logs
    const accessLogs = [
      {
        id: generateId(),
        accessedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        location: 'Emergency Room, City Hospital',
        ipAddress: '192.168.1.100',
      },
      {
        id: generateId(),
        accessedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        location: 'Urgent Care Center',
        ipAddress: '192.168.1.101',
      },
      {
        id: generateId(),
        accessedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
        location: 'Paramedic Unit #5',
        ipAddress: '192.168.1.102',
      },
    ];

    for (const log of accessLogs) {
      await db.runAsync(
        `INSERT INTO bracelet_access (id, braceletId, accessedAt, location, ipAddress)
         VALUES (?, ?, ?, ?, ?)`,
        [log.id, braceletId, log.accessedAt, log.location, log.ipAddress]
      );
    }
    console.log('[Seed] Bracelet access logs created');

    // Create invoices
    const invoices = [
      {
        id: generateId(),
        amount: 9.99,
        status: 'paid',
        invoiceDate: '2025-01-01',
        paidAt: '2025-01-01',
      },
      {
        id: generateId(),
        amount: 9.99,
        status: 'paid',
        invoiceDate: '2024-12-01',
        paidAt: '2024-12-01',
      },
      {
        id: generateId(),
        amount: 9.99,
        status: 'paid',
        invoiceDate: '2024-11-01',
        paidAt: '2024-11-02',
      },
      {
        id: generateId(),
        amount: 9.99,
        status: 'paid',
        invoiceDate: '2024-10-01',
        paidAt: '2024-10-01',
      },
      {
        id: generateId(),
        amount: 9.99,
        status: 'paid',
        invoiceDate: '2024-09-01',
        paidAt: '2024-09-03',
      },
      {
        id: generateId(),
        amount: 9.99,
        status: 'paid',
        invoiceDate: '2024-08-01',
        paidAt: '2024-08-01',
      },
    ];

    for (const invoice of invoices) {
      await db.runAsync(
        `INSERT INTO invoices (id, userId, subscriptionId, amount, currency, status, invoiceDate, dueDate, paidAt, invoiceUrl, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          invoice.id,
          userId,
          subscriptionId,
          invoice.amount,
          'CAD',
          invoice.status,
          invoice.invoiceDate,
          invoice.invoiceDate,
          invoice.paidAt,
          `https://medguard.app/invoices/${invoice.id}.pdf`,
          now,
        ]
      );
    }
    console.log('[Seed] Invoices created');

    // Create activity logs
    const activities = [
      {
        id: generateId(),
        type: 'scan',
        description: 'Emergency profile accessed via NFC',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        metadata: JSON.stringify({ location: 'Emergency Room, City Hospital' }),
      },
      {
        id: generateId(),
        type: 'update',
        description: 'Medical profile updated',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: JSON.stringify({ field: 'medications' }),
      },
      {
        id: generateId(),
        type: 'scan',
        description: 'Emergency profile accessed via QR code',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: JSON.stringify({ location: 'Urgent Care Center' }),
      },
      {
        id: generateId(),
        type: 'login',
        description: 'User logged in',
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: JSON.stringify({ device: 'iPhone 15 Pro' }),
      },
      {
        id: generateId(),
        type: 'update',
        description: 'Emergency contact added',
        timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: JSON.stringify({ contactName: 'Dr. Sarah Johnson' }),
      },
      {
        id: generateId(),
        type: 'scan',
        description: 'Emergency profile accessed via NFC',
        timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: JSON.stringify({ location: 'Paramedic Unit #5' }),
      },
    ];

    for (const activity of activities) {
      await db.runAsync(
        `INSERT INTO activity_logs (id, userId, type, description, timestamp, metadata)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          activity.id,
          userId,
          activity.type,
          activity.description,
          activity.timestamp,
          activity.metadata,
        ]
      );
    }
    console.log('[Seed] Activity logs created');

    console.log('[Seed] Database seeding completed successfully!');
    return true;
  } catch (error) {
    console.error('[Seed] Error seeding database:', error);
    throw error;
  }
};
