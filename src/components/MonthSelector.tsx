import React, { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

interface MonthSelectorProps {
  currentDate: Date;
  onMonthChange: (date: Date) => void;
}

export const MonthSelector: React.FC<MonthSelectorProps> = ({ currentDate, onMonthChange }) => {
  const [showSelect, setShowSelect] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const handlePreviousMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1);
    onMonthChange(newDate);
    setSelectedMonth(newDate.getMonth());
    setSelectedYear(newDate.getFullYear());
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1);
    onMonthChange(newDate);
    setSelectedMonth(newDate.getMonth());
    setSelectedYear(newDate.getFullYear());
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const month = parseInt(e.target.value);
    setSelectedMonth(month);
    const newDate = new Date(selectedYear, month);
    onMonthChange(newDate);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const year = parseInt(e.target.value);
    setSelectedYear(year);
    const newDate = new Date(year, selectedMonth);
    if (year === currentYear && selectedMonth > currentMonth) {
      onMonthChange(new Date(year, currentMonth)); // trava no mês atual
      setSelectedMonth(currentMonth);
    } else {
      onMonthChange(newDate);
    }
  };

  const years = Array.from({ length: 5 }, (_, i) => currentYear - 4 + i);

  return (
    <div className="flex flex-col items-center space-y-2 mb-6">
      <div className="flex items-center space-x-4">
        <button onClick={handlePreviousMonth} className="p-2 hover:bg-gray-100 rounded-full">
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={() => setShowSelect((prev) => !prev)}
          className="flex items-center space-x-1 cursor-pointer hover:underline"
        >
          <span className="text-base uppercase font-semibold">
            {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
          </span>
          <ChevronDown className="w-4 h-4 mt-0.5" />
        </button>

        <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded-full">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {showSelect && (
        <div className="flex space-x-2">
          <select
            className="p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 capitalize bg-white text-gray-700"
            value={selectedMonth}
            onChange={handleMonthChange}
          >
            {Array.from({ length: 12 }, (_, month) => {
              const disabled =
                selectedYear === currentYear && month > currentMonth;
              return (
                <option key={month} value={month} disabled={disabled}>
                  {format(new Date(0, month), 'MMMM', { locale: ptBR })}
                </option>
              );
            })}
          </select>

          <select
            className="p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700"
            value={selectedYear}
            onChange={handleYearChange}
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};
