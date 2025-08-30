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

interface PendingUser extends User {
  course?: {
    id: string | number;
    name: string;
    code: string;
  };
  created_at: string;
  status: 'pending' | 'approved' | 'rejected';
}

const ApprovalsPage = () => {
  const { token, user } = useAuth();
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    if (token && user?.role === 3) {
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

  const handleApproval = async (userId: string | number, action: 'approve' | 'reject') => {
    try {
      const endpoint = action === 'approve' 
        ? ApiRoutes.USER_APPROVE(userId)
        : ApiRoutes.USER_REJECT(userId);
        
      await axios.post(
        endpoint,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success(
        action === 'approve' 
          ? "Usuário aprovado com sucesso!" 
          : "Usuário rejeitado com sucesso!"
      );
      
      // Atualizar a lista
      fetchPendingUsers();
    } catch (error) {
      console.error(`Erro ao ${action === 'approve' ? 'aprovar' : 'rejeitar'} usuário:`, error);
      toast.error(`Erro ao ${action === 'approve' ? 'aprovar' : 'rejeitar'} usuário.`);
    }
  };

  const filteredUsers = pendingUsers.filter(user => {
    if (filter === 'all') return true;
    return user.status === filter;
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

  if (user?.role !== 3) {
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
            Pendentes ({pendingUsers.filter(u => u.status === 'pending').length})
          </button>
          <button
            className={`filter-btn ${filter === 'approved' ? 'active' : ''}`}
            onClick={() => setFilter('approved')}
          >
            <Check size={16} />
            Aprovados ({pendingUsers.filter(u => u.status === 'approved').length})
          </button>
          <button
            className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`}
            onClick={() => setFilter('rejected')}
          >
            <X size={16} />
            Rejeitados ({pendingUsers.filter(u => u.status === 'rejected').length})
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
                {getStatusBadge(pendingUser.status)}
              </div>

              <div className="user-details">
                <div className="detail-item">
                  <strong>Tipo:</strong> {getRoleText(pendingUser.role)}
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
              </div>

              {pendingUser.status === 'pending' && (
                <div className="user-actions">
                  <Button
                    onClick={() => handleApproval(pendingUser.id, 'approve')}
                  >
                    <Check size={16} />
                    Aprovar
                  </Button>
                  <Button
                    onClick={() => handleApproval(pendingUser.id, 'reject')}
                  >
                    <X size={16} />
                    Rejeitar
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default withAuth(ApprovalsPage);
