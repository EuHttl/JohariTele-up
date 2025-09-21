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
  AlertCircle
} from 'lucide-react';

const Participants: React.FC = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchParticipants();
  }, []);

  const fetchParticipants = async () => {
    try {
      const data = await participantsAPI.getAll();
      setParticipants(data);
    } catch (error) {
      console.error('Erro ao carregar participantes:', error);
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
      
      setShowModal(false);
      setEditingParticipant(null);
      setFormData({ name: '', email: '' });
      fetchParticipants();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao salvar participante');
    }
  };

  const handleEdit = (participant: Participant) => {
    setEditingParticipant(participant);
    setFormData({ name: participant.name, email: participant.email });
    setShowModal(true);
  };

  const handleDelete = async (participant: Participant) => {
    if (window.confirm(`Tem certeza que deseja excluir ${participant.name}? Esta ação não pode ser desfeita.`)) {
      try {
        await participantsAPI.delete(participant.id);
        setSuccess('Participante excluído com sucesso!');
        fetchParticipants();
      } catch (err: any) {
        setError(err.response?.data?.error || 'Erro ao excluir participante');
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Você pode adicionar uma notificação de sucesso aqui
  };

  const getStatusBadge = (participant: Participant) => {
    if (participant.has_completed_self_assessment && participant.has_completed_peer_assessments) {
      return <span className="badge badge-success">Completo</span>;
    } else if (participant.has_completed_self_assessment) {
      return <span className="badge badge-warning">Autoavaliação</span>;
    } else {
      return <span className="badge badge-error">Pendente</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
        <span className="ml-2">Carregando participantes...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-900 glow-text">Participantes</h1>
          <p className="text-sm text-gray-600">Gerencie os participantes da Janela de Johari</p>
        </div>
        <button
          onClick={() => {
            setEditingParticipant(null);
            setFormData({ name: '', email: '' });
            setShowModal(true);
          }}
          className="btn btn-primary animated-gradient shimmer"
        >
          <Plus className="h-4 w-4" />
          Adicionar Participante
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="alert alert-error flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success flex items-center">
          <CheckCircle className="h-5 w-5 mr-2" />
          {success}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 stagger-animation">
        <div className="card hover-lift animated-border">
          <div className="card-body p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center shimmer">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Total</p>
                <p className="text-lg font-bold text-gray-900">{participants.length}</p>
                <p className="text-xs text-gray-500">de 15 disponíveis</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card hover-lift animated-border">
          <div className="card-body p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center shimmer">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Completos</p>
                <p className="text-lg font-bold text-gray-900">
                  {participants.filter(p => p.has_completed_self_assessment && p.has_completed_peer_assessments).length}
                </p>
                <p className="text-xs text-gray-500">prontos para relatórios</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card hover-lift animated-border">
          <div className="card-body p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-yellow-100 rounded-lg flex items-center justify-center shimmer">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Pendentes</p>
                <p className="text-lg font-bold text-gray-900">
                  {participants.filter(p => !p.has_completed_self_assessment).length}
                </p>
                <p className="text-xs text-gray-500">aguardando avaliação</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Participants List */}
      <div className="card depth-card hover-lift">
        <div className="card-header p-4">
          <h3 className="card-title text-lg glow-text">Lista de Participantes</h3>
          <p className="card-subtitle text-sm">
            {participants.length === 0 ? 'Nenhum participante cadastrado' : `${participants.length} participante(s) cadastrado(s)`}
          </p>
        </div>
        <div className="card-body">
          {participants.length === 0 ? (
            <div className="text-center py-8">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum participante cadastrado</h3>
              <p className="text-gray-600 mb-4">Comece adicionando o primeiro participante ao sistema.</p>
              <button
                onClick={() => setShowModal(true)}
                className="btn btn-primary"
              >
                <Plus className="h-4 w-4" />
                Adicionar Participante
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-modern">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>Código de Acesso</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map((participant) => (
                    <tr key={participant.id}>
                      <td className="font-medium">{participant.name}</td>
                      <td className="text-gray-600">{participant.email}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                            {participant.code}
                          </span>
                          <button
                            onClick={() => copyToClipboard(participant.code)}
                            className="text-gray-400 hover:text-gray-600"
                            title="Copiar código"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                      <td>{getStatusBadge(participant)}</td>
                      <td>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(participant)}
                            className="btn btn-sm btn-outline"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(participant)}
                            className="btn btn-sm btn-error"
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
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

      {/* Modal Moderno */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 glow-text">
                  {editingParticipant ? 'Editar Participante' : 'Adicionar Participante'}
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingParticipant(null);
                    setFormData({ name: '', email: '' });
                    setError('');
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 rounded-full hover:bg-gray-100 hover-lift"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="form-group">
                  <label className="form-label">Nome</label>
                  <input
                    type="text"
                    className="form-input modern-focus"
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
                    className="form-input modern-focus"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    placeholder="email@exemplo.com"
                  />
                </div>

                {error && (
                  <div className="alert alert-error">
                    {error}
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingParticipant(null);
                      setFormData({ name: '', email: '' });
                      setError('');
                    }}
                    className="btn btn-outline flex-1 hover-lift"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary flex-1 animated-gradient shimmer"
                  >
                    {editingParticipant ? 'Atualizar' : 'Adicionar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Participants;
