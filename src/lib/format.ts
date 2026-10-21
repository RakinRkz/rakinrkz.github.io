const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

/** Formats a date as "21 Oct 2026", in UTC so output never depends on the build machine. */
export function formatDate(date: Date): string {
  return dateFormat.format(date);
}
