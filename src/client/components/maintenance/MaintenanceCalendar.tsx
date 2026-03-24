'use client';

import { useState } from 'react';
import { MaintenanceResponse } from '@/types/maintenance.types';

interface MaintenanceCalendarProps {
  records: MaintenanceResponse[];
  onDateClick?: (date: Date) => void;
}

export default function MaintenanceCalendar({ records, onDateClick }: MaintenanceCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    return { daysInMonth, startingDay };
  };

  const { daysInMonth, startingDay } = getDaysInMonth(currentDate);

  const getRecordsForDay = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return records.filter((record) => {
      const recordDate = new Date(record.scheduledDate);
      return recordDate.toDateString() === date.toDateString();
    });
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-lg border">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
            className="p-1 hover:bg-gray-100 rounded"
          >
            ←
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-2 py-1 text-sm hover:bg-gray-100 rounded"
          >
            Today
          </button>
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
            className="p-1 hover:bg-gray-100 rounded"
          >
            →
          </button>
        </div>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 border-b">
        {dayNames.map((day) => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {/* Empty cells for days before the first of the month */}
        {Array.from({ length: startingDay }).map((_, index) => (
          <div key={`empty-${index}`} className="p-2 min-h-[100px] border-b border-r bg-gray-50" />
        ))}
        
        {/* Days of the month */}
        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1;
          const dayRecords = getRecordsForDay(day);
          return (
            <div 
              key={day}
              className="p-2 min-h-[100px] border-b border-r hover:bg-gray-50 cursor-pointer"
              onClick={() => onDateClick?.(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
            >
              <span className="text-sm font-medium">{day}</span>
              <div className="mt-1 space-y-1">
                {dayRecords.slice(0, 2).map((record) => (
                  <div 
                    key={record.id}
                    className="text-xs p-1 rounded bg-blue-100 text-blue-800 truncate"
                  >
                    {record.equipment?.name || 'Maintenance'}
                  </div>
                ))}
                {dayRecords.length > 2 && (
                  <div className="text-xs text-gray-500">
                    +{dayRecords.length - 2} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
