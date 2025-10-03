import { Button } from '@/components/ui/button';
import { LeaderboardTimeFilter } from '@/app/api/leaderboard/route';

interface TimeFilterProps {
  currentFilter: LeaderboardTimeFilter;
  onFilterChange: (filter: LeaderboardTimeFilter) => void;
}

export function TimeFilter({ currentFilter, onFilterChange }: TimeFilterProps) {
  const filters: Array<{ key: LeaderboardTimeFilter; label: string }> = [
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
    { key: 'all', label: 'All Time' },
  ];

  return (
    <div className='flex space-x-2 mb-6'>
      {filters.map(filter => (
        <Button
          key={filter.key}
          variant={currentFilter === filter.key ? 'default' : 'outline'}
          size='sm'
          onClick={() => onFilterChange(filter.key)}
          className={
            currentFilter === filter.key
              ? 'bg-gray-900 text-white hover:bg-gray-800'
              : 'text-gray-600 hover:text-gray-900'
          }
        >
          {filter.label}
        </Button>
      ))}
    </div>
  );
}
