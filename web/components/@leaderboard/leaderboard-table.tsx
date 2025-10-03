import {
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
}

export function LeaderboardTable({ data }: LeaderboardTableProps) {
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const columns: ColumnDef<LeaderboardUser>[] = [
    {
      accessorKey: 'rank',
      header: 'Rank',
      cell: ({ getValue }) => (
        <div className='font-semibold text-gray-900'>
          {getValue() as number}
        </div>
      ),
    },
    {
      accessorKey: 'name',
      header: 'User',
      cell: ({ row }) => {
        const rowUser = row.original;
        const isCurrentUser = rowUser.id === user?.id;

        return (
          <div className='flex items-center space-x-3'>
            <Avatar className='w-8 h-8'>
              <AvatarImage
                src={rowUser.image || ''}
                alt={rowUser.name || 'User'}
              />
              <AvatarFallback>
                {rowUser.name?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className='font-medium text-gray-900'>
                {isCurrentUser ? 'You' : rowUser.name || 'Anonymous User'}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'compositionsCompleted',
      header: 'Compositions Completed',
      cell: ({ getValue }) => (
        <div className='flex items-center text-gray-600'>
          <Circle className='w-4 h-4 mr-2' />
          {getValue() as number}
        </div>
      ),
    },
    {
      accessorKey: 'currentStreak',
      header: 'Streak',
      cell: ({ getValue }) => (
        <div className='flex items-center text-gray-600'>
          <Flame className='w-4 h-4 mr-2 text-orange-500' />
          {getValue() as number} days
        </div>
      ),
    },
    {
      accessorKey: 'badges',
      header: 'Badges',
      cell: ({ getValue }) => {
        const badges = getValue() as LeaderboardUser['badges'];
        return (
          <div className='flex flex-wrap gap-1'>
            {badges.slice(0, 2).map(badge => (
              <Badge key={badge.id} variant='secondary' className='text-xs'>
                {badge.name}
              </Badge>
            ))}
            {badges.length > 2 && (
              <Badge variant='outline' className='text-xs'>
                +{badges.length - 2}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'totalPoints',
      header: 'Points',
      cell: ({ getValue }) => (
        <div className='flex items-center font-semibold text-gray-900'>
          <Star className='w-4 h-4 mr-1 text-yellow-500' />
          {(getValue() as number).toLocaleString()}
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
      <div className='overflow-x-auto'>
        <table className='w-full'>
          <thead className='bg-gray-50 border-b border-gray-200'>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
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
          <tbody className='bg-white divide-y divide-gray-200'>
            {table.getRowModel().rows.map(row => {
              const isCurrentUser = row.original.id === user?.id;
              return (
                <tr
                  key={row.id}
                  className={`hover:bg-gray-50 ${isCurrentUser ? 'bg-blue-50' : ''}`}
                >
                  {row.getVisibleCells().map(cell => (
                    <td
                      key={cell.id}
                      className='px-6 py-4 whitespace-nowrap text-sm'
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
