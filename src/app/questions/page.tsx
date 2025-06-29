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
import { Edit, Trash2 } from "lucide-react";
import { ConfirmToast } from "@/components/main/confirmToast";
import "./question.css";

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

  useEffect(() => {
    if (subjects.length > 0) {
      fetchQuestions();
    }
  }, [subjects]);

  const handleDelete = async (id: number) => {
   ConfirmToast({
         message: "Tem certeza que deseja excluir a questão?",
         onConfirm: async () => {
          try {
            await axios.delete(`${ApiRoutes.QUESTION(id)}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            toast.success("Questão excluída com sucesso.");
            fetchQuestions();
          } catch {
            toast.error("Erro ao excluir a questão.");
          }
        }
      });
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
        <h3 style={{ marginBottom: 8, color: "#1E3A8A" }}>{subject}</h3>
        {questions.map((question) => (
          <div key={question.id} className="question-card">
            {user?.id === question.user_id && (
              <div className="actions-container">
                <Link href={`/questions/createEditQuestion?id=${question.id}`}>
                  <button className="action-button edit" title="Editar">
                    <Edit />
                  </button>
                </Link>
                <button
                  className="action-button delete"
                  onClick={() => handleDelete(question.id)}
                  title="Excluir"
                >
                  <Trash2 />
                </button>
              </div>
            )}
            <p><strong>Tipo:</strong> {question.question_type}</p>
            <p><strong>Enunciado:</strong> {question.statement}</p>
            {question.question_type=="Objetiva" && question.alternatives && question.alternatives.length > 0 && (
              <div className="alternatives-container">
                <strong>Alternativas:</strong>
                {question.alternatives.map((alt: Alternative) => (
                  <div
                    key={alt.id}
                    className={`alternative ${alt.correct ? "correct" : ""}`}
                  >
                    {alt.text}
                  </div>
                ))}
              </div>
            )}
            <p><strong>Justificativa:</strong> {question.justification || "-"}</p>
          </div>
        ))}
      </div>
    ))}
  </div>
);
}


export default withAuth(QuestionsPage);
