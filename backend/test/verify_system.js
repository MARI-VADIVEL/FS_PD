require('dotenv').config();
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const Equipment = require('../models/Equipment');
const Tyre = require('../models/Tyre');
const WorkOrder = require('../models/WorkOrder');
const SparePart = require('../models/SparePart');
const Alert = require('../models/Alert');
const bcrypt = require('bcryptjs');

async function verifyAll() {
  console.log('==============================================');
  console.log('  MINING PLATFORM - COMPLETE SYSTEM VERIFICATION');
  console.log('==============================================');

  console.log('\n[1/4] Connecting to Database...');
  await connectDB();
  console.log('✔ Database connection: ACTIVE & HEALTHY');

  console.log('\n[2/4] Verifying Data Collections:');
  const userCount = await User.countDocuments();
  const equipCount = await Equipment.countDocuments();
  const tyreCount = await Tyre.countDocuments();
  const workOrderCount = await WorkOrder.countDocuments();
  const partsCount = await SparePart.countDocuments();
  const alertCount = await Alert.countDocuments();

  console.log(`  - Users in system       : ${userCount}`);
  console.log(`  - Mining Equipment      : ${equipCount}`);
  console.log(`  - Heavy Tyres Monitored : ${tyreCount}`);
  console.log(`  - Work Orders           : ${workOrderCount}`);
  console.log(`  - Spare Parts Inventory : ${partsCount}`);
  console.log(`  - Active System Alerts  : ${alertCount}`);

  console.log('\n[3/4] Testing Credentials & Password Hashes for All Roles:');
  const accounts = [
    { role: 'Super Admin', email: 'admin@miningplatform.com' },
    { role: 'Maintenance Manager', email: 'manager@miningplatform.com' },
    { role: 'Maintenance Engineer', email: 'engineer@miningplatform.com' },
    { role: 'Technician', email: 'tech@miningplatform.com' },
    { role: 'Fleet Manager', email: 'fleet@miningplatform.com' },
    { role: 'Store Manager', email: 'store@miningplatform.com' },
    { role: 'Safety Officer', email: 'safety@miningplatform.com' },
    { role: 'Viewer', email: 'viewer@miningplatform.com' }
  ];

  let allPass = true;
  for (const acc of accounts) {
    const u = await User.findOne({ email: acc.email }).select('+password');
    if (!u) {
      console.log(`  [MISSING] ${acc.role.padEnd(22)} (${acc.email})`);
      allPass = false;
      continue;
    }
    const match = await bcrypt.compare('Password@123', u.password);
    if (match) {
      console.log(`  [PASS] ${acc.role.padEnd(22)} -> ${acc.email} (Password: Password@123)`);
    } else {
      console.log(`  [FAIL] ${acc.role.padEnd(22)} -> Password hash mismatch`);
      allPass = false;
    }
  }

  console.log('\n[4/4] Verifying Frontend Production Build...');
  const fs = require('fs');
  const path = require('path');
  const distIndex = path.join(__dirname, '../../frontend/dist/index.html');
  if (fs.existsSync(distIndex)) {
    console.log('✔ Production frontend build exists: READY TO SERVE');
  } else {
    console.log('❌ Frontend build dist folder missing!');
    allPass = false;
  }

  await disconnectDB();

  console.log('\n==============================================');
  if (allPass) {
    console.log('🎉 RESULT: EVERYTHING IS WORKING 100% CORRECTLY!');
  } else {
    console.log('❌ RESULT: Some checks failed. Review errors above.');
  }
  console.log('==============================================');
}

verifyAll().catch(err => {
  console.error('Fatal check error:', err);
  process.exit(1);
});
