import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, changeType }) => {
  const changeColor = changeType === 'positive' ? 'text-brand-green' : 'text-brand-red';

  return (
    <div className="bg-brand-surface p-5 rounded-lg shadow-sm border border-brand-border">
      <p className="text-sm font-medium text-brand-text-secondary">{title}</p>
      <div className="mt-1 flex items-baseline">
        <p className="text-3xl font-semibold text-brand-text-primary">{value}</p>
        {change && (
          <p className={`ml-2 flex items-baseline text-sm font-semibold ${changeColor}`}>
            {changeType === 'positive' ? (
                <svg className="self-center flex-shrink-0 h-5 w-5 text-brand-green" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.612L5.03 9.83a.75.75 0 01-1.06-1.06l5.25-5.25a.75.75 0 011.06 0l5.25 5.25a.75.75 0 11-1.06 1.06L10.75 5.612V16.25A.75.75 0 0110 17z" clipRule="evenodd" />
                </svg>
            ) : (
                <svg className="self-center flex-shrink-0 h-5 w-5 text-brand-red" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v10.638l4.22-4.22a.75.75 0 111.06 1.06l-5.25 5.25a.75.75 0 01-1.06 0l-5.25-5.25a.75.75 0 111.06-1.06l4.22 4.22V3.75A.75.75 0 0110 3z" clipRule="evenodd" />
                </svg>
            )}
            {change}
          </p>
        )}
      </div>
    </div>
  );
};

export default StatCard;