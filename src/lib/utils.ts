export function formatDate(dateString: string): string {
  if (!dateString) return '';

  const date = new Date(dateString);

  // Check if date is valid
  if (isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function cn(...classes: (string | undefined | boolean)[]) {
  return classes.filter(Boolean).join(' ');
}
