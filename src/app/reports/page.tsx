"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/authContext";
import withAuth from "@/context/withAuth";
import axios from "axios";
import ApiRoutes from "@/services/constants";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { toast } from "react-toastify";
import "./reports.css";
import Button from "@/components/main/button";
import Spinner from "@/components/main/spinner";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

// Tipos para os dados dos gráficos e tabelas
type ChartData = {
  labels: string[];
  datasets: {
    label: string;
    data: (number | { x: string; y: number })[];
    backgroundColor?: string | string[];
    borderColor?: string;
    fill?: boolean;
  }[];
};

type ReportTables = {
  ranking?: { name: string; grade: number }[];
};

// Expandimos os tipos de relatório para cobrir todas as rotas
type ReportType =
  | "student_evolution"
  | "student_subject"
  | "teacher_group_summary"
  | "teacher_simulation_details"
  | "teacher_groups_comparison";

const ReportsPage = () => {
  const { token, user } = useAuth();
  
  // Define o tipo de relatório inicial com base no perfil do usuário
  const defaultReportType: ReportType = (user?.role === 1 || user?.role === 2) ? "teacher_groups_comparison" : "student_evolution";
  
  // Estados
  const [reportType, setReportType] = useState<ReportType>(defaultReportType);
  const [period, setPeriod] = useState({ start: "", end: "" });
  
  const [groupsList, setGroupsList] = useState<{ id: number; name: string }[]>([]);
  const [simulationsList, setSimulationsList] = useState<{ id: number; title: string }[]>([]);
  
  const [selectedGroup, setSelectedGroup] = useState<number | "">("");
  const [selectedSimulation, setSelectedSimulation] = useState<number | "">("");

  const [isLoading, setIsLoading] = useState(false);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [reportSummary, setReportSummary] = useState<any>(null);
  const [reportTables, setReportTables] = useState<ReportTables | null>(null);

  // Efeito para carregar dados necessários para os filtros de professor
  useEffect(() => {
    if ((user?.role === 1 || user?.role === 2) && token) {
      // Carrega lista de turmas
      axios.get(ApiRoutes.GROUPS, { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => setGroupsList(res.data))
        .catch(() => toast.error("Erro ao carregar lista de turmas."));
      
      // Carrega lista de simulados
      axios.get(ApiRoutes.SIMULATIONS, { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => setSimulationsList(res.data))
        .catch(() => toast.error("Erro ao carregar lista de simulados."));
    }
  }, [token, user]);

  const clearReportData = () => {
    setChartData(null);
    setReportSummary(null);
    setReportTables(null);
  };

  const handleReportTypeChange = (newType: ReportType) => {
    setReportType(newType);
    setSelectedGroup("");
    setSelectedSimulation("");
    clearReportData();
  };

  const generateReport = async () => {
    if (!token) return;

    // Validações de filtros
    const needsPeriod = reportType !== "teacher_simulation_details";
    if (needsPeriod && (!period.start || !period.end)) {
      return toast.error("Selecione o período inicial e final.");
    }
    if (reportType === "teacher_group_summary" && !selectedGroup) {
      return toast.error("Selecione a turma.");
    }
    if (reportType === "teacher_simulation_details" && !selectedSimulation) {
      return toast.error("Selecione o simulado.");
    }

    setIsLoading(true);
    clearReportData();

    try {
      let response;
      const params = { start_date: period.start, end_date: period.end };

      switch (reportType) {
        case "student_evolution":
          response = await axios.get(ApiRoutes.REPORTS_STUDENT_EVOLUTION, { headers: { Authorization: `Bearer ${token}` }, params });
          setChartData(response.data);
          break;

        case "student_subject":
          response = await axios.get(ApiRoutes.REPORTS_STUDENT_SUBJECT_PERFORMANCE, { headers: { Authorization: `Bearer ${token}` }, params });
          setChartData(response.data);
          break;

        case "teacher_group_summary":
          response = await axios.get(ApiRoutes.REPORTS_TEACHER_GROUP_SUMMARY(selectedGroup as number), { headers: { Authorization: `Bearer ${token}` }, params });
          const { grade_distribution, ...groupSummary } = response.data;
          setChartData(grade_distribution);
          setReportSummary(groupSummary);
          break;

        case "teacher_simulation_details":
          response = await axios.get(ApiRoutes.REPORTS_TEACHER_SIMULATION_DETAILS(selectedSimulation as number), { headers: { Authorization: `Bearer ${token}` } });
          const { most_difficult_questions, student_ranking, ...simSummary } = response.data;
          setChartData(most_difficult_questions);
          setReportSummary(simSummary);
          setReportTables({ ranking: student_ranking });
          break;

        case "teacher_groups_comparison":
          response = await axios.get(ApiRoutes.REPORTS_TEACHER_GROUPS_COMPARISON, { headers: { Authorization: `Bearer ${token}` }, params });
          setChartData(response.data);
          break;
      }
    } catch (error) {
      toast.error("Erro ao gerar relatório. Verifique os filtros e tente novamente.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderChart = () => {
    if (isLoading) return <Spinner />;
    if (!chartData && !reportSummary) return <p>Nenhum relatório gerado. Use os filtros acima.</p>;

    switch (reportType) {
      case "student_evolution":
        return <Line data={chartData!} options={{ responsive: true, plugins: { title: { display: true, text: 'Evolução de Desempenho Pessoal' } } }} />;
      
      case "student_subject":
        return <Bar data={chartData!} options={{ responsive: true, plugins: { title: { display: true, text: 'Desempenho Pessoal por Matéria' } } }} />;
      
      case "teacher_groups_comparison":
        return <Bar data={chartData!} options={{ responsive: true, plugins: { title: { display: true, text: 'Comparativo de Nota Média entre Turmas' } } }} />;

      case "teacher_group_summary":
        return (
          <>
            {reportSummary && (
              <div className="report-summary">
                <h4>{reportSummary.group_name}</h4>
                <p><strong>Nota Média:</strong> {reportSummary.average_grade}</p>
                <p><strong>Total de Alunos:</strong> {reportSummary.total_students}</p>
                <p><strong>Total de Tentativas:</strong> {reportSummary.total_attempts}</p>
              </div>
            )}
            {chartData && <Bar data={chartData} options={{ responsive: true, plugins: { title: { display: true, text: 'Distribuição de Notas da Turma' } } }} />}
          </>
        );
      
      case "teacher_simulation_details":
        return (
          <>
            {reportSummary && (
              <div className="report-summary">
                <h4>{reportSummary.simulation_title}</h4>
                <p><strong>Nota Média Geral:</strong> {reportSummary.average_grade}</p>
              </div>
            )}
            {chartData && (
              <div className="chart-section">
                <Bar data={chartData} options={{ responsive: true, plugins: { title: { display: true, text: 'Questões com Maior Taxa de Erro' } } }} />
              </div>
            )}
            {reportTables?.ranking && (
              <div className="chart-section">
                <Bar 
                  data={{
                    labels: reportTables.ranking.map(r => r.name),
                    datasets: [{
                      label: "Nota Final",
                      data: reportTables.ranking.map(r => r.grade),
                      backgroundColor: '#3f51b5'
                    }]
                  }} 
                  options={{ responsive: true, plugins: { title: { display: true, text: 'Ranking de Alunos no Simulado' } } }} 
                />
              </div>
            )}
          </>
        );

      default:
        return null;
    }
  }

  return (
    <div className="report-container">
      <h2>Relatórios de Desempenho</h2>

      <div className="report-filters">
        <div className="input-button-container">
          {/* SELETOR DE TIPO DE RELATÓRIO */}
          <label>
            Tipo:
            <select value={reportType} onChange={(e) => handleReportTypeChange(e.target.value as ReportType)} style={{ marginLeft: 10 }}>
              {user?.role !== 1 ? (
                <>
                  <option value="student_evolution">Evolução Pessoal</option>
                  <option value="student_subject">Desempenho por Matéria</option>
                </>
              ) : (
                <>
                  <option value="teacher_groups_comparison">Comparativo de Turmas</option>
                  <option value="teacher_group_summary">Resumo da Turma</option>
                  <option value="teacher_simulation_details">Detalhes do Simulado</option>
                </>
              )}
            </select>
          </label>

          {/* FILTRO DE PERÍODO (CONDICIONAL) */}
          {reportType !== "teacher_simulation_details" && (
            <>
              <label>Início:<input type="date" value={period.start} onChange={(e) => setPeriod({ ...period, start: e.target.value })} style={{ marginLeft: 10 }}/></label>
              <label>Fim:<input type="date" value={period.end} onChange={(e) => setPeriod({ ...period, end: e.target.value })} style={{ marginLeft: 10 }}/></label>
            </>
          )}
          
          {/* FILTRO DE TURMA (CONDICIONAL) */}
          {reportType === "teacher_group_summary" && (
            <label>
              Turma:
              <select value={selectedGroup} onChange={(e) => setSelectedGroup(Number(e.target.value))} style={{ marginLeft: 10 }}>
                <option value="">Selecione</option>
                {groupsList.map((grp) => (<option key={grp.id} value={grp.id}>{grp.name}</option>))}
              </select>
            </label>
          )}
          
          {/* FILTRO DE SIMULADO (CONDICIONAL) */}
          {reportType === "teacher_simulation_details" && (
            <label>
              Simulado:
              <select value={selectedSimulation} onChange={(e) => setSelectedSimulation(Number(e.target.value))} style={{ marginLeft: 10 }}>
                <option value="">Selecione</option>
                {simulationsList.map((sim) => (<option key={sim.id} value={sim.id}>{sim.title}</option>))}
              </select>
            </label>
          )}

          <Button onClick={generateReport} disabled={isLoading}>{isLoading ? "Gerando..." : "Gerar Relatório"}</Button>
        </div>
      </div>

      <div className="report-chart-area">
        {renderChart()}
      </div>
    </div>
  );
};

export default withAuth(ReportsPage);