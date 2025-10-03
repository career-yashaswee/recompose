import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LeaderboardUser } from '@/hooks/api/use-leaderboard';
import { Flame, Circle, Star } from 'lucide-react';
import { authClient } from '@/lib/auth-client';

interface LeaderboardTableProps {
  data: LeaderboardUser[];
  currentUserRank: number;
}

const columnHelper = createColumnHelper<LeaderboardUser>();

export function LeaderboardTable({ data, currentUserRank }: LeaderboardTableProps) {
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const columns: ColumnDef<LeaderboardUser>[] = [
    columnHelper.accessor('rank', {
      header: 'Rank',
      cell: (info) => (
        <div className="font-semibold text-gray-900">
          {info.getValue()}
        </div>
      ),
    }),
    columnHelper.accessor('name', {
      header: 'User',
      cell: (info) => {
        const rowUser = info.row.original;
        const isCurrentUser = rowUser.id === user?.id;
        
        return (
          <div className="flex items-center space-x-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={rowUser.image || ''} alt={rowUser.name || 'User'} />
              <AvatarFallback>
                {rowUser.name?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium text-gray-900">
                {isCurrentUser ? 'You' : (rowUser.name || 'Anonymous User')}
              </div>
            </div>
          </div>
        );
      },
    }),
    columnHelper.accessor('compositionsCompleted', {
      header: 'Compositions Completed',
      cell: (info) => (
        <div className="flex items-center text-gray-600">
          <Circle className="w-4 h-4 mr-2" />
          {info.getValue()}
        </div>
      ),
    }),
    columnHelper.accessor('currentStreak', {
      header: 'Streak',
      cell: (info) => (
        <div className="flex items-center text-gray-600">
          <Flame className="w-4 h-4 mr-2 text-orange-500" />
          {info.getValue()} days
        </div>
      ),
    }),
    columnHelper.accessor('badges', {
      header: 'Badges',
      cell: (info) => {
        const badges = info.getValue();
        return (
          <div className="flex flex-wrap gap-1">
            {badges.slice(0, 2).map((badge) => (
              <Badge key={badge.id} variant="secondary" className="text-xs">
                {badge.name}
              </Badge>
            ))}
            {badges.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{badges.length - 2}
              </Badge>
            )}
          </div>
        );
      },
    }),
    columnHelper.accessor('totalPoints', {
      header: 'Points',
      cell: (info) => (
        <div className="flex items-center font-semibold text-gray-900">
          <Star className="w-4 h-4 mr-1 text-yellow-500" />
          {info.getValue().toLocaleString()}
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map((row) => {
              const isCurrentUser = row.original.id === user?.id;
              return (
                <tr
                  key={row.id}
                  className={`hover:bg-gray-50 ${isCurrentUser ? 'bg-blue-50' : ''}`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-6 py-4 whitespace-nowrap text-sm"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
