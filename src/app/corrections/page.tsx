"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/authContext";
import withAuth from "@/context/withAuth";
import { useRouter } from "next/navigation";
import axios from "axios";
import { format } from "date-fns";
import { toast } from "react-toastify";
import ApiRoutes from "@/services/constants";
import { Answer, User } from "@/types/types";
import { Edit , Eye} from "lucide-react";
import "./correction.css";

interface Attempt {
  id: number;
  user: User;
  attempt_date: string;
  answers: Answer[];
  final_grade: number
}

interface SimulationWithAttempts {
  id: number;
  title: string;
  attempts: Attempt[];
}

const AnswersPage = () => {
  const { token, user } = useAuth();
  const router = useRouter();
  const [simulations, setSimulations] = useState<SimulationWithAttempts[]>([]);

  useEffect(() => {
    if (token) fetchSimulationsWithAttempts();
  }, [token]);

  const fetchSimulationsWithAttempts = async () => {
    try {
      const { data } = await axios.get<SimulationWithAttempts[]>(
        `${ApiRoutes.SIMULATIONS}/with_attempts_answers`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSimulations(data);
    } catch (err) {
      toast.error("Erro ao carregar respostas.");
    }
  };

  const handleCorrection = (answerId: number) => {
    router.push(`/corrections/createEditCorrection?answer_id=${answerId}`);
  };

  return (
    <div className="create-group-container">
      <h2 style={{ marginBottom: "1rem" }}>Correções</h2>

      {simulations.length === 0 && <p>Nenhuma correção encontrada.</p>}

      {simulations.map((simulation) => (
        <div key={simulation.id} className="simulation-group">
          <h3>{simulation.title}</h3>

          {simulation.attempts.length === 0 && (
            <p>Nenhuma tentativa encontrada para este simulado.</p>
          )}

{simulation.attempts.map((attempt) => (
  <div key={attempt.id} className="attempt-group">
    <h4>
      Tentativa de {attempt.user.name} em{" "}
      {format(new Date(attempt.attempt_date), "dd/MM/yyyy HH:mm")}
    </h4>
    <p><strong>Nota final:</strong> {attempt.final_grade ?? "-"}</p>

    {attempt.answers.length === 0 ? (
      <p>Nenhuma resposta disponível para esta tentativa.</p>
    ) : (
      <div className="answer-table">
        <div className="answer-header">
          <span>Questão</span>
          <span>Resposta do Aluno</span>
          <span>Nota</span>
          {user?.role == 1 && (<span>Corrigir</span>)}
        </div>

        {attempt.answers.map((answer) => (
          <div key={answer.id} className="answer-row">
            <span>{answer.question.statement}</span>
            <span>{answer.student_answer || "-"}</span>
            <span>
              {(() => {
                if (!answer.corrections || answer.corrections.length === 0) return "-";
                const lastCorrection = answer.corrections.reduce((prev, current) =>
                  new Date(prev.created_at) > new Date(current.created_at) ? prev : current
                );
                return lastCorrection.grade != null ? lastCorrection.grade.toFixed(2) : "-";
              })()}
            </span>

            {user?.role === 1 ? (
              <Edit
                onClick={() => handleCorrection(answer.id)}
                style={{ cursor: "pointer" }}
                aria-label="Corrigir resposta"
              />
            ) : (
              <Eye
                onClick={() => handleCorrection(answer.id)}
                style={{ cursor: "pointer" }}
                aria-label="Visualizar resposta"
              />
            )}
          </div>
        ))}
      </div>
    )}
  </div>
))}
        </div>
      ))}
    </div>
  );
};

export default withAuth(AnswersPage);
