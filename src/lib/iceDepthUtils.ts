// Pre-defined template configurations
export const SYSTEM_TEMPLATES = {
  '24-point': {
    name: '24-Point USA Hockey',
    pointCount: 24,
    points: [
      // Goal line area (top) - 4 points
      { id: 1, x: 25, y: 10, name: 'Goal Line Left' },
      { id: 2, x: 50, y: 10, name: 'Goal Line Center' },
      { id: 3, x: 75, y: 10, name: 'Goal Line Right' },
      { id: 4, x: 50, y: 15, name: 'Crease' },

      // Defensive zone (top) - 4 points
      { id: 5, x: 25, y: 22, name: 'Face-off Circle' },
      { id: 6, x: 50, y: 25, name: 'Slot' },
      { id: 7, x: 75, y: 22, name: 'Face-off Circle' },
      { id: 8, x: 50, y: 30, name: 'Hash Marks' },

      // Blue line (top) - 2 points
      { id: 9, x: 35, y: 34, name: 'Blue Line' },
      { id: 10, x: 65, y: 34, name: 'Blue Line' },

      // Neutral zone - 4 points
      { id: 11, x: 25, y: 40, name: 'Neutral Dot' },
      { id: 12, x: 50, y: 43, name: 'Neutral Center' },
      { id: 13, x: 75, y: 40, name: 'Neutral Dot' },
      { id: 14, x: 50, y: 47, name: 'Neutral Center' },

      // Center ice - 2 points
      { id: 15, x: 35, y: 50, name: 'Center Red Line' },
      { id: 16, x: 65, y: 50, name: 'Center Red Line' },

      // Blue line (bottom) - 2 points
      { id: 17, x: 35, y: 66, name: 'Blue Line' },
      { id: 18, x: 65, y: 66, name: 'Blue Line' },

      // Offensive zone (bottom) - 4 points
      { id: 19, x: 25, y: 78, name: 'Face-off Circle' },
      { id: 20, x: 50, y: 75, name: 'Slot' },
      { id: 21, x: 75, y: 78, name: 'Face-off Circle' },
      { id: 22, x: 50, y: 85, name: 'Crease' },

      // Goal line area (bottom) - 2 points
      { id: 23, x: 35, y: 90, name: 'Goal Line' },
      { id: 24, x: 65, y: 90, name: 'Goal Line' },
    ],
  },

  '35-point': {
    name: '35-Point Extended',
    pointCount: 35,
    points: [
      // More comprehensive coverage with 35 points
      // Similar structure but denser grid
      { id: 1, x: 15, y: 8 }, { id: 2, x: 35, y: 8 }, { id: 3, x: 50, y: 8 },
      { id: 4, x: 65, y: 8 }, { id: 5, x: 85, y: 8 },
      { id: 6, x: 20, y: 18 }, { id: 7, x: 40, y: 18 }, { id: 8, x: 50, y: 18 },
      { id: 9, x: 60, y: 18 }, { id: 10, x: 80, y: 18 },
      { id: 11, x: 25, y: 28 }, { id: 12, x: 40, y: 28 }, { id: 13, x: 50, y: 28 },
      { id: 14, x: 60, y: 28 }, { id: 15, x: 75, y: 28 },
      { id: 16, x: 30, y: 38 }, { id: 17, x: 45, y: 38 }, { id: 18, x: 55, y: 38 },
      { id: 19, x: 70, y: 38 },
      { id: 20, x: 25, y: 50 }, { id: 21, x: 40, y: 50 }, { id: 22, x: 50, y: 50 },
      { id: 23, x: 60, y: 50 }, { id: 24, x: 75, y: 50 },
      { id: 25, x: 30, y: 62 }, { id: 26, x: 45, y: 62 }, { id: 27, x: 55, y: 62 },
      { id: 28, x: 70, y: 62 },
      { id: 29, x: 25, y: 72 }, { id: 30, x: 40, y: 72 }, { id: 31, x: 50, y: 72 },
      { id: 32, x: 60, y: 72 }, { id: 33, x: 75, y: 72 },
      { id: 34, x: 35, y: 85 }, { id: 35, x: 65, y: 85 },
    ],
  },

  '47-point': {
    name: '47-Point Comprehensive',
    pointCount: 47,
    points: Array.from({ length: 47 }, (_, i) => ({
      id: i + 1,
      x: ((i % 7) * 15) + 10,
      y: (Math.floor(i / 7) * 12) + 8,
    })),
  },
};

// Calculate statistics from measurements
export interface IceDepthStatistics {
  min: number;
  max: number;
  avg: number;
  stdDev: number;
  minPoint?: number;
  maxPoint?: number;
  status: 'good' | 'warning' | 'critical';
}

export const calculateStatistics = (
  measurements: Record<string, number>,
  unit: 'in' | 'mm'
): IceDepthStatistics => {
  const values = Object.values(measurements).filter(v => v != null && v > 0);

  if (values.length === 0) {
    return {
      min: 0,
      max: 0,
      avg: 0,
      stdDev: 0,
      status: 'critical',
    };
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;

  // Calculate standard deviation
  const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  // Find point IDs for min/max
  const minPoint = Object.entries(measurements).find(([_, v]) => v === min)?.[0];
  const maxPoint = Object.entries(measurements).find(([_, v]) => v === max)?.[0];

  // Determine status (convert to inches for comparison)
  const avgInInches = unit === 'mm' ? avg / 25.4 : avg;
  const minInInches = unit === 'mm' ? min / 25.4 : min;

  let status: 'good' | 'warning' | 'critical' = 'good';
  if (minInInches < 1) {
    status = 'critical';
  } else if (avgInInches > 1.75 || avgInInches < 1.1) {
    status = 'warning';
  }

  return {
    min,
    max,
    avg,
    stdDev,
    minPoint: minPoint ? parseInt(minPoint.replace('Point ', '')) : undefined,
    maxPoint: maxPoint ? parseInt(maxPoint.replace('Point ', '')) : undefined,
    status,
  };
};

// Format depth value for display
export const formatDepth = (value: number, unit: 'in' | 'mm'): string => {
  if (unit === 'mm') {
    return `${value.toFixed(0)} mm`;
  }
  return `${value.toFixed(2)}"`;
};

// Convert between units
export const convertUnit = (value: number, from: 'in' | 'mm', to: 'in' | 'mm'): number => {
  if (from === to) return value;
  if (from === 'in' && to === 'mm') return value * 25.4;
  if (from === 'mm' && to === 'in') return value / 25.4;
  return value;
};
