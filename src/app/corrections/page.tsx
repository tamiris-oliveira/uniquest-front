"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/authContext";
import withAuth from "@/context/withAuth";
import { useRouter } from "next/navigation";
import axios from "@/services/axiosConfig";
import { format } from "date-fns";
import { toast } from "react-toastify";
import ApiRoutes from "@/services/constants";
import { Answer, User } from "@/types/types";
import { Edit , Eye} from "lucide-react";
import Spinner from "@/components/main/spinner";
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) fetchSimulationsWithAttempts();
  }, [token]);

  const fetchSimulationsWithAttempts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get<SimulationWithAttempts[]>(
        `${ApiRoutes.SIMULATIONS}/with_attempts_answers`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSimulations(data);
    } catch (err) {
      toast.error("Erro ao carregar respostas.");
    } finally {
      setLoading(false);
    }
  };

  const handleCorrection = (answerId: string | number) => {
    router.push(`/corrections/createEditCorrection?answer_id=${answerId}`);
  };

  if (loading) {
    return (
      <div className="create-group-container">
        <h2 style={{ marginBottom: "1rem" }}>Correções</h2>
        <Spinner />
      </div>
    );
  }

  return (
    <div className="create-group-container">
      <h2 style={{ marginBottom: "1rem" }}>Correções</h2>

      {(!simulations || simulations.length === 0) && <p>Nenhuma correção encontrada.</p>}

      {simulations?.map((simulation) => (
        <div key={simulation.id} className="simulation-group">
          <h3>{simulation.title}</h3>

          {(!simulation.attempts || simulation.attempts.length === 0) && (
            <p>Nenhuma tentativa encontrada para este simulado.</p>
          )}

{simulation.attempts?.map((attempt) => (
  <div key={attempt.id} className="attempt-group">
    <h4>
      Tentativa de {attempt.user.name} em{" "}
      {format(new Date(attempt.attempt_date), "dd/MM/yyyy HH:mm")}
    </h4>
    <p><strong>Nota final:</strong> {
      attempt.final_grade != null && !isNaN(Number(attempt.final_grade)) 
        ? Number(attempt.final_grade).toFixed(2) 
        : "-"
    }</p>

    {(!attempt.answers || attempt.answers.length === 0) ? (
      <p>Nenhuma resposta disponível para esta tentativa.</p>
    ) : (
      <div className="answer-table">
        <div className="answer-header">
          <span>Questão</span>
          <span>Resposta do Aluno</span>
          <span>Nota</span>
          {(user?.role === 1 || user?.role === 2 || user?.role === 3) && (<span>Corrigir</span>)}
        </div>

        {attempt.answers?.map((answer) => (
          <div key={answer.id} className="answer-row">
            <span>{answer.question.statement}</span>
            <span>{answer.student_answer || "-"}</span>
                          <span>
                {(() => {
                  try {
                    if (!answer.corrections || answer.corrections.length === 0) return "-";
                    
                    const lastCorrection = answer.corrections.reduce((prev, current) =>
                      new Date(prev.created_at) > new Date(current.created_at) ? prev : current
                    );
                    
                    // Verificação mais rigorosa para valores nulos/undefined
                    if (lastCorrection?.grade == null || lastCorrection?.grade === undefined) {
                      return "-";
                    }
                    
                    let gradeNumber: number;
                    
                    // Conversão segura baseada no tipo
                    if (typeof lastCorrection.grade === 'string') {
                      gradeNumber = parseFloat(lastCorrection.grade);
                    } else if (typeof lastCorrection.grade === 'number') {
                      gradeNumber = lastCorrection.grade;
                    } else {
                      // Fallback para tipos inesperados
                      gradeNumber = Number(lastCorrection.grade);
                    }
                    
                    // Verificação final se é um número válido
                    if (isNaN(gradeNumber) || !isFinite(gradeNumber)) {
                      return "-";
                    }
                    
                    return gradeNumber.toFixed(2);
                  } catch (error) {
                    console.error('Erro ao processar nota:', error);
                    return "-";
                  }
                })()}
              </span>

            {(user?.role === 1 || user?.role === 2 || user?.role === 3) ? (
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
