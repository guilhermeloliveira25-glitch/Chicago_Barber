export const CLOSED_DAYS = [0];

export const OPENING_TIME = 9 * 60;
export const CLOSING_TIME = 19 * 60;

export const SLOT_INTERVAL = 15;

export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getTodayString(): string {
  return formatDate(new Date());
}

export function getMaxDateString(): string {
  const maxDate = new Date();

  maxDate.setMonth(maxDate.getMonth() + 1);

  return formatDate(maxDate);
}

export function isClosedDay(dateString: string): boolean {
  const [year, month, day] = dateString.split("-").map(Number);

  const date = new Date(year, month - 1, day);

  return CLOSED_DAYS.includes(date.getDay());
}

export function isValidBookingDate(dateString: string): boolean {
  if (!dateString) {
    return false;
  }

  const today = getTodayString();
  const maxDate = getMaxDateString();

  if (dateString < today || dateString > maxDate) {
    return false;
  }

  if (isClosedDay(dateString)) {
    return false;
  }

  return true;
}

export function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(
    2,
    "0",
  )}`;
}

export function getAvailableTimes(
  dateString: string,
  totalDuration: number,
): string[] {
  if (!isValidBookingDate(dateString)) {
    return [];
  }

  if (totalDuration <= 0) {
    return [];
  }

  const availableTimes: string[] = [];

  for (
    let start = OPENING_TIME;
    start + totalDuration <= CLOSING_TIME;
    start += SLOT_INTERVAL
  ) {
    availableTimes.push(formatTime(start));
  }

  return availableTimes;
}