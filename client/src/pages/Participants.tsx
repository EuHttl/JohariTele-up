import React, { useState, useEffect } from 'react';
import { participantsAPI } from '../services/api';
import { Participant } from '../types';
import Modal from '../components/Modal';
import AssessmentViewer from '../components/AssessmentViewer';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Copy,
  CheckCircle,
  AlertCircle,
  Search,
  Eye,
  FileText,
  Users,
  X,
} from 'lucide-react';
import '../styles/design-system.css';

const Participants: React.FC = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAssessmentViewer, setShowAssessmentViewer] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);

  useEffect(() => {
    fetchParticipants();
  }, []);

  const fetchParticipants = async () => {
    try {
      setLoading(true);
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
      
      // Auto-hide success message
      setTimeout(() => setSuccess(''), 3000);
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
    if (window.confirm('Tem certeza que deseja excluir este participante? Esta ação não pode ser desfeita.')) {
      try {
        await participantsAPI.delete(id);
        setSuccess('Participante excluído com sucesso!');
        fetchParticipants();
        setTimeout(() => setSuccess(''), 3000);
      } catch (error: any) {
        setError(error.response?.data?.message || 'Erro ao excluir participante');
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess('Código copiado para a área de transferência!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleViewAssessment = (participant: Participant) => {
    setSelectedParticipant(participant);
    setShowAssessmentViewer(true);
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

  const getStatusBadge = (participant: Participant) => {
    if (participant.has_completed_self_assessment && participant.has_completed_peer_assessments) {
      return <span className="badge badge-success">Completo</span>;
    } else if (participant.has_completed_self_assessment) {
      return <span className="badge badge-warning">Em Progresso</span>;
    } else {
      return <span className="badge badge-error">Pendente</span>;
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Carregando participantes...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div>
            <h1 className="page-title">Participantes</h1>
            <p className="page-subtitle">Gerencie os participantes da avaliação comportamental</p>
          </div>
          <button
            onClick={() => {
              setEditingParticipant(null);
              setFormData({ name: '', email: '' });
              setShowModal(true);
            }}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4" />
            Adicionar Participante
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon">
              <Users className="w-6 h-6" />
            </div>
            <div className="stat-content">
              <p className="stat-value">{stats.total}</p>
              <p className="stat-label">Total</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
              <CheckCircle className="w-6 h-6" />
            </div>
            <div className="stat-content">
              <p className="stat-value">{stats.completed}</p>
              <p className="stat-label">Completos</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="stat-content">
              <p className="stat-value">{stats.inProgress}</p>
              <p className="stat-label">Em Progresso</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
              <Users className="w-6 h-6" />
            </div>
            <div className="stat-content">
              <p className="stat-value">{stats.pending}</p>
              <p className="stat-label">Pendentes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="alert alert-error">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
          <button 
            onClick={() => setError('')}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      
      {success && (
        <div className="alert alert-success">
          <CheckCircle className="w-5 h-5" />
          <span>{success}</span>
          <button 
            onClick={() => setSuccess('')}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search and Table */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
            <h3 className="card-title">Lista de Participantes</h3>
            <div className="search-bar" style={{ maxWidth: '400px', width: '100%' }}>
              <Search className="search-bar-icon" />
              <input
                type="text"
                placeholder="Buscar por nome, email ou código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.75rem' }}
              />
            </div>
          </div>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {filteredParticipants.length === 0 ? (
            <div className="empty-state">
              <Users className="empty-state-icon" />
              <h3 className="empty-state-title">
                {searchTerm ? 'Nenhum participante encontrado' : 'Nenhum participante cadastrado'}
              </h3>
              <p className="empty-state-description">
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
                  className="btn btn-primary"
                  style={{ marginTop: 'var(--space-4)' }}
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Primeiro Participante
                </button>
              )}
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: 'var(--radius-md)',
                            background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.875rem'
                          }}>
                            {participant.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{participant.name}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{participant.email}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                          <code style={{ 
                            background: 'var(--bg-gray-100)', 
                            padding: 'var(--space-1) var(--space-2)', 
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.8125rem',
                            fontFamily: 'monospace'
                          }}>
                            {participant.code}
                          </code>
                          <button
                            onClick={() => copyToClipboard(participant.code)}
                            className="action-btn"
                            title="Copiar código"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td>{getStatusBadge(participant)}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => handleViewAssessment(participant)}
                            className="action-btn"
                            title="Visualizar avaliações"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <a
                            href={`/report/${participant.code}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="action-btn"
                            title="Ver relatório"
                          >
                            <FileText className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => handleEdit(participant)}
                            className="action-btn"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(participant.id)}
                            className="action-btn danger"
                            title="Excluir"
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
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingParticipant(null);
          setFormData({ name: '', email: '' });
          setError('');
        }}
        title={editingParticipant ? 'Editar Participante' : 'Novo Participante'}
        size="md"
      >
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="alert alert-error" style={{ marginBottom: 'var(--space-4)' }}>
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}
          
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
          
          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', marginTop: 'var(--space-6)' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setShowModal(false);
                setEditingParticipant(null);
                setFormData({ name: '', email: '' });
                setError('');
              }}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {editingParticipant ? 'Atualizar' : 'Criar'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Assessment Viewer */}
      {selectedParticipant && (
        <AssessmentViewer
          participantCode={selectedParticipant.code}
          participantName={selectedParticipant.name}
          isOpen={showAssessmentViewer}
          onClose={() => {
            setShowAssessmentViewer(false);
            setSelectedParticipant(null);
          }}
        />
      )}
    </div>
  );
};

export default Participants;
