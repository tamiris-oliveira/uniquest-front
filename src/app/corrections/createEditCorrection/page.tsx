"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/authContext";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import Button from "@/components/main/button";
import {Answer, Correction} from "@/types/types";
import "./correctionEdit.css";
import ApiRoutes from "@/services/constants";


const CreateEditCorrection = () => {
  const { user, token } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const answerId = searchParams.get("answer_id");
  const isReadOnly = user?.role !== 1;

  const [answer, setAnswer] = useState<Answer | null>(null);
  const [correction, setCorrection] = useState<Correction | null>(null);
  const [feedback, setFeedback] = useState("");
  const [grade, setGrade] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!answerId || !token) return;

    const fetchAnswerAndCorrection = async () => {
      try {
        const answerResp = await axios.get<Answer>(ApiRoutes.ANSWER(answerId), {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAnswer(answerResp.data);
        const {data} = await axios.get<Correction[]>(ApiRoutes.CORRECTIONS(answerId), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (data.length > 0) {
          const corr = data[0];
          setCorrection(corr);
          setFeedback(corr.feedback || "");
          setGrade(corr.grade);
        }
      } catch (error) {
        toast.error("Erro ao carregar dados da correção.");
      }
    };

    fetchAnswerAndCorrection();
  }, [answerId, token]);

  if (!answer) return <p>Carregando dados da resposta...</p>;

  const isDiscursive = answer.question.question_type === "Discursiva";

  const handleSaveCorrection = async () => {
    if (isDiscursive && (grade === null || grade < 0 || grade > 10)) {
      toast.warn("Informe uma nota válida entre 0 e 10.");
      return;
    }
    if (!feedback.trim()) {
      toast.warn("O feedback é obrigatório.");
      return;
    }

    setLoading(true);

    try {
      if (correction) {
        await axios.put<Correction[]>(ApiRoutes.CORRECTION(correction!.id),
          correction,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Correção atualizada com sucesso.");
      } else {
        await axios.post<Correction[]>(ApiRoutes.CORRECTIONS(answerId),
          { correction: { grade: isDiscursive ? grade : null, feedback } },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Correção criada com sucesso.");
      }
    } catch (error) {
      toast.error("Erro ao salvar correção.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
    <div className="input-button-container">
      <h2 style={{ margin: 0 }}>Correções</h2>
      {!isReadOnly && (
  <Button onClick={handleSaveCorrection} disabled={loading}>
    {loading ? "Salvando..." : "Salvar Correção"}
  </Button>
)}

      </div>

      <section>
        <h3>Questão</h3>
        <p>{answer.question.statement}</p>

        {answer.question.question_type === "Objetiva" && answer.question.alternatives && (
          <ul>
            {answer.question.alternatives.map((alt) => (
              <li
                key={alt.id}
                style={{
                  fontWeight: alt.correct ? "bold" : "normal",
                  color: alt.correct ? "green" : "inherit",
                }}
              >
                {alt.text}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3>Resposta do aluno</h3>
        <p style={{ whiteSpace: "pre-wrap" }}>{answer.student_answer || "-"}</p>
      </section>

      <section>
        <h3>Correção</h3>

          <div>
            <label htmlFor="grade">Nota (0 a 10):</label>
            <input
              id="grade"
              type="number"
              min={0}
              max={10}
              step={0.1}
              value={grade ?? ""}
              onChange={(e) => setGrade(e.target.value === "" ? null : Number(e.target.value))}
              style={{ width: 60, marginLeft: 10 }}
              disabled={!isDiscursive || isReadOnly}
            />
          </div>

        <div style={{ marginTop: 10 }}>
          <label htmlFor="feedback">Feedback:</label>
          <textarea
            id="feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={4}
            style={{ width: "100%", resize: "vertical" }}
            placeholder="Digite seu feedback aqui"
            disabled={isReadOnly}
          />
        </div>
      </section>
    </div>
  );
};

export default CreateEditCorrection;
