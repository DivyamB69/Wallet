import { Calendar } from 'lucide-react';

export function FilterBar({ selectedPeriod, onPeriodChange }) {
  const periods = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
    { value: 'all', label: 'All Time' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-md p-4 mb-6">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-gray-700 font-medium">
          <Calendar className="w-5 h-5" />
          <span>Filter by:</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {periods.map((period) => (
            <button
              key={period.value}
              onClick={() => onPeriodChange(period.value)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                selectedPeriod === period.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
