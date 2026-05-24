const DUE_DATE_REGEX = /^\d{2}-\d{2}-\d{4}$/;

export function parseDueDateString(dueDate: string): Date | null {
  if (!DUE_DATE_REGEX.test(dueDate.trim())) return null;
  const [day, month, year] = dueDate.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (
    date.getDate() !== day ||
    date.getMonth() !== month - 1 ||
    date.getFullYear() !== year
  ) {
    return null;
  }
  return date;
}

export function formatDateFromDate(d: Date): string {
  return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
}
