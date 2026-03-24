'use client';

import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

interface BarChartProps {
  data: any[];
  xKey: string;
  yKey: string;
  color?: string;
  height?: number;
  layout?: 'horizontal' | 'vertical';
  title?: string;
}

export default function BarChart({ data, xKey, yKey, color = '#3b82f6', height = 300, layout = 'horizontal', title }: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <>
        {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
        <RechartsBarChart 
          data={data} 
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          layout={layout}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          {layout === 'horizontal' ? (
            <>
              <XAxis dataKey={xKey} stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
            </>
          ) : (
            <>
              <XAxis type="number" stroke="#6b7280" fontSize={12} />
              <YAxis type="category" dataKey={xKey} stroke="#6b7280" fontSize={12} width={100} />
            </>
          )}
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e5e7eb', 
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Legend />
          <Bar dataKey={yKey} fill={color} radius={[4, 4, 0, 0]} />
        </RechartsBarChart>
      </>
    </ResponsiveContainer>
  );
}

export { BarChart };
