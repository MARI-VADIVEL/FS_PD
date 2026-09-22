const assert = require('assert');
const bcrypt = require('bcryptjs');
const { generateToken, verifyToken } = require('../utils/tokenUtils');
const { calculateEquipmentHealth, calculateTyreHealth, calculateMTBF, calculateMTTR } = require('../utils/healthCalculator');
const { formatCurrency, formatDate } = require('../utils/formatters');

const runTests = async () => {
  const token = generateToken('user123', 'Super Admin');
  assert(typeof token === 'string' && token.length > 20, 'Token generation failed');

  const decoded = verifyToken(token);
  assert.strictEqual(decoded.id, 'user123', 'Token verification user ID mismatch');
  assert.strictEqual(decoded.role, 'Super Admin', 'Token verification role mismatch');

  const plainPass = 'MiningPass@2026';
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(plainPass, salt);
  const isMatch = await bcrypt.compare(plainPass, hash);
  assert.strictEqual(isMatch, true, 'Bcrypt password comparison failed');

  const activeEquip = { status: 'Active', nextServiceDate: new Date(Date.now() + 100000000) };
  const healthActive = calculateEquipmentHealth(activeEquip, [], []);
  assert(healthActive >= 90, 'Active equipment should have high health score');

  const breakdownEquip = { status: 'Breakdown' };
  const healthBreakdown = calculateEquipmentHealth(breakdownEquip, [], []);
  assert.strictEqual(healthBreakdown, 20, 'Breakdown equipment should have score 20');

  const healthyTyre = {
    status: 'Installed',
    initialTreadDepth: 95,
    currentTreadDepth: 90,
    recommendedPressure: 102,
    currentPressure: 102,
    condition: 'Excellent'
  };
  const tyreScore = calculateTyreHealth(healthyTyre);
  assert(tyreScore >= 95, 'Healthy tyre score should be >= 95');

  const criticalTyre = {
    status: 'Installed',
    initialTreadDepth: 95,
    currentTreadDepth: 12,
    recommendedPressure: 102,
    currentPressure: 80,
    condition: 'Critical'
  };
  const criticalTyreScore = calculateTyreHealth(criticalTyre);
  assert(criticalTyreScore <= 30, 'Critical tyre score should be <= 30');

  const mtbf = calculateMTBF(10000, 4);
  assert.strictEqual(mtbf, 2500, 'MTBF calculation mismatch');

  const mttr = calculateMTTR(20, 4);
  assert.strictEqual(mttr, 5, 'MTTR calculation mismatch');

  const inrFormatted = formatCurrency(50000, 'INR');
  assert(inrFormatted.includes('50,000'), 'Currency formatting INR mismatch');

  const formattedDate = formatDate('2026-09-05T00:00:00.000Z');
  assert.strictEqual(formattedDate, '2026-09-05', 'Date formatting mismatch');

  process.exit(0);
};

runTests().catch(() => {
  process.exit(1);
});
