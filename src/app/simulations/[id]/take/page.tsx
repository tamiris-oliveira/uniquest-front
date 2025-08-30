"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import ApiRoutes from "@/services/constants";
import { SubmitAnswer, Attempt, Question, Simulation } from "@/types/types";
import { useAuth } from "@/context/authContext";
import { toast } from "react-toastify";
import axios from "@/services/axiosConfig";
import "./take.css";
import Spinner from "@/components/main/spinner";

export default function TakeSimulationPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, token } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string | number, string>>({});
  const [loading, setLoading] = useState(true);
  const [timer, setTimer] = useState<number>(0);
  const [simulation, setSimulation] = useState<Simulation | null>(null);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const simulationRef = useRef<Simulation | null>(null);

  useEffect(() => {
    if (id && token) {
      fetchSimulation();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [id, token]);

  const fetchSimulation = async () => {
    try {
      const { data } = await axios.get<Simulation>(
        ApiRoutes.SIMULATION(id),
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSimulation(data);
      simulationRef.current = data; // Manter referência atualizada para o timer
      setQuestions(data.questions || []);
      startTimer(data.time_limit || 60);
      setLoading(false);
    } catch {
      toast.error("Erro ao carregar simulado.");
      setLoading(false);
    }
  };

  const startTimer = (minutes: number) => {
    const endTime = Date.now() + minutes * 60 * 1000;

    timerRef.current = setInterval(() => {
      const remaining = Math.floor((endTime - Date.now()) / 1000);
      if (remaining <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        toast.info("Tempo esgotado. Enviando respostas...");
        handleAutoSubmit();
      } else {
        setTimer(remaining);
      }
    }, 1000);
  };

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const handleAnswerChange = (questionId: string | number, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleAutoSubmit = async () => {
    // Função específica para envio automático quando o tempo acaba
    if (isSubmitting) return; // Prevenir múltiplos envios
    
    const currentSimulation = simulationRef.current;
    if (!currentSimulation) {
      console.error("Simulação não disponível para envio automático");
      toast.error("Erro: Simulação não carregada. Redirecionando...");
      router.push("/simulations");
      return;
    }

    await submitAnswers(currentSimulation, true);
  };

  const handleSubmit = async () => {
    // Função para envio manual
    if (isSubmitting) return; // Prevenir múltiplos envios
    
    if (!simulation) {
      toast.error("Simulado não carregado.");
      return;
    }

    await submitAnswers(simulation, false);
  };

  const submitAnswers = async (currentSimulation: Simulation, isAutoSubmit: boolean = false) => {
    try {
      setIsSubmitting(true);
      
      // Limpar timer se ainda estiver rodando
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // Criar tentativa
      const { data: newAttempt } = await axios.post(
        ApiRoutes.ATTEMPTS,
        { attempt: { simulation_id: currentSimulation.id } },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAttempt(newAttempt);

      const answersArray: SubmitAnswer[] = Object.entries(answers).map(
        ([questionId, studentAnswer]) => ({
          question_id: questionId,
          student_answer: studentAnswer,
        })
      );

      await axios.post(
        `${ApiRoutes.ATTEMPT(newAttempt.id)}/submit_answers`,
        { answers: answersArray },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const message = isAutoSubmit 
        ? "Tempo esgotado! Respostas enviadas automaticamente." 
        : "Simulado enviado com sucesso!";
      
      toast.success(message);
      router.push("/simulations");
    } catch (error) {
      console.error("Erro ao enviar respostas:", error);
      toast.error("Erro ao enviar respostas. Redirecionando...");
      // Em caso de erro, simplesmente redireciona sem tentar novamente
      router.push("/simulations");
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="container">
      <h1 className="title">Responder Simulado #{id}</h1>

      <div style={{ textAlign: "right", marginBottom: "1rem", fontWeight: "bold", fontSize: "1.1rem" }}>
        ⏳ Tempo restante: {formatTime(timer)}
      </div>

      {questions.map((q, index) => (
        <div key={q.id} className="question">
          <p className="question-text">{index + 1}. {q.statement}</p>

          {q.question_type === "Objetiva" && q.alternatives?.map(alt => (
            <label key={alt.id} className="alternative-label">
              <input
                type="radio"
                name={`question-${q.id}`}
                value={alt.text}
                checked={answers[q.id] === alt.text}
                onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                className="radio-input"
              />
              {alt.text}
            </label>
          ))}

          {q.question_type === "Discursiva" && (
            <textarea
              className="textarea"
              rows={3}
              value={answers[q.id] || ""}
              onChange={(e) => handleAnswerChange(q.id, e.target.value)}
            />
          )}
        </div>
      ))}

      <button 
        className="submit-button" 
        onClick={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Enviando..." : "Enviar Respostas"}
      </button>
    </div>
  );
}
