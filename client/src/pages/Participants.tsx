import React, { useState, useEffect } from 'react';
import { participantsAPI } from '../services/api';
import { Participant } from '../types';
import { 
  Plus, 
  Edit, 
  Trash2, 
  User, 
  Copy,
  CheckCircle,
  AlertCircle,
  Search,
  Eye,
  FileText,
  Users
} from 'lucide-react';
import '../styles/participants.css';

const Participants: React.FC = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchParticipants();
  }, []);

  const fetchParticipants = async () => {
    try {
      const data = await participantsAPI.getAll();
      setParticipants(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao carregar participantes:', error);
      setParticipants([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingParticipant) {
        await participantsAPI.update(editingParticipant.id, formData.name, formData.email);
        setSuccess('Participante atualizado com sucesso!');
      } else {
        await participantsAPI.create(formData.name, formData.email);
        setSuccess('Participante criado com sucesso!');
      }
      
      setFormData({ name: '', email: '' });
      setShowModal(false);
      setEditingParticipant(null);
      fetchParticipants();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Erro ao salvar participante');
    }
  };

  const handleEdit = (participant: Participant) => {
    setEditingParticipant(participant);
    setFormData({ name: participant.name, email: participant.email });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este participante?')) {
      try {
        await participantsAPI.delete(id);
        setSuccess('Participante excluído com sucesso!');
        fetchParticipants();
      } catch (error: any) {
        setError(error.response?.data?.message || 'Erro ao excluir participante');
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess('Código copiado para a área de transferência!');
  };

  const getStatusBadge = (participant: Participant) => {
    if (participant.has_completed_self_assessment && participant.has_completed_peer_assessments) {
      return (
        <span className="participant-status-badge complete">
          <CheckCircle className="w-3 h-3 mr-1" />
          Completo
        </span>
      );
    } else if (participant.has_completed_self_assessment) {
      return (
        <span className="participant-status-badge in-progress">
          <AlertCircle className="w-3 h-3 mr-1" />
          Em Progresso
        </span>
      );
    } else {
      return (
        <span className="participant-status-badge pending">
          <User className="w-3 h-3 mr-1" />
          Pendente
        </span>
      );
    }
  };

  const filteredParticipants = participants.filter(participant =>
    participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    participant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    participant.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: participants.length,
    completed: participants.filter(p => p.has_completed_self_assessment && p.has_completed_peer_assessments).length,
    inProgress: participants.filter(p => p.has_completed_self_assessment && !p.has_completed_peer_assessments).length,
    pending: participants.filter(p => !p.has_completed_self_assessment).length
  };

  if (loading) {
    return (
      <div className="participants-loading">
        <div className="participants-loading-content">
          <div className="participants-loading-spinner"></div>
          <p className="participants-loading-text">Carregando participantes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="participants-container">
      {/* Header */}
      <div className="participants-header">
        <div className="participants-title-section">
          <div className="participants-title-icon">
            <Users className="w-12 h-12 text-white" />
          </div>
          <div>
            <h1 className="participants-title">Participantes</h1>
            <p className="participants-subtitle">Gerencie os participantes da avaliação</p>
          </div>
        </div>
        <div className="participants-actions">
          <div className="participants-search">
            <Search className="participants-search-icon" />
            <input
              type="text"
              placeholder="Buscar participantes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="participants-search-input"
            />
          </div>
          <button
            onClick={() => {
              setEditingParticipant(null);
              setFormData({ name: '', email: '' });
              setShowModal(true);
            }}
            className="participants-add-btn"
          >
            <Plus className="w-5 h-5 mr-2" />
            Adicionar Participante
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="participants-stats">
        <div className="participants-stat-card">
          <div className="participants-stat-header">
            <div className="participants-stat-icon total">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div className="participants-stat-number">{stats.total}</div>
          </div>
          <h3 className="participants-stat-label">Total</h3>
          <p className="participants-stat-description">Participantes cadastrados</p>
        </div>

        <div className="participants-stat-card">
          <div className="participants-stat-header">
            <div className="participants-stat-icon completed">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <div className="participants-stat-number">{stats.completed}</div>
          </div>
          <h3 className="participants-stat-label">Completos</h3>
          <p className="participants-stat-description">Avaliações finalizadas</p>
        </div>

        <div className="participants-stat-card">
          <div className="participants-stat-header">
            <div className="participants-stat-icon in-progress">
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
            <div className="participants-stat-number">{stats.inProgress}</div>
          </div>
          <h3 className="participants-stat-label">Em Progresso</h3>
          <p className="participants-stat-description">Autoavaliação concluída</p>
        </div>

        <div className="participants-stat-card">
          <div className="participants-stat-header">
            <div className="participants-stat-icon pending">
              <User className="w-8 h-8 text-white" />
            </div>
            <div className="participants-stat-number">{stats.pending}</div>
          </div>
          <h3 className="participants-stat-label">Pendentes</h3>
          <p className="participants-stat-description">Aguardando início</p>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="alert alert-error">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}
      
      {success && (
        <div className="alert alert-success">
          <CheckCircle className="w-5 h-5 mr-2" />
          {success}
        </div>
      )}

      {/* Participants List */}
      <div className="participants-list-card">
        <div className="participants-list-header">
          <h2 className="participants-list-title">Lista de Participantes</h2>
        </div>
        
        <div className="participants-list-content">
          {filteredParticipants.length === 0 ? (
            <div className="participants-empty-state">
              <div className="participants-empty-icon">
                <Users className="w-16 h-16 text-gray-400" />
              </div>
              <h3 className="participants-empty-title">
                {searchTerm ? 'Nenhum participante encontrado' : 'Nenhum participante cadastrado'}
              </h3>
              <p className="participants-empty-description">
                {searchTerm 
                  ? 'Tente ajustar os termos de busca'
                  : 'Comece adicionando participantes ao sistema'
                }
              </p>
              {!searchTerm && (
                <button
                  onClick={() => {
                    setEditingParticipant(null);
                    setFormData({ name: '', email: '' });
                    setShowModal(true);
                  }}
                  className="participants-empty-btn"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Adicionar Primeiro Participante
                </button>
              )}
            </div>
          ) : (
            <div className="participants-table-responsive">
              <table className="participants-table">
                <thead>
                  <tr>
                    <th>Participante</th>
                    <th>Email</th>
                    <th>Código</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParticipants.map((participant) => (
                    <tr key={participant.id}>
                      <td>
                        <div className="participant-info">
                          <div className="participant-avatar">
                            {participant.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="participant-details">
                            <p className="participant-name">{participant.name}</p>
                            <p className="participant-email">{participant.email}</p>
                          </div>
                        </div>
                      </td>
                      <td>{participant.email}</td>
                      <td>
                        <span className="participant-code">{participant.code}</span>
                      </td>
                      <td>{getStatusBadge(participant)}</td>
                      <td>
                        <div className="participants-actions-cell">
                          <button
                            onClick={() => copyToClipboard(participant.code)}
                            className="participants-action-btn view"
                            title="Copiar código"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <a
                            href={`/assessment/${participant.code}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="participants-action-btn view"
                            title="Visualizar avaliação"
                          >
                            <Eye className="w-4 h-4" />
                          </a>
                          {participant.has_completed_self_assessment && participant.has_completed_peer_assessments && (
                            <a
                              href={`/report/${participant.code}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="participants-action-btn report"
                              title="Ver relatório"
                            >
                              <FileText className="w-4 h-4" />
                            </a>
                          )}
                          <button
                            onClick={() => handleEdit(participant)}
                            className="participants-action-btn edit"
                            title="Editar participante"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(participant.id)}
                            className="participants-action-btn delete"
                            title="Excluir participante"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="card-header">
              <h2 className="card-title">
                {editingParticipant ? 'Editar Participante' : 'Novo Participante'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="card-body">
              <div className="form-group">
                <label className="form-label">Nome</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Nome completo do participante"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="email@exemplo.com"
                />
              </div>
              
              <div className="card-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingParticipant ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Participants;