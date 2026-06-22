import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color = 'organic' }) => {
  const bgMap: Record<string, string> = {
    organic: 'bg-organic-100 text-organic-600',
    blue: 'bg-blue-100 text-blue-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    green: 'bg-green-100 text-green-600',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`flex-shrink-0 rounded-lg p-3 ${bgMap[color] || bgMap.organic}`}>
          {icon}
        </div>
        <div className="ml-5">
          <dt className="text-sm font-medium text-earth-500 truncate">{title}</dt>
          <dd className="text-lg font-medium text-earth-900">{value}</dd>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
