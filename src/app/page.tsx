"use client";

import React from 'react';
import { useAuth } from '@/context/authContext';
import withAuth from '@/context/withAuth';
import Link from 'next/link';
import {
  BookOpen,
  Users,
  ClipboardList,
  BarChart2,
  Settings,
  Bell,
  PlusCircle,
  ArrowRight,
  FileText,
  CheckSquare,
  LucideIcon
} from 'lucide-react';

// Importa o arquivo CSS dedicado
import './home.css';

// --- TYPE DEFINITIONS ---

interface User {
  name: string;
  role: number;
}

interface DashboardCardProps {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  color: string;
}

interface DashboardProps {
  user: User | null;
}

// --- COMPONENTS ---

const DashboardCard: React.FC<DashboardCardProps> = ({ title, description, href, icon: Icon, color }) => (
  <Link href={href}>
    <div className="dashboard-card">
      <div className="dashboard-card-content">
        <div className={`card-icon-wrapper ${color}`}>
          <Icon size={24} />
        </div>
        <h3 className="card-title">{title}</h3>
        <p className="card-description">{description}</p>
      </div>
      <div className="card-link">
        <span>Acessar</span>
        <ArrowRight size={16} />
      </div>
    </div>
  </Link>
);

const StudentDashboard: React.FC<DashboardProps> = ({ user }) => {
  return (
    <div className="homepage-header">
      <h1>Bem-vindo(a), {user?.name}!</h1>
      <p>Pronto para testar seus conhecimentos? Aqui estão suas opções.</p>

      <div className="dashboard-grid">
        <DashboardCard title="Iniciar Simulado" description="Veja os simulados disponíveis e comece um novo desafio." href="/simulations" icon={FileText} color="bg-blue" />
        <DashboardCard title="Meus Relatórios" description="Acompanhe sua evolução, acertos e erros por matéria." href="/reports" icon={BarChart2} color="bg-green" />
        <DashboardCard title="Meu Perfil" description="Atualize seus dados e altere sua senha." href="/profile" icon={Settings} color="bg-gray" />
      </div>
    </div>
  );
};

const AdminDashboard: React.FC<DashboardProps> = ({ user }) => {
  return (
    <div className="homepage-header">
      <h1>Painel do Administrador</h1>
      <p>Gerencie o conteúdo, os usuários e analise o desempenho geral.</p>

      <div className="dashboard-grid">
        <DashboardCard title="Criar Simulado" description="Elabore novas provas e atribua questões." href="/simulations/createEditSimulation" icon={PlusCircle} color="bg-blue" />
        <DashboardCard title="Gerenciar Questões" description="Crie, edite e organize o banco de questões e matérias." href="/questions" icon={BookOpen} color="bg-indigo" />
        <DashboardCard title="Gerenciar Turmas" description="Crie turmas, adicione alunos e atribua simulados." href="/groups" icon={Users} color="bg-purple" />
        <DashboardCard title="Corrigir Respostas" description="Acesse a fila de respostas discursivas para correção." href="/corrections" icon={CheckSquare} color="bg-green" />
        <DashboardCard title="Relatórios de Desempenho" description="Analise o desempenho de turmas e simulados." href="/reports" icon={BarChart2} color="bg-yellow" />
      </div>
    </div>
  );
};

const HomePage: React.FC = () => {
  const { user} = useAuth();

  return (
    <div className="homepage-container">
      {(user?.role === 1 || user?.role === 2) ? <AdminDashboard user={user} /> : <StudentDashboard user={user} />}
    </div>
  );
};

export default withAuth(HomePage);
