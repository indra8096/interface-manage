'use client';

import * as React from 'react';
import { DayPicker, getDefaultClassNames, DayButton } from 'react-day-picker';
import 'react-day-picker/style.css';

interface CalendarProps extends React.ComponentProps<typeof DayPicker> {
  className?: string;
}

export function Calendar({ className, ...props }: CalendarProps) {
  const defaultClassNames = getDefaultClassNames();
  return (
    <DayPicker
      showOutsideDays
      className={`p-3 rounded-md border shadow-sm bg-transparent ${className || ''}`}
      classNames={{
        root: `w-fit ${defaultClassNames.root}`,
        months: `flex gap-4 flex-col md:flex-row ${defaultClassNames.months}`,
        month: `flex flex-col w-full gap-4 ${defaultClassNames.month}`,
        nav: `flex items-center gap-1 w-full justify-between ${defaultClassNames.nav}`,
        button_previous: `${defaultClassNames.button_previous}`,
        button_next: `${defaultClassNames.button_next}`,
        month_caption: `flex items-center justify-center ${defaultClassNames.month_caption}`,
        table: 'w-full border-collapse',
        weekdays: `flex ${defaultClassNames.weekdays}`,
        weekday: `text-gray-400 rounded-md flex-1 font-normal text-[0.8rem] select-none ${defaultClassNames.weekday}`,
        week: `flex w-full mt-2 ${defaultClassNames.week}`,
        day: `relative w-full h-full p-0 text-center aspect-square select-none ${defaultClassNames.day}`,
        today: `rounded-md ${defaultClassNames.today}`,
        outside: `text-gray-500 ${defaultClassNames.outside}`,
        disabled: `text-gray-500 opacity-50 ${defaultClassNames.disabled}`,
        hidden: `invisible ${defaultClassNames.hidden}`,
      }}
      {...props}
    />
  );
}

export type { DayButton };


