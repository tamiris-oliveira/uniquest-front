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
import type { GeneralReport, SubjectReport, GroupReport } from "@/types/types";
import "./reports.css";
import Button from "@/components/main/button";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

type ReportType = "general" | "subject" | "group";

const ReportsPage = () => {
  const { token, user } = useAuth();
  const [reportType, setReportType] = useState<ReportType>("general");
  const [period, setPeriod] = useState({ start: "", end: "" });
  const [groupsList, setGroupsList] = useState<{ id: number; name: string }[]>([]);

  const [selectedGroup, setSelectedGroup] = useState<number | "">("");

  const [general, setGeneral] = useState<GeneralReport | null>(null);
  const [subjects, setSubjects] = useState<SubjectReport[]>([]);
  const [groupReports, setGroupReports] = useState<GroupReport[]>([]);

  useEffect(() => {
    if (!token) return;

    if (user?.role === 1) {
      axios
        .get(ApiRoutes.GROUPS, { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => setGroupsList(res.data))
        .catch(() => toast.error("Erro ao carregar lista de grupos."));
    }
  }, [token, user]);

  const buildParams = () => {
    const params: any = {};
    if (period.start) params.start_date = period.start;
    if (period.end) params.end_date = period.end;

    if (reportType === "group" && selectedGroup) {
      params.group_id = selectedGroup;
    }
    return params;
  };

  const generateReport = async () => {
    if (!token) return;

    if (!period.start || !period.end) {
      toast.error("Selecione período inicial e final.");
      return;
    }

    if (reportType === "group" && !selectedGroup) {
      toast.error("Selecione o grupo.");
      return;
    }

    try {
      if (reportType === "general") {
        const { data } = await axios.get(ApiRoutes.REPORTS_SUMMARY, {
          headers: { Authorization: `Bearer ${token}` },
          params: buildParams(),
        });
        setGeneral(data);
        setSubjects([]);
        setGroupReports([]);
      } else if (reportType === "subject") {
        const { data } = await axios.get(ApiRoutes.REPORTS_BY_SUBJECT, {
          headers: { Authorization: `Bearer ${token}` },
          params: buildParams(),
        });
        setSubjects(data);
        setGeneral(null);
        setGroupReports([]);
      } else if (reportType === "group") {
        const { data } = await axios.get(ApiRoutes.REPORTS_BY_GROUP, {
          headers: { Authorization: `Bearer ${token}` },
          params: buildParams(),
        });
        setGroupReports([data]); 
        setGeneral(null);
        setSubjects([]);
      }
    } catch {
      toast.error("Erro ao carregar relatório.");
    }
  };

  const chartData = {
    labels: subjects.map((s) => s.subject_name),
    datasets: [
      {
        label: "Acertos",
        data: subjects.map((s) => s.correct_answers),
        backgroundColor: "#4caf50",
      },
      {
        label: "Erros",
        data: subjects.map((s) => s.incorrect_answers),
        backgroundColor: "#f44336",
      },
      {
        label: "Nota Manual",
        data: subjects.map((s) => s.manual_total_grade),
        backgroundColor: "#2196f3",
      },
    ],
  };

  return (
    <div className="report-container">
      <h2>Relatórios de Desempenho</h2>

      <div className="report-filters">
      <div className="input-button-container">
        <label>
          Tipo de Relatório:
          <select
            value={reportType}
            onChange={(e) => {
              setReportType(e.target.value as ReportType);
              setSelectedGroup("");
              setGeneral(null);
              setSubjects([]);
              setGroupReports([]);
            }}
            style={{ marginLeft: 10 }}
          >
            <option value="general">Geral</option>
            <option value="subject">Por Matéria</option>
            {user?.role === 1 && <option value="group">Por Grupo</option>}
          </select>
        </label>

        <label>
          Data Início:
          <input
            type="date"
            value={period.start}
            onChange={(e) => setPeriod({ ...period, start: e.target.value })}
            style={{ marginLeft: 10 }}
          />
        </label>

        <label>
          Data Fim:
          <input
            type="date"
            value={period.end}
            onChange={(e) => setPeriod({ ...period, end: e.target.value })}
            style={{ marginLeft: 10 }}
          />
        </label>

        {reportType === "group" && (
          <label>
            Grupo:
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(Number(e.target.value))}
              style={{ marginLeft: 10 }}
            >
              <option value="">Selecione</option>
              {groupsList.map((grp) => (
                <option key={grp.id} value={grp.id}>
                  {grp.name}
                </option>
              ))}
            </select>
          </label>
        )}

        <Button onClick={generateReport}>Gerar Relatório</Button>
        </div>
      </div>

      {reportType === "general" && general && (
        <div>
          <h3>Resumo Geral</h3>
          <p>Total de tentativas: {general.total_attempts}</p>
          <p>Nota total: {general.total_grade}</p>
          <p>Acertos: {general.total_correct_answers}</p>
          <p>Erros: {general.total_incorrect_answers}</p>

          <h4>Evolução ao longo do tempo</h4>
          <Line
            data={{
              labels: general.evolution.map((e) => e.date),
              datasets: [
                {
                  label: "Acertos",
                  data: general.evolution.map((e) => e.correct),
                  borderColor: "#4caf50",
                  fill: false,
                },
                {
                  label: "Erros",
                  data: general.evolution.map((e) => e.incorrect),
                  borderColor: "#f44336",
                  fill: false,
                },
                {
                  label: "Nota Manual",
                  data: general.evolution.map((e) => e.manual_grade),
                  borderColor: "#2196f3",
                  fill: false,
                },
                {
                  label: "Nota Total",
                  data: general.evolution.map((e) => e.total_grade),
                  borderColor: "#9c27b0",
                  fill: false,
                },
              ],
            }}
            options={{ responsive: true }}
          />
        </div>
      )}

      {reportType === "subject" && subjects.length > 0 && (
        <div>
          <h3>Desempenho por Matéria</h3>
          <Bar data={chartData} options={{ responsive: true }} />
        </div>
      )}

      {reportType === "group" && groupReports.length > 0 && (
        <div>
          <h3>Relatório do Grupo</h3>
          {groupReports.map((grp) => (
            <div key={grp.group_id} style={{ marginBottom: 40 }}>
              <h4>{grp.group_name}</h4>
              <p>Alunos: {grp.students_count}</p>
              <p>Média de nota: {grp.total_grade?.toFixed(2)}</p>
              <p>Acertos: {grp.total_correct_answers}</p>
              <p>Erros: {grp.total_incorrect_answers}</p>

              {grp.ranking && (
                <>
                  <h5>Ranking</h5>
                  <Bar
                    data={{
                      labels: grp.ranking.map((r) => r.name),
                      datasets: [
                        {
                          label: "Média",
                          data: grp.ranking.map((r) => r.avg_grade),
                          backgroundColor: "#3f51b5",
                        },
                      ],
                    }}
                    options={{ responsive: true }}
                  />
                </>
              )}

              {grp.most_difficult_questions && (
                <>
                  <h5>Questões com Maior Taxa de Erro</h5>
<Bar
  data={{
    labels: grp.most_difficult_questions.map((q, index) => `Q${index + 1}`),
    datasets: [
      {
        label: "Erro (%)",
        data: grp.most_difficult_questions.map((q) => q.error_rate),
        backgroundColor: "#e91e63",
      },
    ],
  }}
  options={{
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: (val) => `${val}%`,
        },
      },
    },
  }}
/>

{/* Lista de enunciados correspondente às barras */}
<ul style={{ marginTop: 10 }}>
  {grp.most_difficult_questions.map((q, index) => (
    <li key={q.question_id} style={{ marginBottom: 4 }}>
      <strong>Q{index + 1}:</strong> {q.statement}
    </li>
  ))}
</ul>

                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default withAuth(ReportsPage);
