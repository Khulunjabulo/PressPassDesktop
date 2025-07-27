export function timeAgo(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'Unknown';
  const diff = Date.now() - d.getTime();

  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} ${mins === 1 ? 'Minute' : 'Minutes'} ago`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? 'Hour' : 'Hours'} ago`;

  const days = Math.floor(hours / 24);
  return `${days} ${days === 1 ? 'Day' : 'Days'} ago`;
}
