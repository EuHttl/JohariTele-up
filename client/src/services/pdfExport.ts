import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PDFExportOptions {
  filename?: string;
  format?: 'a4' | 'letter';
  orientation?: 'portrait' | 'landscape';
  quality?: number;
  scale?: number;
}

export interface ReportData {
  title: string;
  subtitle?: string;
  participantName?: string;
  participantCode?: string;
  generatedAt: Date;
  content: string;
  charts?: {
    johariWindow?: string; // Base64 image
    scoreDistribution?: string;
    characteristics?: string;
  };
}

class PDFExportService {
  private defaultOptions: PDFExportOptions = {
    filename: 'relatorio-johari',
    format: 'a4',
    orientation: 'portrait',
    quality: 0.98,
    scale: 2
  };

  /**
   * Exporta um elemento HTML para PDF
   */
  async exportElementToPDF(
    elementId: string, 
    options: Partial<PDFExportOptions> = {}
  ): Promise<void> {
    const mergedOptions = { ...this.defaultOptions, ...options };
    
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error(`Elemento com ID '${elementId}' não encontrado`);
      }

      // Configurar opções do html2canvas
      const canvas = await html2canvas(element, {
        scale: mergedOptions.scale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: element.scrollWidth,
        height: element.scrollHeight
      });

      const imgData = canvas.toDataURL('image/png', mergedOptions.quality);
      
      // Criar PDF
      const pdf = new jsPDF({
        orientation: mergedOptions.orientation,
        unit: 'mm',
        format: mergedOptions.format
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      // Adicionar primeira página
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Adicionar páginas adicionais se necessário
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Download do PDF
      const filename = `${mergedOptions.filename}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(filename);

    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      throw new Error('Falha ao gerar PDF. Tente novamente.');
    }
  }

  /**
   * Exporta relatório individual para PDF
   */
  async exportIndividualReport(
    reportData: ReportData,
    options: Partial<PDFExportOptions> = {}
  ): Promise<void> {
    const mergedOptions = { 
      ...this.defaultOptions, 
      filename: `relatorio-individual-${reportData.participantCode || 'participante'}`,
      ...options 
    };

    try {
      const pdf = new jsPDF({
        orientation: mergedOptions.orientation,
        unit: 'mm',
        format: mergedOptions.format
      });

      // Configurações de fonte
      pdf.setFont('helvetica', 'normal');

      // Cabeçalho
      this.addHeader(pdf, reportData);
      
      // Conteúdo principal
      this.addContent(pdf, reportData);
      
      // Rodapé
      this.addFooter(pdf, reportData);

      // Download
      const filename = `${mergedOptions.filename}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(filename);

    } catch (error) {
      console.error('Erro ao exportar relatório individual:', error);
      throw new Error('Falha ao gerar relatório individual em PDF.');
    }
  }

  /**
   * Exporta relatório comparativo para PDF
   */
  async exportComparativeReport(
    reportData: ReportData,
    options: Partial<PDFExportOptions> = {}
  ): Promise<void> {
    const mergedOptions = { 
      ...this.defaultOptions, 
      filename: 'relatorio-comparativo',
      orientation: 'landscape',
      ...options 
    };

    try {
      const pdf = new jsPDF({
        orientation: mergedOptions.orientation,
        unit: 'mm',
        format: mergedOptions.format
      });

      // Cabeçalho
      this.addHeader(pdf, reportData);
      
      // Conteúdo comparativo
      this.addComparativeContent(pdf, reportData);
      
      // Rodapé
      this.addFooter(pdf, reportData);

      // Download
      const filename = `${mergedOptions.filename}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(filename);

    } catch (error) {
      console.error('Erro ao exportar relatório comparativo:', error);
      throw new Error('Falha ao gerar relatório comparativo em PDF.');
    }
  }

  /**
   * Adiciona cabeçalho ao PDF
   */
  private addHeader(pdf: jsPDF, data: ReportData): void {
    // Logo/Título
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Janela de Johari', 20, 20);
    
    // Subtítulo
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
    pdf.text(data.subtitle || 'Relatório de Análise', 20, 30);
    
    // Informações do participante (se aplicável)
    if (data.participantName) {
      pdf.setFontSize(12);
      pdf.text(`Participante: ${data.participantName}`, 20, 40);
      if (data.participantCode) {
        pdf.text(`Código: ${data.participantCode}`, 20, 47);
      }
    }
    
    // Linha separadora
    pdf.setDrawColor(168, 85, 247);
    pdf.setLineWidth(0.5);
    pdf.line(20, 55, 190, 55);
  }

  /**
   * Adiciona conteúdo principal ao PDF
   */
  private addContent(pdf: jsPDF, data: ReportData): void {
    let yPosition = 65;
    
    // Título do relatório
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(data.title, 20, yPosition);
    yPosition += 10;

    // Conteúdo
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    
    // Dividir texto em linhas que cabem na página
    const maxWidth = 170;
    const lineHeight = 6;
    const pageHeight = 250;
    
    const lines = pdf.splitTextToSize(data.content, maxWidth);
    
    for (const line of lines) {
      if (yPosition > pageHeight) {
        pdf.addPage();
        yPosition = 20;
      }
      
      pdf.text(line, 20, yPosition);
      yPosition += lineHeight;
    }

    // Adicionar gráficos se disponíveis
    if (data.charts?.johariWindow) {
      yPosition += 10;
      if (yPosition > pageHeight - 50) {
        pdf.addPage();
        yPosition = 20;
      }
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Janela de Johari', 20, yPosition);
      yPosition += 10;
      
      // Aqui você pode adicionar a imagem do gráfico
      // pdf.addImage(data.charts.johariWindow, 'PNG', 20, yPosition, 100, 60);
    }
  }

  /**
   * Adiciona conteúdo comparativo ao PDF
   */
  private addComparativeContent(pdf: jsPDF, data: ReportData): void {
    let yPosition = 65;
    
    // Título
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Análise Comparativa', 20, yPosition);
    yPosition += 15;

    // Conteúdo comparativo
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    
    const content = `
    Este relatório apresenta uma análise comparativa dos resultados obtidos através da aplicação da Janela de Johari.
    
    Principais insights:
    • Análise de autoconsciência individual
    • Comparação entre autoavaliação e percepção dos pares
    • Identificação de áreas de desenvolvimento
    • Recomendações para crescimento pessoal
    
    Os dados apresentados são confidenciais e destinados exclusivamente ao desenvolvimento pessoal e profissional dos participantes.
    `;
    
    const lines = pdf.splitTextToSize(content, 170);
    for (const line of lines) {
      pdf.text(line, 20, yPosition);
      yPosition += 6;
    }
  }

  /**
   * Adiciona rodapé ao PDF
   */
  private addFooter(pdf: jsPDF, data: ReportData): void {
    // Obter número de páginas usando a propriedade interna
    const pageCount = (pdf as any).internal.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      
      // Linha separadora
      pdf.setDrawColor(168, 85, 247);
      pdf.setLineWidth(0.5);
      pdf.line(20, 280, 190, 280);
      
      // Data de geração
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Gerado em: ${data.generatedAt.toLocaleDateString('pt-BR')}`, 20, 285);
      
      // Página
      pdf.text(`Página ${i} de ${pageCount}`, 170, 285);
      
      // Copyright
      pdf.text('© Janela de Johari - Todos os direitos reservados', 20, 290);
    }
  }

  /**
   * Exporta múltiplos relatórios em lote
   */
  async exportBatchReports(
    reports: ReportData[],
    options: Partial<PDFExportOptions> = {}
  ): Promise<void> {
    try {
      for (let i = 0; i < reports.length; i++) {
        const report = reports[i];
        const reportOptions = {
          ...options,
          filename: `relatorio-${report.participantCode || i + 1}`
        };
        
        await this.exportIndividualReport(report, reportOptions);
        
        // Pequena pausa entre downloads para evitar problemas
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error('Erro ao exportar relatórios em lote:', error);
      throw new Error('Falha ao gerar relatórios em lote.');
    }
  }
}

// Instância singleton
export const pdfExportService = new PDFExportService();

// Hook para usar o serviço
export const usePDFExport = () => {
  const exportElement = async (elementId: string, options?: Partial<PDFExportOptions>) => {
    return await pdfExportService.exportElementToPDF(elementId, options);
  };

  const exportIndividualReport = async (data: ReportData, options?: Partial<PDFExportOptions>) => {
    return await pdfExportService.exportIndividualReport(data, options);
  };

  const exportComparativeReport = async (data: ReportData, options?: Partial<PDFExportOptions>) => {
    return await pdfExportService.exportComparativeReport(data, options);
  };

  const exportBatchReports = async (reports: ReportData[], options?: Partial<PDFExportOptions>) => {
    return await pdfExportService.exportBatchReports(reports, options);
  };

  return {
    exportElement,
    exportIndividualReport,
    exportComparativeReport,
    exportBatchReports
  };
};
