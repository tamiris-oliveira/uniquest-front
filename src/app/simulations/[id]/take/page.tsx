"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import ApiRoutes from "@/services/constants";
import { SubmitAnswer, Attempt, Question, Simulation } from "@/types/types";
import { useAuth } from "@/context/authContext";
import { toast } from "react-toastify";
import axios from "axios";
import "./take.css";

export default function TakeSimulationPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, token } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [timer, setTimer] = useState<number>(0);
  const [simulation, setSimulation] = useState<Simulation | null>(null);
  const [attempt, setAttempt] = useState<Attempt | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

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
        handleSubmit();
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

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (!simulation) {
        toast.error("Simulado não carregado.");
        return;
      }

      // Criar tentativa só aqui, ao enviar respostas
      const { data: newAttempt } = await axios.post(
        ApiRoutes.ATTEMPTS,
        { attempt: { simulation_id: simulation.id } },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAttempt(newAttempt);

      const answersArray: SubmitAnswer[] = Object.entries(answers).map(
        ([questionId, studentAnswer]) => ({
          question_id: Number(questionId),
          student_answer: studentAnswer,
        })
      );

      await axios.post(
        `${ApiRoutes.ATTEMPT(newAttempt.id)}/submit_answers`,
        { answers: answersArray },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Simulado enviado!");
      router.push("/simulations");
    } catch {
      toast.error("Erro ao enviar respostas.");
    }
  };

  if (loading) return <div className="container">Carregando...</div>;

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

      <button className="submit-button" onClick={handleSubmit}>
        Enviar Respostas
      </button>
    </div>
  );
}
