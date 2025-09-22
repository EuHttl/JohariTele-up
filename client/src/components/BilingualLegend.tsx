import React from 'react';

interface LegendItem {
  ptLabel: string;
  enLabel: string;
  color: string;
  value?: number;
  percentage?: number;
}

interface BilingualLegendProps {
  items: LegendItem[];
  title?: {
    pt: string;
    en: string;
  };
}

const BilingualLegend: React.FC<BilingualLegendProps> = ({ items, title }) => {
  return (
    <div className="space-y-3">
      {title && (
        <div className="border-b border-gray-200 pb-2">
          <div className="font-semibold text-gray-900">{title.pt}</div>
          <div className="text-sm text-gray-600">{title.en}</div>
        </div>
      )}
      
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded-sm"
                style={{ backgroundColor: item.color }}
              />
              <div>
                <div className="font-medium text-gray-900 text-sm">
                  {item.ptLabel}
                </div>
                <div className="text-xs text-gray-600">
                  {item.enLabel}
                </div>
              </div>
            </div>
            
            {(item.value !== undefined || item.percentage !== undefined) && (
              <div className="text-right">
                {item.value !== undefined && (
                  <div className="font-semibold text-gray-900">
                    {item.value}
                  </div>
                )}
                {item.percentage !== undefined && (
                  <div className="text-sm text-gray-600">
                    {item.percentage}%
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BilingualLegend;
