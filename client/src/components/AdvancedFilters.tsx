import React, { useState, useEffect } from 'react';
import { X, Filter, Calendar, User, Target, TrendingUp } from 'lucide-react';

export interface FilterOptions {
  dateRange: {
    start: string;
    end: string;
  };
  scoreRange: {
    min: number;
    max: number;
  };
  status: 'all' | 'completed' | 'incomplete';
  name: string;
  sortBy: 'name' | 'score' | 'date' | 'status';
  sortOrder: 'asc' | 'desc';
  showOnlyHighPerformers: boolean;
  showOnlyIncomplete: boolean;
}

interface AdvancedFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterOptions) => void;
  currentFilters: FilterOptions;
  totalParticipants: number;
  filteredCount: number;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  isOpen,
  onClose,
  onApplyFilters,
  currentFilters,
  totalParticipants,
  filteredCount
}) => {
  const [filters, setFilters] = useState<FilterOptions>(currentFilters);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setFilters(currentFilters);
    setHasChanges(false);
  }, [currentFilters]);

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  };

  const handleApply = () => {
    onApplyFilters(filters);
    setHasChanges(false);
  };

  const handleReset = () => {
    const defaultFilters: FilterOptions = {
      dateRange: { start: '', end: '' },
      scoreRange: { min: 0, max: 100 },
      status: 'all',
      name: '',
      sortBy: 'name',
      sortOrder: 'asc',
      showOnlyHighPerformers: false,
      showOnlyIncomplete: false
    };
    setFilters(defaultFilters);
    setHasChanges(true);
  };

  const handleClear = () => {
    onApplyFilters({
      dateRange: { start: '', end: '' },
      scoreRange: { min: 0, max: 100 },
      status: 'all',
      name: '',
      sortBy: 'name',
      sortOrder: 'asc',
      showOnlyHighPerformers: false,
      showOnlyIncomplete: false
    });
    setHasChanges(false);
  };

  if (!isOpen) return null;

  return (
    <div className="advanced-filters-overlay">
      <div className="advanced-filters-panel">
        <div className="advanced-filters-header">
          <div className="advanced-filters-title">
            <Filter className="w-5 h-5" />
            <h3>Filtros Avançados</h3>
          </div>
          <button 
            className="advanced-filters-close"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="advanced-filters-content">
          {/* Filtro por Nome */}
          <div className="filter-group">
            <label className="filter-label">
              <User className="w-4 h-4" />
              Nome do Participante
            </label>
            <input
              type="text"
              value={filters.name}
              onChange={(e) => handleFilterChange('name', e.target.value)}
              placeholder="Digite o nome do participante..."
              className="filter-input"
            />
          </div>

          {/* Filtro por Data */}
          <div className="filter-group">
            <label className="filter-label">
              <Calendar className="w-4 h-4" />
              Período de Cadastro
            </label>
            <div className="filter-date-range">
              <input
                type="date"
                value={filters.dateRange.start}
                onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, start: e.target.value })}
                className="filter-input"
                placeholder="Data inicial"
              />
              <span className="filter-date-separator">até</span>
              <input
                type="date"
                value={filters.dateRange.end}
                onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, end: e.target.value })}
                className="filter-input"
                placeholder="Data final"
              />
            </div>
          </div>

          {/* Filtro por Pontuação */}
          <div className="filter-group">
            <label className="filter-label">
              <Target className="w-4 h-4" />
              Faixa de Pontuação
            </label>
            <div className="filter-score-range">
              <div className="filter-score-inputs">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={filters.scoreRange.min}
                  onChange={(e) => handleFilterChange('scoreRange', { ...filters.scoreRange, min: parseInt(e.target.value) || 0 })}
                  className="filter-input"
                  placeholder="Mínimo"
                />
                <span className="filter-score-separator">-</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={filters.scoreRange.max}
                  onChange={(e) => handleFilterChange('scoreRange', { ...filters.scoreRange, max: parseInt(e.target.value) || 100 })}
                  className="filter-input"
                  placeholder="Máximo"
                />
              </div>
              <div className="filter-score-slider">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.scoreRange.min}
                  onChange={(e) => handleFilterChange('scoreRange', { ...filters.scoreRange, min: parseInt(e.target.value) })}
                  className="filter-slider"
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.scoreRange.max}
                  onChange={(e) => handleFilterChange('scoreRange', { ...filters.scoreRange, max: parseInt(e.target.value) })}
                  className="filter-slider"
                />
              </div>
            </div>
          </div>

          {/* Filtro por Status */}
          <div className="filter-group">
            <label className="filter-label">
              <TrendingUp className="w-4 h-4" />
              Status da Avaliação
            </label>
            <div className="filter-status-options">
              <label className="filter-radio">
                <input
                  type="radio"
                  name="status"
                  value="all"
                  checked={filters.status === 'all'}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                />
                <span>Todos</span>
              </label>
              <label className="filter-radio">
                <input
                  type="radio"
                  name="status"
                  value="completed"
                  checked={filters.status === 'completed'}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                />
                <span>Completos</span>
              </label>
              <label className="filter-radio">
                <input
                  type="radio"
                  name="status"
                  value="incomplete"
                  checked={filters.status === 'incomplete'}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                />
                <span>Incompletos</span>
              </label>
            </div>
          </div>

          {/* Filtros Especiais */}
          <div className="filter-group">
            <label className="filter-label">Filtros Especiais</label>
            <div className="filter-special-options">
              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filters.showOnlyHighPerformers}
                  onChange={(e) => handleFilterChange('showOnlyHighPerformers', e.target.checked)}
                />
                <span>Apenas Alta Performance (80%+)</span>
              </label>
              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filters.showOnlyIncomplete}
                  onChange={(e) => handleFilterChange('showOnlyIncomplete', e.target.checked)}
                />
                <span>Apenas Incompletos</span>
              </label>
            </div>
          </div>

          {/* Ordenação */}
          <div className="filter-group">
            <label className="filter-label">Ordenar por</label>
            <div className="filter-sort-options">
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="filter-select"
              >
                <option value="name">Nome</option>
                <option value="score">Pontuação</option>
                <option value="date">Data</option>
                <option value="status">Status</option>
              </select>
              <select
                value={filters.sortOrder}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                className="filter-select"
              >
                <option value="asc">Crescente</option>
                <option value="desc">Decrescente</option>
              </select>
            </div>
          </div>
        </div>

        <div className="advanced-filters-footer">
          <div className="filter-stats">
            <span className="filter-stats-text">
              Mostrando {filteredCount} de {totalParticipants} participantes
            </span>
          </div>
          <div className="filter-actions">
            <button
              onClick={handleClear}
              className="filter-btn filter-btn-secondary"
            >
              Limpar
            </button>
            <button
              onClick={handleReset}
              className="filter-btn filter-btn-secondary"
            >
              Resetar
            </button>
            <button
              onClick={handleApply}
              className={`filter-btn filter-btn-primary ${hasChanges ? 'has-changes' : ''}`}
              disabled={!hasChanges}
            >
              Aplicar Filtros
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedFilters;
