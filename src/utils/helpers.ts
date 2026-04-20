export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const formatDate = (timestamp: number | null): string => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatTime = (timestamp: number | null): string => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
};

export const isToday = (timestamp: number | null): boolean => {
  if (!timestamp) return false;
  const date = new Date(timestamp);
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

export const isOverdue = (timestamp: number | null): boolean => {
  if (!timestamp) return false;
  const date = new Date(timestamp);
  const now = new Date();
  return date < now && !isToday(timestamp);
};

export const getDueDateAt9AM = (timestamp: number): number => {
  const date = new Date(timestamp);
  date.setHours(9, 0, 0, 0);
  return date.getTime();
};
