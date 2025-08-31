'use client';

import { useAuth } from '@/context/authContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import './pending-approval.css';

const PendingApproval = () => {
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Se o usuário não estiver logado, redirecionar para login
    if (!user) {
      router.push('/login');
      return;
    }

    // Se o usuário já foi aprovado, redirecionar para home
    if (user.approval_status === 'approved') {
      router.push('/');
      return;
    }

    // Se o usuário foi rejeitado, mostrar mensagem específica
    if (user.approval_status === 'rejected') {
      // Permanece na página para mostrar a mensagem de rejeição
      return;
    }
  }, [user, router]);

  const handleLogout = () => {
    logout();
  };

  if (!user) {
    return null; // Evita flash de conteúdo antes do redirecionamento
  }

  return (
    <div className="pending-approval-container">
      <div className="pending-approval-card">
        <div className="status-icon">
          {user.approval_status === 'rejected' ? (
            <div className="rejected-icon">❌</div>
          ) : (
            <div className="pending-icon">⏳</div>
          )}
        </div>

        <h1>
          {user.approval_status === 'rejected' 
            ? 'Cadastro Rejeitado' 
            : 'Aguardando Aprovação'
          }
        </h1>

        <div className="user-info-approval">
          <p><strong>Nome:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Curso:</strong> {user.course?.name || 'N/A'}</p>
        </div>

        {user.approval_status === 'rejected' ? (
          <div className="message">
            <p>
              Infelizmente, seu cadastro foi rejeitado pelos administradores.
              Entre em contato com a coordenação do curso para mais informações.
            </p>
            <div className="contact-info">
              <p><strong>Curso:</strong> {user.course?.name}</p>
              <p><strong>Código:</strong> {user.course?.code}</p>
            </div>
          </div>
        ) : (
          <div className="message">
            <p>
              Seu cadastro está sendo analisado pelos administradores do curso.
              Você receberá uma notificação por email quando sua conta for aprovada.
            </p>
            <div className="info-box">
              <h3>O que acontece agora?</h3>
              <ul>
                <li>Os administradores do curso <strong>{user.course?.name}</strong> irão revisar seu cadastro</li>
                <li>Você receberá um email de confirmação quando aprovado</li>
                <li>Após a aprovação, você poderá acessar todas as funcionalidades</li>
              </ul>
            </div>
          </div>
        )}

        <div className="actions">
          <button onClick={handleLogout} className="logout-btn">
            Sair da Conta
          </button>
        </div>

        <div className="help-text">
          <p>
            Precisa de ajuda? Entre em contato com o suporte através do email:{' '}
            <a href="mailto:suporte@uniquest.com">suporte@uniquest.com</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PendingApproval;
