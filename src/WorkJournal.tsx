import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Calendar } from "./Calendar";
import { TaskEditor } from "./TaskEditor";

export function WorkJournal() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return {
      year: today.getFullYear(),
      month: today.getMonth() + 1,
    };
  });

  const entry = useQuery(api.journal.getEntryByDate, { date: selectedDate });
  const monthEntries = useQuery(api.journal.getEntriesForMonth, currentMonth);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <Calendar
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            currentMonth={currentMonth}
            onMonthChange={setCurrentMonth}
            entriesWithTasks={monthEntries?.filter(e => e.tasks.length > 0).map(e => e.date) || []}
          />
        </div>
        
        <div>
          <TaskEditor
            date={selectedDate}
            initialTasks={entry?.tasks || []}
          />
        </div>
      </div>
    </div>
  );
}
