'use client';

interface GaugeChartProps {
  value: number;
  min?: number;
  max?: number;
  label?: string;
  unit?: string;
  thresholds?: { value: number; color: string }[];
  size?: number;
}

export default function GaugeChart({ 
  value, 
  min = 0, 
  max = 100, 
  label, 
  unit = '%',
  thresholds = [
    { value: 30, color: '#ef4444' },
    { value: 60, color: '#f59e0b' },
    { value: 100, color: '#10b981' }
  ],
  size = 150
}: GaugeChartProps) {
  const percentage = Math.min(Math.max((value - min) / (max - min) * 100, 0), 100);
  
  const getColor = () => {
    for (const threshold of thresholds) {
      if (percentage <= threshold.value) {
        return threshold.color;
      }
    }
    return thresholds[thresholds.length - 1].color;
  };

  const color = getColor();
  const radius = size / 2 - 10;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size / 2 + 20} viewBox={`0 0 ${size} ${size / 2 + 20}`}>
        {/* Background arc */}
        <path
          d={`M 10 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 10} ${size / 2}`}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Value arc */}
        <path
          d={`M 10 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 10} ${size / 2}`}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
        />
        {/* Value text */}
        <text
          x={size / 2}
          y={size / 2 - 10}
          textAnchor="middle"
          className="text-2xl font-bold"
          fill="#1f2937"
        >
          {value.toFixed(1)}{unit}
        </text>
        {/* Label */}
        {label && (
          <text
            x={size / 2}
            y={size / 2 + 15}
            textAnchor="middle"
            className="text-xs fill-gray-500"
          >
            {label}
          </text>
        )}
      </svg>
    </div>
  );
}
