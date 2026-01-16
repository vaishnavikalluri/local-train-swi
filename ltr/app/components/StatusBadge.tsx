interface StatusBadgeProps {
  status: string;
  delayMinutes?: number;
}

export default function StatusBadge({ status, delayMinutes }: StatusBadgeProps) {
  const getStatusColor = () => {
    if (status === 'cancelled') return 'bg-red-100 text-red-800';
    if (status === 'delayed') return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = () => {
    if (status === 'cancelled') return 'Cancelled';
    if (status === 'delayed') return `Delayed ${delayMinutes}min`;
    return 'On Time';
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
      {getStatusText()}
    </span>
  );
}
