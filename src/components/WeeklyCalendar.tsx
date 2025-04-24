import React from 'react';
import { format, isToday, isPast, isFuture } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface WeeklyCalendarProps {
  days: Date[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({
  days,
  selectedDate,
  onSelectDate,
}) => {
  const currentMonth = format(days[0], 'MMMM', { locale: ptBR });

  return (
    <div className="mb-8 bg-white p-6 rounded-lg shadow-lg">
      {/* Mês atual centralizado */}
      <h2 className="text-center text-4xl font-semibold capitalize mb-4">
        {currentMonth}
      </h2>

      <div className="flex justify-center items-center space-x-3">
        {days.map((day) => {
          const isCurrentDay = isToday(day);
          const isPastDay = isPast(day) && !isCurrentDay;
          const isFutureDay = isFuture(day);

          return (
            <div
              key={day.toISOString()}
              className={`flex flex-col items-center p-3 rounded-xl transition-all
                ${isCurrentDay ? 'bg-blue-500 text-white transform scale-110 shadow-md' : ''}
                ${isPastDay ? 'text-gray-400' : ''}
                ${isFutureDay ? 'text-gray-600' : ''}
                ${isCurrentDay ? 'cursor-default' : 'cursor-not-allowed'}
              `}
            >
              {/* Nome do dia da semana */}
              <span className={`text-sm font-medium mb-1
                ${isPastDay ? 'text-gray-400' : ''}
                ${isCurrentDay ? 'text-white' : ''}
              `}>
                {format(day, 'EEE', { locale: ptBR })}
              </span>

              {/* Número do dia */}
              <span className={`text-2xl transition-all
                ${isCurrentDay ? 'font-bold' : 'font-normal'}
                ${isPastDay ? 'text-gray-400' : ''}
                ${isCurrentDay ? 'text-white' : ''}
              `}>
                {format(day, 'd')}
              </span>

              {/* Pontinho indicando hoje */}
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
