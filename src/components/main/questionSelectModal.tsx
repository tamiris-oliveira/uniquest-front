"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Question } from "@/types/types";
import { ApiRoutes } from "@/services/constants";
import { toast } from "react-toastify";
import { X, Check } from "lucide-react";
import "./questionSelectModal.css";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (selectedIds: number[]) => void;
  token: string;
  selectedQuestionIds?: number[];
}

const QuestionSelectModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  token,
  selectedQuestionIds,
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    if (isOpen) {
      setSelectedIds(selectedQuestionIds ?? []);
      fetchQuestions();
    }
  }, [isOpen, selectedQuestionIds]);

  const fetchQuestions = async () => {
    try {
      const { data } = await axios.get<Question[]>(ApiRoutes.QUESTIONS, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setQuestions(data);
    } catch {
      toast.error("Erro ao buscar questões.");
    }
  };

  const markAsSelected = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const markAsDeselected = (id: number) => {
    setSelectedIds((prev) => prev.filter((qid) => qid !== id));
  };

  const handleSave = () => {
    onSave(selectedIds);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="modal-content">
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Fechar modal"
          type="button"
        >
          <X size={24} />
        </button>
        <h2 id="modal-title">Selecionar Questões</h2>

        <div className="question-list">
          {questions.map((q) => {
            const isSelected = selectedIds.includes(q.id);
            return (
              <div key={q.id} className="question-item-with-actions">
                <label htmlFor={`question-${q.id}`} className="question-label">
                  <span className="question-statement">{q.statement}</span>
                </label>
                <div className="question-actions">
                  <button
                    className={`btn-icon ${isSelected ? "marked" : ""}`}
                    aria-label={
                      isSelected
                        ? "Questão selecionada"
                        : "Marcar questão como selecionada"
                    }
                    type="button"
                    onClick={() => markAsSelected(q.id)}
                  >
                    <Check size={18} />
                  </button>

                  <button
                    className={`btn-icon ${!isSelected ? "marked no-mark" : ""}`}
                    aria-label={
                      !isSelected
                        ? "Questão não selecionada"
                        : "Desmarcar questão"
                    }
                    type="button"
                    onClick={() => markAsDeselected(q.id)}
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose} type="button">
            Cancelar
          </button>
          <button className="btn-save" onClick={handleSave} type="button">
            Salvar Seleção
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionSelectModal;
