// DateTime definition object

import {duplicate, keys, isNumber} from './util';

/*
 * A designated year that starts on Sunday.
 */
const SUNDAY_YEAR = 2006;

/**
 * @minimum 1
 * @maximum 12
 */
export type Month = number;

/**
 * @minimum 1
 * @maximum 7
 */
export type Day = number;

/**
 * Object for defining datetime in Vega-Lite Filter.
 * If both month and quarter are provided, month has higher precedence.
 * `day` cannot be combined with other date.
 * We accept string for month and day names.
 */
export interface DateTime {
  /** Integer value representing the year. */
  year?: number;

  /**
   * Integer value representing the quarter of the year (from 1-4).
   * @minimum 1
   * @maximum 4
   */
  quarter?: number;

  /** One of: (1) integer value representing the month from `1`-`12`. `1` represents January;  (2) case-insensitive month name (e.g., `"January"`);  (3) case-insensitive, 3-character short month name (e.g., `"Jan"`). */
  month?: Month | string;

  /**
   * Integer value representing the date from 1-31.
   * @minimum 1
   * @maximum 31
   */
  date?: number;

  /**
   * Value representing the day of week.  This can be one of: (1) integer value -- `1` represents Monday; (2) case-insensitive day name (e.g., `"Monday"`);  (3) case-insensitive, 3-character short day name (e.g., `"Mon"`).   <br/> **Warning:** A DateTime definition object with `day`** should not be combined with `year`, `quarter`, `month`, or `date`.
   */
  day?: Day | string;

  /**
   * Integer value representing the hour of day from 0-23.
   * @minimum 0
   * @maximum 23
   */
  hours?: number;

  /**
   * Integer value representing minute segment of a time from 0-59.
   * @minimum 0
   * @maximum 59
   */
  minutes?: number;

  /**
   * Integer value representing second segment of a time from 0-59.
   * @minimum 0
   * @maximum 59
   */
  seconds?: number;

  /**
   * Integer value representing millisecond segment of a time.
   * @minimum 0
   * @maximum 999
   */
  milliseconds?: number;
}


/**
 * Internal Object for defining datetime expressions.
 * This is an expression version of DateTime.
 * If both month and quarter are provided, month has higher precedence.
 * `day` cannot be combined with other date.
 */
export interface DateTimeExpr {
  year?: string;
  quarter?: string;
  month?: string;
  date?: string;
  day?: string;
  hours?: string;
  minutes?: string;
  seconds?: string;
  milliseconds?: string;
}

export function isDateTime(o: any): o is DateTime {
  return !!o && (!!o.year || !!o.quarter || !!o.month || !!o.date || !!o.day ||
    !!o.hours || !!o.minutes || !!o.seconds || !!o.milliseconds);
}

export const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
export const SHORT_MONTHS = MONTHS.map((m) => m.substr(0, 3));

export const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
export const SHORT_DAYS = DAYS.map((d) => d.substr(0,3));

function normalizeQuarter(q: number | string) {
  if (isNumber(q)) {
    // We accept 1-based quarter, so need to readjust to 0-based quarter
    return (q - 1) + '';
  } else {
    // Simply an expression string, but normalize should not be called in this case.
    console.warn('Potentially invalid quarter', q);
    return q;
  }
}

function normalizeMonth(m: string | number) {
  if (isNumber(m)) {
    // We accept 1-based month, so need to readjust to 0-based month
    return (m - 1) + '';
  } else {
    const lowerM = m.toLowerCase();
    const monthIndex = MONTHS.indexOf(lowerM);
    if (monthIndex !== -1) {
      return monthIndex + ''; // 0 for january, ...
    }
    const shortM = lowerM.substr(0, 3);
    const shortMonthIndex = SHORT_MONTHS.indexOf(shortM);
    if (shortMonthIndex !== -1) {
      return shortMonthIndex + '';
    }
    // Simply an expression string, but normalize should not be called in this case.
    console.warn('Potentially invalid month', m);
    return m;
  }
}

function normalizeDay(d: string | number) {
  if (isNumber(d)) {
    // mod so that this can be both 0-based where 0 = sunday
    // and 1-based where 7=sunday
    return (d % 7) + '';
  } else {
    const lowerD = d.toLowerCase();
    const dayIndex = DAYS.indexOf(lowerD);
    if (dayIndex !== -1) {
      return dayIndex + ''; // 0 for january, ...
    }
    const shortD = lowerD.substr(0, 3);
    const shortDayIndex = SHORT_DAYS.indexOf(shortD);
    if (shortDayIndex !== -1) {
      return shortDayIndex + '';
    }
    // Simply an expression string, but normalize should not be called in this case.
    console.warn('Potentially invalid day', d);
    return d;
  }
}

export function timestamp(d: DateTime, normalize) {
  const date = new Date(0, 0, 1, 0, 0, 0, 0); // start with uniform date

  // FIXME support UTC

  if (d.day !== undefined) {
    if (keys(d).length > 1) {
      console.warn('Dropping day from datetime', JSON.stringify(d),
          'as day cannot be combined with other units.');
      d = duplicate(d);
      delete d.day;
    } else {
      // Use a year that has 1/1 as Sunday so we can setDate below
      date.setFullYear(SUNDAY_YEAR);

      const day = normalize ? normalizeDay(d.day) : d.day;
      date.setDate(+day + 1); // +1 since date start at 1 in JS
    }
  }

  if (d.year !== undefined) {
    date.setFullYear(d.year);
  }

  if (d.quarter !== undefined) {
    const quarter = normalize ? normalizeQuarter(d.quarter) : d.quarter;
    date.setMonth(+quarter * 3);
  }

  if (d.month !== undefined) {
    const month = normalize ? normalizeMonth(d.month) : d.month;
    date.setMonth(+month);
  }

  if (d.date !== undefined) {
    date.setDate(d.date);
  }

  if (d.hours !== undefined) {
    date.setHours(d.hours);
  }

  if (d.minutes !== undefined) {
    date.setMinutes(d.minutes);
  }

  if (d.seconds !== undefined) {
    date.setSeconds(d.seconds);
  }

  if (d.milliseconds !== undefined) {
    date.setMilliseconds(d.milliseconds);
  }

  return date.getTime();
}

/**
 * Return Vega Expression for a particular date time.
 * @param d
 * @param normalize whether to normalize quarter, month, day.
 */
export function dateTimeExpr(d: DateTime | DateTimeExpr, normalize = false) {
  const units = [];

  if (normalize && d.day !== undefined) {
    if (keys(d).length > 1) {
      console.warn('Dropping day from datetime', JSON.stringify(d),
          'as day cannot be combined with other units.');
      d = duplicate(d);
      delete d.day;
    }
  }

  if (d.year !== undefined) {
    units.push(d.year);
  } else if (d.day !== undefined) {
    // Set year to 2006 for working with day since January 1 2006 is a Sunday
    units.push(SUNDAY_YEAR);
  } else {
    units.push(0);
  }

  if (d.month !== undefined) {
    const month = normalize ? normalizeMonth(d.month) : d.month;
    units.push(month);
  } else if (d.quarter !== undefined) {
    const quarter = normalize ? normalizeQuarter(d.quarter) : d.quarter;
    units.push(quarter + '*3');
  } else {
    units.push(0); // months start at zero in JS
  }

  if (d.date !== undefined) {
    units.push(d.date);
  } else if (d.day !== undefined) {
    // HACK: Day only works as a standalone unit
    // This is only correct because we always set year to 2006 for day
    const day = normalize ? normalizeDay(d.day) : d.day;
    units.push(day + '+1');
  } else {
    units.push(1); // Date starts at 1 in JS
  }

  // Note: can't use TimeUnit enum here as importing it will create
  // circular dependency problem!
  for (let timeUnit of ['hours', 'minutes', 'seconds', 'milliseconds']) {
    if (d[timeUnit] !== undefined) {
      units.push(d[timeUnit]);
    } else {
      units.push(0);
    }
  }

  return 'datetime(' + units.join(', ') + ')';
}
