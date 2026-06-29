export function parseLocalToUtc(dateStr: string, timeZone: string): Date {
  const parts = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (!parts) return new Date(dateStr);
  const y = Number(parts[1]);
  const m = Number(parts[2]);
  const d = Number(parts[3]);
  const hr = Number(parts[4]);
  const min = Number(parts[5]);
  const sec = parts[6] ? Number(parts[6]) : 0;

  const utcDate = new Date(Date.UTC(y, m - 1, d, hr, min, sec));

  try {
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: false,
    });
    const partsTz = fmt.formatToParts(utcDate);
    const getVal = (type: string) => Number(partsTz.find((p) => p.type === type)?.value);

    const tzYear = getVal("year");
    const tzMonth = getVal("month");
    const tzDay = getVal("day");
    let tzHour = getVal("hour");
    if (tzHour === 24) tzHour = 0;
    const tzMinute = getVal("minute");
    const tzSecond = getVal("second");

    const targetUtc = Date.UTC(tzYear, tzMonth - 1, tzDay, tzHour, tzMinute, tzSecond);
    const diffMs = targetUtc - utcDate.getTime();

    return new Date(utcDate.getTime() - diffMs);
  } catch {
    return new Date(dateStr);
  }
}
