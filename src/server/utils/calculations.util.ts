/**
 * Calculate equipment utilization percentage
 */
export const calculateUtilization = (
  hoursOperated: number,
  totalHoursAvailable: number
): number => {
  if (totalHoursAvailable === 0) return 0;
  return Math.round((hoursOperated / totalHoursAvailable) * 100 * 100) / 100;
};

/**
 * Calculate fuel efficiency (liters per hour)
 */
export const calculateFuelEfficiency = (
  fuelConsumed: number,
  hoursOperated: number
): number => {
  if (hoursOperated === 0) return 0;
  return Math.round((fuelConsumed / hoursOperated) * 100) / 100;
};

/**
 * Calculate cost per hour
 */
export const calculateCostPerHour = (
  totalCost: number,
  hoursOperated: number
): number => {
  if (hoursOperated === 0) return 0;
  return Math.round((totalCost / hoursOperated) * 100) / 100;
};

/**
 * Calculate Mean Time Between Failures (MTBF)
 */
export const calculateMTBF = (
  totalOperatingHours: number,
  numberOfFailures: number
): number => {
  if (numberOfFailures === 0) return totalOperatingHours;
  return Math.round((totalOperatingHours / numberOfFailures) * 100) / 100;
};

/**
 * Calculate Mean Time To Repair (MTTR)
 */
export const calculateMTTR = (
  totalDowntimeHours: number,
  numberOfRepairs: number
): number => {
  if (numberOfRepairs === 0) return 0;
  return Math.round((totalDowntimeHours / numberOfRepairs) * 100) / 100;
};

/**
 * Calculate equipment availability
 */
export const calculateAvailability = (
  uptime: number,
  totalTime: number
): number => {
  if (totalTime === 0) return 0;
  return Math.round((uptime / totalTime) * 100 * 100) / 100;
};

/**
 * Calculate production rate (tonnes per hour)
 */
export const calculateProductionRate = (
  tonnesProduced: number,
  hoursOperated: number
): number => {
  if (hoursOperated === 0) return 0;
  return Math.round((tonnesProduced / hoursOperated) * 100) / 100;
};

/**
 * Calculate ore grade recovery
 */
export const calculateRecovery = (
  actualGrade: number,
  theoreticalGrade: number
): number => {
  if (theoreticalGrade === 0) return 0;
  return Math.round((actualGrade / theoreticalGrade) * 100 * 100) / 100;
};

/**
 * Calculate fuel cost
 */
export const calculateFuelCost = (
  liters: number,
  costPerLiter: number
): number => {
  return Math.round(liters * costPerLiter * 100) / 100;
};

/**
 * Calculate maintenance cost per hour
 */
export const calculateMaintenanceCostPerHour = (
  totalMaintenanceCost: number,
  operatingHours: number
): number => {
  if (operatingHours === 0) return 0;
  return Math.round((totalMaintenanceCost / operatingHours) * 100) / 100;
};

/**
 * Calculate percentage change
 */
export const calculatePercentageChange = (
  oldValue: number,
  newValue: number
): number => {
  if (oldValue === 0) return newValue === 0 ? 0 : 100;
  return Math.round(((newValue - oldValue) / oldValue) * 100 * 100) / 100;
};

/**
 * Calculate moving average
 */
export const calculateMovingAverage = (
  values: number[],
  period: number
): number[] => {
  if (values.length < period) return values;

  const result: number[] = [];
  for (let i = period - 1; i < values.length; i++) {
    const sum = values.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
    result.push(Math.round((sum / period) * 100) / 100);
  }
  return result;
};

/**
 * Calculate standard deviation
 */
export const calculateStandardDeviation = (values: number[]): number => {
  if (values.length === 0) return 0;

  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map((value) => Math.pow(value - mean, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;

  return Math.round(Math.sqrt(variance) * 100) / 100;
};

/**
 * Calculate equipment operating cost
 */
export const calculateOperatingCost = (params: {
  fuelCost: number;
  maintenanceCost: number;
  laborCost: number;
  otherCosts?: number;
}): number => {
  const total =
    params.fuelCost +
    params.maintenanceCost +
    params.laborCost +
    (params.otherCosts || 0);

  return Math.round(total * 100) / 100;
};

/**
 * Calculate ROI (Return on Investment)
 */
export const calculateROI = (
  gain: number,
  cost: number
): number => {
  if (cost === 0) return 0;
  return Math.round(((gain - cost) / cost) * 100 * 100) / 100;
};

/**
 * Calculate fleet efficiency score (0-100)
 */
export const calculateFleetEfficiency = (params: {
  utilization: number;
  availability: number;
  performance: number;
}): number => {
  const score = (params.utilization + params.availability + params.performance) / 3;
  return Math.round(score * 100) / 100;
};

/**
 * Calculate Overall Equipment Effectiveness (OEE)
 */
export const calculateOEE = (
  availability: number,
  performance: number,
  quality: number
): number => {
  return Math.round((availability * performance * quality) / 10000 * 100) / 100;
};

/**
 * Calculate blast efficiency
 */
export const calculateBlastEfficiency = (
  actualTonnage: number,
  plannedTonnage: number
): number => {
  if (plannedTonnage === 0) return 0;
  return Math.round((actualTonnage / plannedTonnage) * 100 * 100) / 100;
};

/**
 * Calculate safety incident rate (per 200,000 hours)
 */
export const calculateIncidentRate = (
  numberOfIncidents: number,
  totalHoursWorked: number
): number => {
  if (totalHoursWorked === 0) return 0;
  return Math.round((numberOfIncidents * 200000) / totalHoursWorked * 100) / 100;
};

/**
 * Round to decimal places
 */
export const roundToDecimal = (value: number, decimals: number = 2): number => {
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
};

/**
 * Calculate weighted average
 */
export const calculateWeightedAverage = (
  values: number[],
  weights: number[]
): number => {
  if (values.length !== weights.length || values.length === 0) return 0;

  const totalWeight = weights.reduce((a, b) => a + b, 0);
  if (totalWeight === 0) return 0;

  const weightedSum = values.reduce(
    (sum, value, index) => sum + value * weights[index],
    0
  );

  return Math.round((weightedSum / totalWeight) * 100) / 100;
};