"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/authContext";
import withAuth from "@/context/withAuth";
import axios from "@/services/axiosConfig";
import { format } from "date-fns";
import { toast } from "react-toastify";
import ApiRoutes from "@/services/constants";
import { User } from "@/types/types";
import { Check, X, Eye, UserCheck, UserX } from "lucide-react";
import Button from "@/components/main/button";
import "./approvals.css";

interface PendingUser {
  id: string | number;
  name: string;
  email: string;
  role: number;
  role_name: string;
  approval_status: 'pending' | 'approved' | 'rejected';
  course?: {
    id: string | number;
    name: string;
    code: string;
  };
  created_at: string;
  approved_at: string | null;
  approved_by: string | null;
}

const ApprovalsPage = () => {
  const { token, user } = useAuth();
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
  const [selectedRole, setSelectedRole] = useState<number>(0);

  useEffect(() => {
    if (token && user?.role === 3 || user?.role === 2) {
      fetchPendingUsers();
    }
  }, [token, user]);

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get<PendingUser[]>(
        ApiRoutes.USER_APPROVALS,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPendingUsers(data);
    } catch (error) {
      console.error('Erro ao carregar usuários pendentes:', error);
      toast.error("Erro ao carregar usuários pendentes.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRoleModal = (pendingUser: PendingUser) => {
    setSelectedUser(pendingUser);
    setSelectedRole(0); // Default para estudante
    setShowRoleModal(true);
  };

  const handleCloseRoleModal = () => {
    setShowRoleModal(false);
    setSelectedUser(null);
    setSelectedRole(0);
  };

  const handleApproval = async (userId: string | number, action: 'approve' | 'reject', role?: number) => {
    try {
      const endpoint = action === 'approve' 
        ? ApiRoutes.USER_APPROVE(userId)
        : ApiRoutes.USER_REJECT(userId);

      const payload = action === 'approve' && role !== undefined 
        ? { role } 
        : {};
        
      await axios.post(
        endpoint,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success(
        action === 'approve' 
          ? "Usuário aprovado com sucesso!" 
          : "Usuário rejeitado com sucesso!"
      );
      
      // Fechar modal se estiver aberto
      if (showRoleModal) {
        handleCloseRoleModal();
      }
      
      // Atualizar a lista
      fetchPendingUsers();
    } catch (error) {
      console.error(`Erro ao ${action === 'approve' ? 'aprovar' : 'rejeitar'} usuário:`, error);
      toast.error(`Erro ao ${action === 'approve' ? 'aprovar' : 'rejeitar'} usuário.`);
    }
  };

  const handleConfirmApproval = () => {
    if (selectedUser) {
      handleApproval(selectedUser.id, 'approve', selectedRole);
    }
  };

  const filteredUsers = pendingUsers.filter(user => {
    if (filter === 'all') return true;
    return user.approval_status === filter;
  });

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { text: 'Pendente', class: 'status-pending', icon: <UserCheck size={16} /> },
      approved: { text: 'Aprovado', class: 'status-approved', icon: <Check size={16} /> },
      rejected: { text: 'Rejeitado', class: 'status-rejected', icon: <X size={16} /> }
    };
    
    const badge = badges[status as keyof typeof badges] || badges.pending;
    
    return (
      <span className={`status-badge ${badge.class}`}>
        {badge.icon}
        {badge.text}
      </span>
    );
  };

  const getRoleText = (role: number) => {
    const roles = {
      0: 'Estudante',
      1: 'Professor',
      2: 'Admin',
      3: 'Superadmin'
    };
    return roles[role as keyof typeof roles] || 'Desconhecido';
  };

  if (user?.role !== 3 && user?.role !== 2) {
    return (
      <div className="approvals-container">
        <div className="access-denied">
          <h2>Acesso Negado</h2>
          <p>Apenas superadministradores podem acessar esta página.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="approvals-container">
        <div className="loading">Carregando usuários...</div>
      </div>
    );
  }

  return (
    <div className="approvals-container">
      <div className="approvals-header">
        <h2>Aprovação de Usuários</h2>
        <p>Gerencie as solicitações de cadastro de novos usuários</p>
      </div>

      <div className="filter-section">
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            <UserCheck size={16} />
            Pendentes ({pendingUsers.filter(u => u.approval_status === 'pending').length})
          </button>
          <button
            className={`filter-btn ${filter === 'approved' ? 'active' : ''}`}
            onClick={() => setFilter('approved')}
          >
            <Check size={16} />
            Aprovados ({pendingUsers.filter(u => u.approval_status === 'approved').length})
          </button>
          <button
            className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`}
            onClick={() => setFilter('rejected')}
          >
            <X size={16} />
            Rejeitados ({pendingUsers.filter(u => u.approval_status === 'rejected').length})
          </button>
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            <Eye size={16} />
            Todos ({pendingUsers.length})
          </button>
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="empty-state">
          <UserX size={48} />
          <h3>Nenhum usuário encontrado</h3>
          <p>
            {filter === 'pending' 
              ? 'Não há usuários aguardando aprovação no momento.'
              : `Não há usuários com status "${filter}".`
            }
          </p>
        </div>
      ) : (
        <div className="users-grid">
          {filteredUsers.map((pendingUser) => (
            <div key={pendingUser.id} className="user-card">
              <div className="user-header">
                <div className="user-info">
                  <h3>{pendingUser.name}</h3>
                  <p className="user-email">{pendingUser.email}</p>
                </div>
                {getStatusBadge(pendingUser.approval_status)}
              </div>

              <div className="user-details">
                <div className="detail-item">
                  <strong>Tipo:</strong> {pendingUser.role_name}
                </div>
                <div className="detail-item">
                  <strong>Curso:</strong> {pendingUser.course?.name || 'Não informado'}
                </div>
                <div className="detail-item">
                  <strong>Código do Curso:</strong> {pendingUser.course?.code || 'N/A'}
                </div>
                <div className="detail-item">
                  <strong>Data de Cadastro:</strong>{' '}
                  {format(new Date(pendingUser.created_at), "dd/MM/yyyy HH:mm")}
                </div>
                {pendingUser.approved_at && (
                  <div className="detail-item">
                    <strong>Data de Aprovação:</strong>{' '}
                    {format(new Date(pendingUser.approved_at), "dd/MM/yyyy HH:mm")}
                  </div>
                )}
              </div>

              {pendingUser.approval_status === 'pending' && (
                <div className="user-actions-icons">
                  <button
                    className="action-icon approve-icon"
                    onClick={() => handleOpenRoleModal(pendingUser)}
                    title="Aprovar usuário"
                  >
                    <Check size={18} />
                  </button>
                  <button
                    className="action-icon reject-icon"
                    onClick={() => handleApproval(pendingUser.id, 'reject')}
                    title="Rejeitar usuário"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal para seleção de role */}
      {showRoleModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Aprovar Usuário</h3>
              <button 
                className="close-button"
                onClick={handleCloseRoleModal}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="user-info-modal">
                <p><strong>Nome:</strong> {selectedUser.name}</p>
                <p><strong>Email:</strong> {selectedUser.email}</p>
                <p><strong>Curso:</strong> {selectedUser.course?.name}</p>
              </div>

              <div className="role-selection">
                <label htmlFor="role-select">Selecione o papel do usuário:</label>
                <select
                  id="role-select"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(Number(e.target.value))}
                >
                  <option value={0}>Estudante</option>
                  <option value={1}>Professor</option>
                  <option value={2}>Admin</option>
                </select>
                
                <div className="role-description">
                  {selectedRole === 0 && (
                    <p>Estudante: Pode participar de simulações e ver relatórios básicos.</p>
                  )}
                  {selectedRole === 1 && (
                    <p>Professor: Pode criar questões, corrigir respostas e ver relatórios detalhados.</p>
                  )}
                  {selectedRole === 2 && (
                    <p>Admin: Pode gerenciar cursos, grupos, simulações e usuários do curso.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button 
                className="cancel-button"
                onClick={handleCloseRoleModal}
              >
                Cancelar
              </button>
              <button 
                className="approve-button"
                onClick={handleConfirmApproval}
              >
                Aprovar como {selectedRole === 0 ? 'Estudante' : selectedRole === 1 ? 'Professor' : 'Admin'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default withAuth(ApprovalsPage);
