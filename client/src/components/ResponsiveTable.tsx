import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import '../styles/responsive-table.css';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
  mobile?: boolean; // Se deve aparecer no mobile
}

interface ResponsiveTableProps {
  columns: Column[];
  data: any[];
  className?: string;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  emptyMessage?: string;
  loading?: boolean;
}

const ResponsiveTable: React.FC<ResponsiveTableProps> = ({
  columns,
  data,
  className = '',
  onSort,
  sortColumn,
  sortDirection = 'asc',
  emptyMessage = 'Nenhum dado encontrado',
  loading = false
}) => {
  const handleSort = (column: string) => {
    if (!onSort || !columns.find(col => col.key === column)?.sortable) return;
    
    const newDirection = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(column, newDirection);
  };

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) return null;
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-4 h-4" /> : 
      <ChevronDown className="w-4 h-4" />;
  };

  const mobileColumns = columns.filter(col => col.mobile !== false);
  const desktopColumns = columns;

  if (loading) {
    return (
      <div className={`responsive-table-container ${className}`}>
        <div className="responsive-table-loading">
          <div className="loading-spinner"></div>
          <p>Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={`responsive-table-container ${className}`}>
        <div className="responsive-table-empty">
          <p>{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`responsive-table-container ${className}`}>
      {/* Desktop Table */}
      <div className="responsive-table-desktop">
        <table className="responsive-table">
          <thead>
            <tr>
              {desktopColumns.map((column) => (
                <th
                  key={column.key}
                  className={`responsive-table-header ${column.sortable ? 'sortable' : ''}`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="responsive-table-header-content">
                    <span>{column.label}</span>
                    {column.sortable && getSortIcon(column.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index} className="responsive-table-row">
                {desktopColumns.map((column) => (
                  <td key={column.key} className="responsive-table-cell">
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="responsive-table-mobile">
        {data.map((row, index) => (
          <div key={index} className="responsive-table-card">
            {mobileColumns.map((column) => (
              <div key={column.key} className="responsive-table-card-item">
                <div className="responsive-table-card-label">
                  {column.label}
                </div>
                <div className="responsive-table-card-value">
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResponsiveTable;
