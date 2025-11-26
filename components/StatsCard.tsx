import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: string;
  trend?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, color, trend }) => {
  const formattedValue = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4 transition-transform hover:scale-[1.02] duration-200">
      <div className={`p-4 rounded-full ${color} bg-opacity-10 flex items-center justify-center`}>
        <Icon className={`w-8 h-8 ${color.replace('bg-', 'text-')}`} />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800">{formattedValue}</h3>
        {trend && <p className="text-xs text-green-500 mt-1">{trend}</p>}
      </div>
    </div>
  );
};

export default StatsCard;
