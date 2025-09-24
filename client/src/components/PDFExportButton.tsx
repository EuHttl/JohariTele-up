import React, { useState } from 'react';
import { Download, FileText, Loader2 } from 'lucide-react';
import { usePDFExport, ReportData, PDFExportOptions } from '../services/pdfExport';

interface PDFExportButtonProps {
  type: 'individual' | 'comparative' | 'element';
  data?: ReportData;
  elementId?: string;
  options?: Partial<PDFExportOptions>;
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
}

const PDFExportButton: React.FC<PDFExportButtonProps> = ({
  type,
  data,
  elementId,
  options = {},
  className = '',
  children,
  disabled = false
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { exportElement, exportIndividualReport, exportComparativeReport } = usePDFExport();

  const handleExport = async () => {
    if (disabled || isExporting) return;

    setIsExporting(true);
    setError(null);

    try {
      switch (type) {
        case 'individual':
          if (!data) throw new Error('Dados do relatório não fornecidos');
          await exportIndividualReport(data, options);
          break;
        
        case 'comparative':
          if (!data) throw new Error('Dados do relatório não fornecidos');
          await exportComparativeReport(data, options);
          break;
        
        case 'element':
          if (!elementId) throw new Error('ID do elemento não fornecido');
          await exportElement(elementId, options);
          break;
        
        default:
          throw new Error('Tipo de exportação não suportado');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      console.error('Erro na exportação PDF:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const getButtonContent = () => {
    if (isExporting) {
      return (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Gerando PDF...</span>
        </>
      );
    }

    if (children) {
      return children;
    }

    return (
      <>
        <Download className="w-4 h-4" />
        <span>Baixar PDF</span>
      </>
    );
  };

  const getButtonTitle = () => {
    if (isExporting) return 'Gerando PDF...';
    if (disabled) return 'Exportação indisponível';
    
    switch (type) {
      case 'individual':
        return 'Baixar relatório individual em PDF';
      case 'comparative':
        return 'Baixar relatório comparativo em PDF';
      case 'element':
        return 'Baixar elemento em PDF';
      default:
        return 'Baixar PDF';
    }
  };

  return (
    <div className="pdf-export-container">
      <button
        onClick={handleExport}
        disabled={disabled || isExporting}
        className={`pdf-export-btn ${className} ${isExporting ? 'exporting' : ''} ${disabled ? 'disabled' : ''}`}
        title={getButtonTitle()}
      >
        {getButtonContent()}
      </button>
      
      {error && (
        <div className="pdf-export-error">
          <p>{error}</p>
          <button 
            onClick={() => setError(null)}
            className="error-dismiss"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

// Componente específico para relatórios individuais
export const IndividualReportPDFButton: React.FC<{
  participantName: string;
  participantCode: string;
  reportContent: string;
  className?: string;
}> = ({ participantName, participantCode, reportContent, className = '' }) => {
  const reportData: ReportData = {
    title: 'Relatório Individual - Janela de Johari',
    subtitle: 'Análise de Autoconsciência e Desenvolvimento',
    participantName,
    participantCode,
    generatedAt: new Date(),
    content: reportContent
  };

  return (
    <PDFExportButton
      type="individual"
      data={reportData}
      className={`individual-report-btn ${className}`}
    >
      <FileText className="w-4 h-4" />
      <span>Relatório Individual</span>
    </PDFExportButton>
  );
};

// Componente específico para relatórios comparativos
export const ComparativeReportPDFButton: React.FC<{
  reportContent: string;
  className?: string;
}> = ({ reportContent, className = '' }) => {
  const reportData: ReportData = {
    title: 'Relatório Comparativo - Janela de Johari',
    subtitle: 'Análise Comparativa de Participantes',
    generatedAt: new Date(),
    content: reportContent
  };

  return (
    <PDFExportButton
      type="comparative"
      data={reportData}
      className={`comparative-report-btn ${className}`}
    >
      <FileText className="w-4 h-4" />
      <span>Relatório Comparativo</span>
    </PDFExportButton>
  );
};

// Componente para exportar elemento específico
export const ElementPDFButton: React.FC<{
  elementId: string;
  label?: string;
  className?: string;
}> = ({ elementId, label = 'Exportar', className = '' }) => {
  return (
    <PDFExportButton
      type="element"
      elementId={elementId}
      className={`element-export-btn ${className}`}
    >
      <Download className="w-4 h-4" />
      <span>{label}</span>
    </PDFExportButton>
  );
};

export default PDFExportButton;
