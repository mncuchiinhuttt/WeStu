import moment from 'moment-timezone';

export function parseScheduleInput(input: string): Date | null {
  // Expected format: YYYY-MM-DD HH:MM
  const dateTimeRegex = /^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})$/;

  const match = input.trim().match(dateTimeRegex);

  if (!match) {
    return null;
  }

  const [, yearStr, monthStr, dayStr, hourStr, minuteStr] = match;

  const dateTimeString = `${yearStr}-${monthStr}-${dayStr} ${hourStr}:${minuteStr}`;

  // Parse the input as UTC+7
  const momentDate = moment.tz(dateTimeString, 'YYYY-MM-DD HH:mm', 'Asia/Bangkok'); // UTC+7 timezone

  if (!momentDate.isValid()) {
    return null;
  }

  // Return the Date object in UTC
  return momentDate.toDate();
}