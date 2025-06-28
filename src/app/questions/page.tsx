"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/authContext";
import withAuth from "@/context/withAuth";
import axios from "axios";
import { ApiRoutes } from "@/services/constants";
import Button from "@/components/main/button";
import { toast } from "react-toastify";
import Link from "next/link";
import { Question, Alternative } from "@/types/types";
import "./page.css";

const QuestionsPage: React.FC = () => {
  const { token, user } = useAuth();
  const [questionsBySubject, setQuestionsBySubject] = useState<Record<string, Question[]>>({});
  const [subjects, setSubjects] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    if (token) {
      fetchSubjects();
      fetchQuestions();
    }
  }, [token]);

  const fetchSubjects = async () => {
    try {
      const { data } = await axios.get<{ id: number; name: string }[]>(ApiRoutes.SUBJECTS, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubjects(data);
    } catch {
      toast.error("Erro ao carregar as matérias.");
    }
  };

  const fetchQuestions = async () => {
    try {
      const { data } = await axios.get<Question[]>(ApiRoutes.QUESTIONS, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Agrupar usando o subject_id para encontrar o nome da matéria
      const grouped = data.reduce((acc: Record<string, Question[]>, q: Question) => {
        const subjectName = subjects.find((s) => s.id === q.subject_id)?.name || "Sem matéria";
        if (!acc[subjectName]) acc[subjectName] = [];
        acc[subjectName].push(q);
        return acc;
      }, {});

      setQuestionsBySubject(grouped);
    } catch {
      toast.error("Erro ao carregar questões.");
    }
  };

  // Se quiser garantir que o agrupamento seja atualizado quando as subjects forem carregadas,
  // você pode criar um useEffect para reagrupar as questões:
  useEffect(() => {
    if (subjects.length > 0) {
      fetchQuestions();
    }
  }, [subjects]);

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta questão?")) return;
    try {
      await axios.delete(`${ApiRoutes.QUESTION(id)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Questão excluída com sucesso.");
      fetchQuestions();
    } catch {
      toast.error("Erro ao excluir a questão.");
    }
  };

  return (
    <div className="create-group-container">
      <div className="input-button-container">
        <h2 style={{ margin: 0 }}>Questões</h2>
        <Link href="/questions/createEditQuestion">
          <Button>Criar</Button>
        </Link>
      </div>

      {Object.entries(questionsBySubject).map(([subject, questions]) => (
        <div key={subject} style={{ marginBottom: 32 }}>
          <h3 style={{ marginBottom: 8 }}>{subject}</h3>
          {questions.map((question) => (
            <div
              key={question.id}
              className="input-button-container"
              style={{
                flexDirection: "column",
                alignItems: "flex-start",
                border: "1px solid #e0e0e0",
                padding: 12,
                borderRadius: 6,
                marginBottom: 10,
              }}
            >
              <p><strong>Enunciado:</strong> {question.statement}</p>
              <p><strong>Tipo:</strong> {question.question_type}</p>
              <p><strong>Justificativa:</strong> {question.justification || "-"}</p>

              {question.alternatives && question.alternatives.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  <strong>Alternativas:</strong>
                  <ul>
                    {question.alternatives.map((alt: Alternative) => (
                      <li
                        key={alt.id}
                        style={{
                          color: alt.correct ? "green" : "inherit",
                          fontWeight: alt.correct ? "bold" : "normal",
                        }}
                      >
                        {alt.text} {alt.correct ? "(Correta)" : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {user?.id === question.user_id && (
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <Link href={`/questions/createEditQuestion?id=${question.id}`}>
                    <Button>Editar</Button>
                  </Link>
                  <Button onClick={() => handleDelete(question.id)}>Excluir</Button>
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default withAuth(QuestionsPage);
