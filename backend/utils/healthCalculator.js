const calculateEquipmentHealth = (equipment, workOrders = [], downtimeList = []) => {
  let score = 100;

  if (equipment.status === 'Breakdown') {
    return 20;
  }
  if (equipment.status === 'Under Maintenance') {
    return 50;
  }
  if (equipment.status === 'Inactive' || equipment.status === 'Retired') {
    return 0;
  }

  const recentDowntimes = downtimeList.filter(
    (d) => new Date(d.startTime) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  );
  const totalDowntimeHours = recentDowntimes.reduce((sum, d) => sum + (d.durationHours || 0), 0);
  if (totalDowntimeHours > 100) {
    score -= 30;
  } else if (totalDowntimeHours > 40) {
    score -= 15;
  } else if (totalDowntimeHours > 10) {
    score -= 5;
  }

  const openCriticalOrders = workOrders.filter(
    (w) => w.priority === 'Critical' && w.status !== 'Completed' && w.status !== 'Cancelled'
  );
  if (openCriticalOrders.length > 0) {
    score -= 25;
  }

  const openHighOrders = workOrders.filter(
    (w) => w.priority === 'High' && w.status !== 'Completed' && w.status !== 'Cancelled'
  );
  if (openHighOrders.length > 0) {
    score -= 10;
  }

  if (equipment.nextServiceDate && new Date(equipment.nextServiceDate) < new Date()) {
    score -= 15;
  }

  return Math.max(10, Math.min(100, Math.round(score)));
};

const calculateTyreHealth = (tyre) => {
  if (tyre.status === 'Scrapped' || tyre.status === 'Retired') {
    return 0;
  }
  if (tyre.status === 'Under Repair') {
    return 35;
  }

  let score = 100;

  const treadRatio = tyre.initialTreadDepth > 0 ? tyre.currentTreadDepth / tyre.initialTreadDepth : 1;
  if (treadRatio < 0.2 || tyre.currentTreadDepth < 15) {
    score -= 40;
  } else if (treadRatio < 0.4) {
    score -= 25;
  } else if (treadRatio < 0.6) {
    score -= 10;
  }

  const pressureDev = tyre.recommendedPressure > 0 ? Math.abs(tyre.currentPressure - tyre.recommendedPressure) / tyre.recommendedPressure : 0;
  if (pressureDev > 0.2) {
    score -= 25;
  } else if (pressureDev > 0.1) {
    score -= 10;
  }

  if (tyre.condition === 'Critical') {
    score -= 40;
  } else if (tyre.condition === 'Poor') {
    score -= 25;
  } else if (tyre.condition === 'Fair') {
    score -= 10;
  }

  return Math.max(10, Math.min(100, Math.round(score)));
};

const calculateMTBF = (totalOperatingHours, numberOfFailures) => {
  if (!numberOfFailures || numberOfFailures === 0) {
    return totalOperatingHours || 0;
  }
  return parseFloat((totalOperatingHours / numberOfFailures).toFixed(1));
};

const calculateMTTR = (totalDowntimeHours, numberOfRepairs) => {
  if (!numberOfRepairs || numberOfRepairs === 0) {
    return 0;
  }
  return parseFloat((totalDowntimeHours / numberOfRepairs).toFixed(1));
};

module.exports = {
  calculateEquipmentHealth,
  calculateTyreHealth,
  calculateMTBF,
  calculateMTTR
};
