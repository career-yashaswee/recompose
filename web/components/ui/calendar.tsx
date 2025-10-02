'use client';

import * as React from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

export function Calendar(props: CalendarProps): React.ReactElement {
  return (
    <DayPicker
      className='rdp'
      classNames={{
        day: 'rdp-day inline-flex items-center justify-center size-9 rounded-md',
        day_selected: 'bg-green-500 text-white',
        day_disabled: 'opacity-50 cursor-not-allowed',
        caption: 'flex justify-between items-center px-2 py-2',
        caption_label: 'font-medium',
        nav: 'flex items-center gap-2',
        table: 'w-full border-collapse',
        head_row: 'grid grid-cols-7',
        row: 'grid grid-cols-7',
        cell: 'p-1',
      }}
      {...props}
    />
  );
}

export default Calendar;
