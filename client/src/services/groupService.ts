export interface Group {
  id: string;
  name: string;
  description: string;
  color: string;
  created_at: string;
  updated_at: string;
  participant_count: number;
  is_active: boolean;
}

export interface GroupParticipant {
  id: string;
  group_id: string;
  participant_id: string;
  participant_name: string;
  participant_email: string;
  joined_at: string;
  role: 'member' | 'admin';
}

export interface GroupStats {
  total_groups: number;
  active_groups: number;
  total_participants: number;
  average_participants_per_group: number;
  groups_with_completed_assessments: number;
}

export interface GroupReport {
  group_id: string;
  group_name: string;
  total_participants: number;
  completed_assessments: number;
  completion_rate: number;
  average_score: number;
  top_performers: Array<{
    name: string;
    score: number;
  }>;
  insights: string[];
}

class GroupService {
  private groups: Group[] = [];
  private groupParticipants: GroupParticipant[] = [];

  constructor() {
    this.loadData();
  }

  private loadData(): void {
    try {
      const savedGroups = localStorage.getItem('johari-groups');
      if (savedGroups) {
        this.groups = JSON.parse(savedGroups);
      }

      const savedParticipants = localStorage.getItem('johari-group-participants');
      if (savedParticipants) {
        this.groupParticipants = JSON.parse(savedParticipants);
      }
    } catch (error) {
      console.error('Erro ao carregar dados de grupos:', error);
      this.groups = [];
      this.groupParticipants = [];
    }
  }

  private saveData(): void {
    localStorage.setItem('johari-groups', JSON.stringify(this.groups));
    localStorage.setItem('johari-group-participants', JSON.stringify(this.groupParticipants));
  }

  /**
   * Cria um novo grupo
   */
  createGroup(groupData: Omit<Group, 'id' | 'created_at' | 'updated_at' | 'participant_count'>): Group {
    const newGroup: Group = {
      ...groupData,
      id: `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      participant_count: 0,
      is_active: true
    };

    this.groups.push(newGroup);
    this.saveData();
    return newGroup;
  }

  /**
   * Atualiza um grupo existente
   */
  updateGroup(id: string, updates: Partial<Omit<Group, 'id' | 'created_at' | 'updated_at' | 'participant_count'>>): Group | null {
    const groupIndex = this.groups.findIndex(g => g.id === id);
    if (groupIndex === -1) return null;

    this.groups[groupIndex] = {
      ...this.groups[groupIndex],
      ...updates,
      updated_at: new Date().toISOString()
    };

    this.saveData();
    return this.groups[groupIndex];
  }

  /**
   * Remove um grupo
   */
  deleteGroup(id: string): boolean {
    const groupIndex = this.groups.findIndex(g => g.id === id);
    if (groupIndex === -1) return false;

    // Remove todos os participantes do grupo
    this.groupParticipants = this.groupParticipants.filter(gp => gp.group_id !== id);
    
    // Remove o grupo
    this.groups.splice(groupIndex, 1);
    
    this.saveData();
    return true;
  }

  /**
   * Retorna todos os grupos
   */
  getAllGroups(): Group[] {
    return this.groups;
  }

  /**
   * Retorna um grupo por ID
   */
  getGroupById(id: string): Group | null {
    return this.groups.find(g => g.id === id) || null;
  }

  /**
   * Retorna grupos ativos
   */
  getActiveGroups(): Group[] {
    return this.groups.filter(g => g.is_active);
  }

  /**
   * Adiciona participante a um grupo
   */
  addParticipantToGroup(groupId: string, participantId: string, participantName: string, participantEmail: string, role: 'member' | 'admin' = 'member'): GroupParticipant {
    const newGroupParticipant: GroupParticipant = {
      id: `gp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      group_id: groupId,
      participant_id: participantId,
      participant_name: participantName,
      participant_email: participantEmail,
      joined_at: new Date().toISOString(),
      role
    };

    this.groupParticipants.push(newGroupParticipant);
    
    // Atualiza contador de participantes
    this.updateGroupParticipantCount(groupId);
    
    this.saveData();
    return newGroupParticipant;
  }

  /**
   * Remove participante de um grupo
   */
  removeParticipantFromGroup(groupId: string, participantId: string): boolean {
    const participantIndex = this.groupParticipants.findIndex(
      gp => gp.group_id === groupId && gp.participant_id === participantId
    );
    
    if (participantIndex === -1) return false;

    this.groupParticipants.splice(participantIndex, 1);
    
    // Atualiza contador de participantes
    this.updateGroupParticipantCount(groupId);
    
    this.saveData();
    return true;
  }

  /**
   * Retorna participantes de um grupo
   */
  getGroupParticipants(groupId: string): GroupParticipant[] {
    return this.groupParticipants.filter(gp => gp.group_id === groupId);
  }

  /**
   * Retorna grupos de um participante
   */
  getParticipantGroups(participantId: string): Group[] {
    const participantGroupIds = this.groupParticipants
      .filter(gp => gp.participant_id === participantId)
      .map(gp => gp.group_id);
    
    return this.groups.filter(g => participantGroupIds.includes(g.id));
  }

  /**
   * Atualiza contador de participantes de um grupo
   */
  private updateGroupParticipantCount(groupId: string): void {
    const participantCount = this.groupParticipants.filter(gp => gp.group_id === groupId).length;
    const groupIndex = this.groups.findIndex(g => g.id === groupId);
    
    if (groupIndex !== -1) {
      this.groups[groupIndex].participant_count = participantCount;
    }
  }

  /**
   * Retorna estatísticas dos grupos
   */
  getGroupStats(): GroupStats {
    const totalGroups = this.groups.length;
    const activeGroups = this.groups.filter(g => g.is_active).length;
    const totalParticipants = this.groupParticipants.length;
    const averageParticipantsPerGroup = totalGroups > 0 ? totalParticipants / totalGroups : 0;
    
    // Simular grupos com avaliações completas (em produção viria do banco)
    const groupsWithCompletedAssessments = Math.floor(activeGroups * 0.7);

    return {
      total_groups: totalGroups,
      active_groups: activeGroups,
      total_participants: totalParticipants,
      average_participants_per_group: Math.round(averageParticipantsPerGroup * 10) / 10,
      groups_with_completed_assessments: groupsWithCompletedAssessments
    };
  }

  /**
   * Gera relatório de um grupo
   */
  generateGroupReport(groupId: string): GroupReport | null {
    const group = this.getGroupById(groupId);
    if (!group) return null;

    const participants = this.getGroupParticipants(groupId);
    const totalParticipants = participants.length;
    
    // Simular dados de avaliação (em produção viria do banco)
    const completedAssessments = Math.floor(totalParticipants * 0.8);
    const completionRate = totalParticipants > 0 ? (completedAssessments / totalParticipants) * 100 : 0;
    const averageScore = 75 + Math.random() * 20; // Simular pontuação entre 75-95

    // Simular top performers
    const topPerformers = participants.slice(0, 3).map((p, index) => ({
      name: p.participant_name,
      score: Math.round(85 + Math.random() * 15)
    }));

    // Simular insights
    const insights = [
      `Taxa de conclusão de ${Math.round(completionRate)}%`,
      `Pontuação média de ${Math.round(averageScore)}%`,
      `${topPerformers.length} participantes em alta performance`,
      'Boa diversidade de perfis no grupo'
    ];

    return {
      group_id: groupId,
      group_name: group.name,
      total_participants: totalParticipants,
      completed_assessments: completedAssessments,
      completion_rate: Math.round(completionRate * 10) / 10,
      average_score: Math.round(averageScore * 10) / 10,
      top_performers: topPerformers,
      insights
    };
  }

  /**
   * Retorna relatórios de todos os grupos
   */
  getAllGroupReports(): GroupReport[] {
    return this.groups.map(group => this.generateGroupReport(group.id)).filter(report => report !== null) as GroupReport[];
  }

  /**
   * Busca grupos por nome
   */
  searchGroups(query: string): Group[] {
    const lowercaseQuery = query.toLowerCase();
    return this.groups.filter(group => 
      group.name.toLowerCase().includes(lowercaseQuery) ||
      group.description.toLowerCase().includes(lowercaseQuery)
    );
  }

  /**
   * Retorna grupos com mais participantes
   */
  getTopGroupsByParticipants(limit: number = 5): Group[] {
    return [...this.groups]
      .sort((a, b) => b.participant_count - a.participant_count)
      .slice(0, limit);
  }

  /**
   * Retorna grupos recentes
   */
  getRecentGroups(limit: number = 5): Group[] {
    return [...this.groups]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
  }

  /**
   * Exporta dados dos grupos
   */
  exportGroupsData(): string {
    const data = {
      groups: this.groups,
      groupParticipants: this.groupParticipants,
      exported_at: new Date().toISOString()
    };
    
    return JSON.stringify(data, null, 2);
  }

  /**
   * Importa dados dos grupos
   */
  importGroupsData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.groups && Array.isArray(data.groups)) {
        this.groups = data.groups;
      }
      
      if (data.groupParticipants && Array.isArray(data.groupParticipants)) {
        this.groupParticipants = data.groupParticipants;
      }
      
      this.saveData();
      return true;
    } catch (error) {
      console.error('Erro ao importar dados:', error);
      return false;
    }
  }
}

// Instância singleton
export const groupService = new GroupService();

// Hook para usar o serviço
export const useGroupService = () => {
  return {
    // Grupos
    createGroup: (data: Omit<Group, 'id' | 'created_at' | 'updated_at' | 'participant_count'>) => groupService.createGroup(data),
    updateGroup: (id: string, updates: Partial<Omit<Group, 'id' | 'created_at' | 'updated_at' | 'participant_count'>>) => groupService.updateGroup(id, updates),
    deleteGroup: (id: string) => groupService.deleteGroup(id),
    getAllGroups: () => groupService.getAllGroups(),
    getGroupById: (id: string) => groupService.getGroupById(id),
    getActiveGroups: () => groupService.getActiveGroups(),
    searchGroups: (query: string) => groupService.searchGroups(query),
    getTopGroupsByParticipants: (limit?: number) => groupService.getTopGroupsByParticipants(limit),
    getRecentGroups: (limit?: number) => groupService.getRecentGroups(limit),
    
    // Participantes
    addParticipantToGroup: (groupId: string, participantId: string, participantName: string, participantEmail: string, role?: 'member' | 'admin') => groupService.addParticipantToGroup(groupId, participantId, participantName, participantEmail, role),
    removeParticipantFromGroup: (groupId: string, participantId: string) => groupService.removeParticipantFromGroup(groupId, participantId),
    getGroupParticipants: (groupId: string) => groupService.getGroupParticipants(groupId),
    getParticipantGroups: (participantId: string) => groupService.getParticipantGroups(participantId),
    
    // Relatórios e Estatísticas
    getGroupStats: () => groupService.getGroupStats(),
    generateGroupReport: (groupId: string) => groupService.generateGroupReport(groupId),
    getAllGroupReports: () => groupService.getAllGroupReports(),
    
    // Import/Export
    exportGroupsData: () => groupService.exportGroupsData(),
    importGroupsData: (jsonData: string) => groupService.importGroupsData(jsonData)
  };
};
