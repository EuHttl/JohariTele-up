import React from 'react';

interface BilingualTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  ptLabel: string;
  enLabel: string;
  ptValueLabel?: string;
  enValueLabel?: string;
  formatValue?: (value: any) => string;
}

const BilingualTooltip: React.FC<BilingualTooltipProps> = ({
  active,
  payload,
  label,
  ptLabel,
  enLabel,
  ptValueLabel = 'Valor',
  enValueLabel = 'Value',
  formatValue = (value) => value
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <div className="space-y-2">
          {/* Título em português */}
          <div className="font-semibold text-gray-900 border-b border-gray-200 pb-1">
            {ptLabel}
          </div>
          
          {/* Título em inglês */}
          <div className="font-medium text-gray-700 text-sm">
            {enLabel}
          </div>
          
          {/* Dados */}
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm font-medium text-gray-700">
                  {entry.dataKey === 'awareness' ? 'Autoconsciência / Self-Awareness' :
                   entry.dataKey === 'consensus' ? 'Consenso / Consensus' :
                   entry.dataKey === 'value' ? 'Valor / Value' :
                   entry.name}
                </span>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-900">
                  {formatValue(entry.value)}
                </div>
                <div className="text-xs text-gray-500">
                  {ptValueLabel} / {enValueLabel}
                </div>
              </div>
            </div>
          ))}
          
          {/* Label do item (nome do participante, etc.) */}
          {label && (
            <div className="text-xs text-gray-600 pt-1 border-t border-gray-100">
              <div className="font-medium">Participante / Participant:</div>
              <div>{label}</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default BilingualTooltip;
