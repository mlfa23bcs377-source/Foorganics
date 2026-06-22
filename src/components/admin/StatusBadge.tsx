import React from 'react';

interface StatusBadgeProps {
  status: string;
  type?: 'order' | 'payment' | 'purchase';
}

const statusStyles: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  paid: 'bg-green-100 text-green-800',
  unpaid: 'bg-orange-100 text-orange-800',
  ordered: 'bg-yellow-100 text-yellow-800',
  received: 'bg-green-100 text-green-800',
  listed: 'bg-green-100 text-green-800',
  unlisted: 'bg-gray-100 text-gray-800',
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const key = status.toLowerCase();
  const style = statusStyles[key] || 'bg-gray-100 text-gray-800';

  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${style}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
