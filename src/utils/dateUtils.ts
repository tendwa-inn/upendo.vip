export const formatRelativeTime = (timestamp: string | Date): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

  // Today
  if (diffInDays === 0) {
    if (diffInHours === 0) {
      if (diffInMinutes < 1) return 'Just now';
      if (diffInMinutes === 1) return '1 minute ago';
      return `${diffInMinutes} minutes ago`;
    }
    if (diffInHours === 1) return '1 hour ago';
    return `${diffInHours} hours ago`;
  }

  // Yesterday
  if (diffInDays === 1) return 'Yesterday';

  // This week (2-6 days ago)
  if (diffInDays < 7) return `${diffInDays} days ago`;

  // Last week
  if (diffInDays < 14) return 'Last week';

  // This month
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;

  // Last month
  if (diffInDays < 60) return 'Last month';

  // Months ago
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;

  // Years ago
  const diffInYears = Math.floor(diffInDays / 365);
  if (diffInYears === 1) return 'Last year';
  return `${diffInYears} years ago`;
};

export const formatMessageTime = (timestamp: string | Date): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const formatMessageDate = (timestamp: string | Date): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  // Today - just show time
  if (diffInDays === 0) {
    return formatMessageTime(timestamp);
  }

  // Yesterday
  if (diffInDays === 1) return 'Yesterday';

  // This week
  if (diffInDays < 7) {
    return date.toLocaleDateString([], { weekday: 'long' });
  }

  // This year
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }

  // Different year
  return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
};