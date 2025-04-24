import React from 'react';
import { format, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface WeeklyCalendarMLProps {
  days: Date[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export const WeeklyCalendarML: React.FC<WeeklyCalendarMLProps> = ({
  days,
  selectedDate,
  onSelectDate,
}) => {
  const currentMonth = format(days[0], 'MMMM', { locale: ptBR });

  const todayIndex = days.findIndex((d) => isToday(d));
  const visibleDays = days.slice(Math.max(0, todayIndex - 2), todayIndex + 3);

  return (
    <div className="mb-8 bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-center text-3xl font-semibold capitalize mb-4">
        {currentMonth}
      </h2>

      <div className="flex justify-center items-center space-x-3 overflow-x-hidden">
        {visibleDays.map((day) => {
          const isCurrentDay = isToday(day);

          return (
            <div
              key={day.toISOString()}
              className={`flex flex-col items-center p-2 transition-all min-w-[60px]
                ${isCurrentDay ? 'bg-blue-500 text-white transform scale-110 shadow-md' : ''}
                ${!isCurrentDay ? 'text-gray-600' : ''}
                cursor-pointer
              `}
              onClick={() => onSelectDate(day)}
            >
              <span className={`text-xs font-medium mb-1
                ${isCurrentDay ? 'text-white' : ''}
              `}>
                {format(day, 'EEE', { locale: ptBR })}
              </span>

              <span className={`text-xl transition-all
                ${isCurrentDay ? 'font-bold text-white' : 'font-normal'}
              `}>
                {format(day, 'd')}
              </span>

              {isCurrentDay && (
                <div className="w-2 h-2 bg-white rounded-full mt-2" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
