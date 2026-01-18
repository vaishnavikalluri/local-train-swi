interface StatusBadgeProps {
  status: string;
  delayMinutes?: number;
}

export default function StatusBadge({ status, delayMinutes }: StatusBadgeProps) {
  const getStatusStyle = () => {
    if (status === 'cancelled') 
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    if (status === 'delayed') 
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-green-500/20 text-green-400 border-green-500/30';
  };

  const getStatusIcon = () => {
    if (status === 'cancelled') return 'bi-x-circle-fill';
    if (status === 'delayed') return 'bi-clock-fill';
    return 'bi-check-circle-fill';
  };

  const getStatusText = () => {
    if (status === 'cancelled') return 'Cancelled';
    if (status === 'delayed') return `Delayed ${delayMinutes}min`;
    return 'On Time';
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${getStatusStyle()}`}>
      <i className={`bi ${getStatusIcon()}`}></i>
      {getStatusText()}
    </span>
  );
}
