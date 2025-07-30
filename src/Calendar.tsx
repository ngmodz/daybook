interface CalendarProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  currentMonth: { year: number; month: number };
  onMonthChange: (month: { year: number; month: number }) => void;
  entriesWithTasks: string[];
}

export function Calendar({ 
  selectedDate, 
  onDateSelect, 
  currentMonth, 
  onMonthChange,
  entriesWithTasks 
}: CalendarProps) {
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month - 1, 1).getDay();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = direction === 'prev' 
      ? currentMonth.month === 1 
        ? { year: currentMonth.year - 1, month: 12 }
        : { year: currentMonth.year, month: currentMonth.month - 1 }
      : currentMonth.month === 12
        ? { year: currentMonth.year + 1, month: 1 }
        : { year: currentMonth.year, month: currentMonth.month + 1 };
    
    onMonthChange(newMonth);
  };

  const daysInMonth = getDaysInMonth(currentMonth.year, currentMonth.month);
  const firstDay = getFirstDayOfMonth(currentMonth.year, currentMonth.month);
  const today = new Date().toISOString().split('T')[0];

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigateMonth('prev')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 className="text-xl font-semibold text-gray-900">
          {monthNames[currentMonth.month - 1]} {currentMonth.year}
        </h3>
        <button
          onClick={() => navigateMonth('next')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-4">
        {dayNames.map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2 uppercase">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: firstDay }, (_, i) => (
          <div key={`empty-${i}`} className="h-12"></div>
        ))}
        
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const dateString = `${currentMonth.year}-${String(currentMonth.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isSelected = dateString === selectedDate;
          const isToday = dateString === today;
          const hasEntry = entriesWithTasks.includes(dateString);

          return (
            <button
              key={day}
              onClick={() => onDateSelect(dateString)}
              className={`
                h-12 w-12 rounded-lg text-sm font-medium transition-all relative flex items-center justify-center
                ${isSelected 
                  ? 'bg-gray-900 text-white shadow-md' 
                  : isToday
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    : 'hover:bg-gray-100 text-gray-700'
                }
              `}
            >
              {day}
              {hasEntry && (
                <div className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full ${
                  isSelected ? 'bg-white' : 'bg-blue-500'
                }`}></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
