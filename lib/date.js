export function formatPubDate(dateStr) {
  if (!dateStr) return 'Unknown';
  const d = new Date(dateStr);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
}
