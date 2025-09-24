export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html: string;
  text: string;
}

export interface EmailNotification {
  id: string;
  type: 'assessment_completed' | 'reminder' | 'report_ready' | 'welcome' | 'custom';
  recipient: string;
  subject: string;
  content: string;
  scheduledAt?: Date;
  sentAt?: Date;
  status: 'pending' | 'sent' | 'failed';
  metadata?: Record<string, any>;
}

export interface EmailSettings {
  enabled: boolean;
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
  from: {
    name: string;
    email: string;
  };
  templates: EmailTemplate[];
}

class EmailService {
  private settings: EmailSettings | null = null;
  private notifications: EmailNotification[] = [];

  constructor() {
    this.loadSettings();
    this.loadNotifications();
  }

  /**
   * Carrega configurações de email do localStorage
   */
  private loadSettings(): void {
    try {
      const saved = localStorage.getItem('email-settings');
      if (saved) {
        this.settings = JSON.parse(saved);
      } else {
        this.settings = this.getDefaultSettings();
      }
    } catch (error) {
      console.error('Erro ao carregar configurações de email:', error);
      this.settings = this.getDefaultSettings();
    }
  }

  /**
   * Carrega notificações do localStorage
   */
  private loadNotifications(): void {
    try {
      const saved = localStorage.getItem('email-notifications');
      if (saved) {
        this.notifications = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
      this.notifications = [];
    }
  }

  /**
   * Salva configurações no localStorage
   */
  private saveSettings(): void {
    if (this.settings) {
      localStorage.setItem('email-settings', JSON.stringify(this.settings));
    }
  }

  /**
   * Salva notificações no localStorage
   */
  private saveNotifications(): void {
    localStorage.setItem('email-notifications', JSON.stringify(this.notifications));
  }

  /**
   * Retorna configurações padrão
   */
  private getDefaultSettings(): EmailSettings {
    return {
      enabled: false,
      smtp: {
        host: '',
        port: 587,
        secure: false,
        auth: {
          user: '',
          pass: ''
        }
      },
      from: {
        name: 'Johari Tele-up',
        email: 'noreply@johari-teleup.com'
      },
      templates: this.getDefaultTemplates()
    };
  }

  /**
   * Retorna templates padrão
   */
  private getDefaultTemplates(): EmailTemplate[] {
    return [
      {
        id: 'welcome',
        name: 'Bem-vindo',
        subject: 'Bem-vindo ao Johari Tele-up!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #8b5cf6;">Bem-vindo ao Johari Tele-up!</h2>
            <p>Olá {{participantName}},</p>
            <p>Você foi convidado a participar da avaliação Johari Window. Esta ferramenta ajudará você a:</p>
            <ul>
              <li>Desenvolver maior autoconsciência</li>
              <li>Entender como os outros o percebem</li>
              <li>Identificar áreas de crescimento</li>
            </ul>
            <p><strong>Seu código de participante:</strong> {{participantCode}}</p>
            <p>Clique no link abaixo para começar sua avaliação:</p>
            <a href="{{assessmentLink}}" style="background: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Iniciar Avaliação</a>
            <p>Se você tiver alguma dúvida, não hesite em entrar em contato conosco.</p>
            <p>Atenciosamente,<br>Equipe Johari Tele-up</p>
          </div>
        `,
        text: `
          Bem-vindo ao Johari Tele-up!
          
          Olá {{participantName}},
          
          Você foi convidado a participar da avaliação Johari Window. Esta ferramenta ajudará você a:
          - Desenvolver maior autoconsciência
          - Entender como os outros o percebem
          - Identificar áreas de crescimento
          
          Seu código de participante: {{participantCode}}
          
          Acesse o link para começar sua avaliação: {{assessmentLink}}
          
          Se você tiver alguma dúvida, não hesite em entrar em contato conosco.
          
          Atenciosamente,
          Equipe Johari Tele-up
        `
      },
      {
        id: 'reminder',
        name: 'Lembrete',
        subject: 'Lembrete: Complete sua avaliação Johari',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #f59e0b;">Lembrete: Complete sua avaliação</h2>
            <p>Olá {{participantName}},</p>
            <p>Notamos que você ainda não completou sua avaliação Johari Window. Esta é uma oportunidade valiosa para:</p>
            <ul>
              <li>Descobrir insights sobre si mesmo</li>
              <li>Entender como os outros o veem</li>
              <li>Identificar áreas de desenvolvimento</li>
            </ul>
            <p><strong>Seu código:</strong> {{participantCode}}</p>
            <p>Complete sua avaliação agora:</p>
            <a href="{{assessmentLink}}" style="background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Continuar Avaliação</a>
            <p>Obrigado por sua participação!</p>
            <p>Atenciosamente,<br>Equipe Johari Tele-up</p>
          </div>
        `,
        text: `
          Lembrete: Complete sua avaliação Johari
          
          Olá {{participantName}},
          
          Notamos que você ainda não completou sua avaliação Johari Window. Esta é uma oportunidade valiosa para:
          - Descobrir insights sobre si mesmo
          - Entender como os outros o veem
          - Identificar áreas de desenvolvimento
          
          Seu código: {{participantCode}}
          
          Complete sua avaliação: {{assessmentLink}}
          
          Obrigado por sua participação!
          
          Atenciosamente,
          Equipe Johari Tele-up
        `
      },
      {
        id: 'assessment_completed',
        name: 'Avaliação Concluída',
        subject: 'Parabéns! Sua avaliação foi concluída',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #10b981;">Avaliação Concluída!</h2>
            <p>Olá {{participantName}},</p>
            <p>Parabéns! Você concluiu com sucesso sua avaliação Johari Window.</p>
            <p>Seus resultados estão prontos e incluem:</p>
            <ul>
              <li>Análise da sua Janela de Johari</li>
              <li>Insights sobre autoconsciência</li>
              <li>Recomendações de desenvolvimento</li>
            </ul>
            <p>Acesse seu relatório individual:</p>
            <a href="{{reportLink}}" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Ver Relatório</a>
            <p>Obrigado por participar desta jornada de autoconhecimento!</p>
            <p>Atenciosamente,<br>Equipe Johari Tele-up</p>
          </div>
        `,
        text: `
          Avaliação Concluída!
          
          Olá {{participantName}},
          
          Parabéns! Você concluiu com sucesso sua avaliação Johari Window.
          
          Seus resultados estão prontos e incluem:
          - Análise da sua Janela de Johari
          - Insights sobre autoconsciência
          - Recomendações de desenvolvimento
          
          Acesse seu relatório: {{reportLink}}
          
          Obrigado por participar desta jornada de autoconhecimento!
          
          Atenciosamente,
          Equipe Johari Tele-up
        `
      },
      {
        id: 'report_ready',
        name: 'Relatório Pronto',
        subject: 'Seu relatório Johari está pronto',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3b82f6;">Relatório Pronto!</h2>
            <p>Olá {{participantName}},</p>
            <p>Seu relatório individual da Janela de Johari está pronto para visualização.</p>
            <p>O relatório contém:</p>
            <ul>
              <li>Análise detalhada dos seus resultados</li>
              <li>Comparação entre autoavaliação e percepção dos pares</li>
              <li>Recomendações personalizadas</li>
            </ul>
            <p>Acesse seu relatório:</p>
            <a href="{{reportLink}}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Ver Relatório</a>
            <p>Este relatório é confidencial e destinado apenas ao seu desenvolvimento pessoal.</p>
            <p>Atenciosamente,<br>Equipe Johari Tele-up</p>
          </div>
        `,
        text: `
          Relatório Pronto!
          
          Olá {{participantName}},
          
          Seu relatório individual da Janela de Johari está pronto para visualização.
          
          O relatório contém:
          - Análise detalhada dos seus resultados
          - Comparação entre autoavaliação e percepção dos pares
          - Recomendações personalizadas
          
          Acesse seu relatório: {{reportLink}}
          
          Este relatório é confidencial e destinado apenas ao seu desenvolvimento pessoal.
          
          Atenciosamente,
          Equipe Johari Tele-up
        `
      }
    ];
  }

  /**
   * Verifica se o serviço de email está habilitado
   */
  isEnabled(): boolean {
    return this.settings?.enabled || false;
  }

  /**
   * Habilita/desabilita o serviço de email
   */
  setEnabled(enabled: boolean): void {
    if (this.settings) {
      this.settings.enabled = enabled;
      this.saveSettings();
    }
  }

  /**
   * Atualiza configurações de email
   */
  updateSettings(settings: Partial<EmailSettings>): void {
    if (this.settings) {
      this.settings = { ...this.settings, ...settings };
      this.saveSettings();
    }
  }

  /**
   * Retorna configurações atuais
   */
  getSettings(): EmailSettings | null {
    return this.settings;
  }

  /**
   * Adiciona uma nova notificação
   */
  addNotification(notification: Omit<EmailNotification, 'id' | 'status'>): string {
    const id = `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newNotification: EmailNotification = {
      ...notification,
      id,
      status: 'pending'
    };
    
    this.notifications.push(newNotification);
    this.saveNotifications();
    
    return id;
  }

  /**
   * Retorna todas as notificações
   */
  getNotifications(): EmailNotification[] {
    return this.notifications;
  }

  /**
   * Retorna notificações por status
   */
  getNotificationsByStatus(status: EmailNotification['status']): EmailNotification[] {
    return this.notifications.filter(n => n.status === status);
  }

  /**
   * Processa notificações pendentes
   */
  async processPendingNotifications(): Promise<void> {
    if (!this.isEnabled()) {
      console.log('Serviço de email desabilitado');
      return;
    }

    const pending = this.getNotificationsByStatus('pending');
    
    for (const notification of pending) {
      try {
        await this.sendEmail(notification);
        notification.status = 'sent';
        notification.sentAt = new Date();
      } catch (error) {
        console.error('Erro ao enviar email:', error);
        notification.status = 'failed';
      }
    }
    
    this.saveNotifications();
  }

  /**
   * Envia um email (simulação)
   */
  private async sendEmail(notification: EmailNotification): Promise<void> {
    // Simulação de envio de email
    console.log('Enviando email:', {
      to: notification.recipient,
      subject: notification.subject,
      content: notification.content
    });
    
    // Em um ambiente real, aqui seria feita a integração com um serviço de email
    // como SendGrid, Mailgun, AWS SES, etc.
    
    // Simular delay de envio
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  /**
   * Envia email de boas-vindas
   */
  async sendWelcomeEmail(participantName: string, participantCode: string, assessmentLink: string): Promise<string> {
    const template = this.settings?.templates.find(t => t.id === 'welcome');
    if (!template) {
      throw new Error('Template de boas-vindas não encontrado');
    }

    const content = template.html
      .replace(/\{\{participantName\}\}/g, participantName)
      .replace(/\{\{participantCode\}\}/g, participantCode)
      .replace(/\{\{assessmentLink\}\}/g, assessmentLink);

    return this.addNotification({
      type: 'welcome',
      recipient: '', // Será preenchido quando o participante for criado
      subject: template.subject,
      content,
      metadata: {
        participantName,
        participantCode,
        assessmentLink
      }
    });
  }

  /**
   * Envia lembrete de avaliação
   */
  async sendReminderEmail(participantName: string, participantCode: string, assessmentLink: string): Promise<string> {
    const template = this.settings?.templates.find(t => t.id === 'reminder');
    if (!template) {
      throw new Error('Template de lembrete não encontrado');
    }

    const content = template.html
      .replace(/\{\{participantName\}\}/g, participantName)
      .replace(/\{\{participantCode\}\}/g, participantCode)
      .replace(/\{\{assessmentLink\}\}/g, assessmentLink);

    return this.addNotification({
      type: 'reminder',
      recipient: '',
      subject: template.subject,
      content,
      metadata: {
        participantName,
        participantCode,
        assessmentLink
      }
    });
  }

  /**
   * Envia notificação de avaliação concluída
   */
  async sendAssessmentCompletedEmail(participantName: string, reportLink: string): Promise<string> {
    const template = this.settings?.templates.find(t => t.id === 'assessment_completed');
    if (!template) {
      throw new Error('Template de avaliação concluída não encontrado');
    }

    const content = template.html
      .replace(/\{\{participantName\}\}/g, participantName)
      .replace(/\{\{reportLink\}\}/g, reportLink);

    return this.addNotification({
      type: 'assessment_completed',
      recipient: '',
      subject: template.subject,
      content,
      metadata: {
        participantName,
        reportLink
      }
    });
  }

  /**
   * Envia notificação de relatório pronto
   */
  async sendReportReadyEmail(participantName: string, reportLink: string): Promise<string> {
    const template = this.settings?.templates.find(t => t.id === 'report_ready');
    if (!template) {
      throw new Error('Template de relatório pronto não encontrado');
    }

    const content = template.html
      .replace(/\{\{participantName\}\}/g, participantName)
      .replace(/\{\{reportLink\}\}/g, reportLink);

    return this.addNotification({
      type: 'report_ready',
      recipient: '',
      subject: template.subject,
      content,
      metadata: {
        participantName,
        reportLink
      }
    });
  }

  /**
   * Agenda envio de email
   */
  scheduleEmail(notification: Omit<EmailNotification, 'id' | 'status'>, scheduledAt: Date): string {
    return this.addNotification({
      ...notification,
      scheduledAt
    });
  }

  /**
   * Remove notificação
   */
  removeNotification(id: string): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.saveNotifications();
  }

  /**
   * Limpa notificações antigas
   */
  cleanupOldNotifications(daysOld: number = 30): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    this.notifications = this.notifications.filter(n => {
      const notificationDate = n.sentAt || new Date(n.id.split('_')[1]);
      return notificationDate > cutoffDate;
    });
    
    this.saveNotifications();
  }
}

// Instância singleton
export const emailService = new EmailService();

// Hook para usar o serviço
export const useEmailService = () => {
  return {
    isEnabled: () => emailService.isEnabled(),
    setEnabled: (enabled: boolean) => emailService.setEnabled(enabled),
    getSettings: () => emailService.getSettings(),
    updateSettings: (settings: Partial<EmailSettings>) => emailService.updateSettings(settings),
    getNotifications: () => emailService.getNotifications(),
    addNotification: (notification: Omit<EmailNotification, 'id' | 'status'>) => emailService.addNotification(notification),
    sendWelcomeEmail: (name: string, code: string, link: string) => emailService.sendWelcomeEmail(name, code, link),
    sendReminderEmail: (name: string, code: string, link: string) => emailService.sendReminderEmail(name, code, link),
    sendAssessmentCompletedEmail: (name: string, link: string) => emailService.sendAssessmentCompletedEmail(name, link),
    sendReportReadyEmail: (name: string, link: string) => emailService.sendReportReadyEmail(name, link),
    processPendingNotifications: () => emailService.processPendingNotifications(),
    cleanupOldNotifications: (days: number) => emailService.cleanupOldNotifications(days)
  };
};
