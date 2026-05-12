export function getWeekStart(date?: Date): string {
  const d = date ? new Date(date) : new Date();
  const dayOfWeek = d.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  d.setDate(d.getDate() + mondayOffset);
  return d.toISOString().slice(0, 10);
}
