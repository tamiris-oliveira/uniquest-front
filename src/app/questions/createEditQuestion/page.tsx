"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "@/services/axiosConfig";
import { useAuth } from "@/context/authContext";
import Button from "@/components/main/button";
import { ApiRoutes } from "@/services/constants";
import { toast } from "react-toastify";
import { Question } from "@/types/types";
import { Trash2, CheckCircle, Circle } from "lucide-react";
import { Alternative, questionTypes } from "@/types/types";
import "react-toastify/dist/ReactToastify.css";
import "./editQuestion.css";

const CreateEditQuestion: React.FC = () => {
  const { user, token } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const questionId = searchParams.get("id");
  const [statement, setStatement] = useState("");
  const [questionType, setQuestionType] = useState(questionTypes[0].value);
  const [justification, setJustification] = useState("");
  const [alternatives, setAlternatives] = useState<Alternative[]>([]);
  const [subjects, setSubjects] = useState<{ id: string | number; name: string }[]>([]);
  const [subjectId, setSubjectId] = useState<string | number | null>(null);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token && questionId) {
      fetchQuestion();
    }
    if (token) {
      fetchSubjects();
    }
  }, [token, questionId]);

  const fetchSubjects = async () => {
      try {
        const { data } = await axios.get(ApiRoutes.SUBJECTS, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSubjects(data);
      } catch {
        toast.error("Erro ao carregar as matérias.");
      }
    };

  const fetchQuestion = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get<Question & { alternatives: Alternative[] }>(
        ApiRoutes.QUESTION(Number(questionId)),
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStatement(data.statement);
      setQuestionType(data.question_type);
      setJustification(data.justification);
      setAlternatives(data.alternatives || []);
      setSubjectId(data.subject_id)
    } catch {
      toast.error("Erro ao carregar a questão.");
    } finally {
      setLoading(false);
    }
  };

  const handleAlternativeChange = (index: number, field: keyof Alternative, value: string | boolean) => {
    const newAlts = [...alternatives];
    newAlts[index] = { ...newAlts[index], [field]: value };
    setAlternatives(newAlts);
  };

  const addAlternative = () => {
    setAlternatives([...alternatives, { text: "", correct: false }]);
  };

  const removeAlternative = (index: number) => {
    const newAlts = alternatives.filter((_, i) => i !== index);
    setAlternatives(newAlts);
  };

  const handleSave = async () => {
    if (!statement.trim()) {
      toast.warn("O enunciado da questão é obrigatório.");
      return;
    }

    if (questionType === "Objetiva") {
      if (alternatives.length === 0) {
        toast.warn("Adicione pelo menos uma alternativa.");
        return;
      }
      if (!alternatives.some((alt) => alt.correct)) {
        toast.warn("Marque pelo menos uma alternativa correta.");
        return;
      }
      if (alternatives.some((alt) => !alt.text.trim())) {
        toast.warn("Preencha o texto de todas as alternativas.");
        return;
      }
    }

    if (!subjectId && !newSubjectName.trim()) {
  toast.warn("Selecione ou cadastre uma matéria.");
  return;
}

let finalSubjectId = subjectId;

console.log("Final Subject ID:", subjectId);

if (!subjectId && newSubjectName.trim()) {
  try {
    const { data } = await axios.post(
      ApiRoutes.SUBJECTS,
      { subject: { name: newSubjectName.trim() } },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    finalSubjectId = data.id;
  } catch {
    toast.error("Erro ao criar nova matéria.");
    return;
  }
}

    const payload = {
      question: {
        statement,
        question_type: questionType,
        justification,
        user_id: user!.id,
        subject_id: finalSubjectId,
        alternatives_attributes: alternatives,
      },
    };

    try {
      setLoading(true);
      if (questionId) {
        await axios.put(ApiRoutes.QUESTION(Number(questionId)), payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Questão atualizada com sucesso!");
      } else {
        const {data} =  await axios.post(ApiRoutes.QUESTIONS, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Questão criada com sucesso!");
        window.location.href = `/questions/createEditQuestion?edit=true&id=${data.id}`;
      }
      router.push("/questions");
    } catch {
      toast.error("Erro ao salvar a questão.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-group-container">
    <div className="input-button-container">
      <h2 style={{ margin: 0 }}>{questionId ? "Editar Questão" : "Criar Questão"}</h2>
      <Button onClick={handleSave} disabled={loading}>
          {loading ? (questionId ? "Salvando..." : "Criando...") : questionId ? "Salvar" : "Criar"}
        </Button>
    </div>

      <label htmlFor="subject" style={{ marginTop: 12 }}>
  Matéria:
</label>
<select
  id="subject"
  value={subjectId ?? ""}
  onChange={(e) => setSubjectId(Number(e.target.value))}
  style={{ width: "100%", padding: 10, borderRadius: 5, border: "1px solid #ccc" }}
>
  <option value="">Selecione uma matéria existente</option>
  {subjects.map((s) => (
    <option key={s.id} value={s.id}>
      {s.name}
    </option>
  ))}
</select>

<label htmlFor="new-subject" style={{ marginTop: 12 }}>
  Ou adicione uma nova matéria:
</label>
<input
  type="text"
  id="new-subject"
  placeholder="Nome da nova matéria"
  value={newSubjectName}
  onChange={(e) => setNewSubjectName(e.target.value)}
  style={{ width: "100%", padding: 10, borderRadius: 5, border: "1px solid #ccc" }}
  disabled={!!subjectId} 
/>


      <label htmlFor="statement">Enunciado:</label>
      <textarea
        id="statement"
        value={statement}
        onChange={(e) => setStatement(e.target.value)}
        placeholder="Digite o enunciado da questão"
        rows={5}
        style={{ width: "100%", padding: 10, borderRadius: 5, border: "1px solid #ccc" }}
      />

      <label htmlFor="question-type" style={{ marginTop: 12 }}>
        Tipo da questão:
      </label>
      <select
        id="question-type"
        value={questionType}
        onChange={(e) => setQuestionType(e.target.value)}
        style={{ width: "100%", padding: 10, borderRadius: 5, border: "1px solid #ccc" }}
      >
        {questionTypes.map((qt) => (
          <option key={qt.value} value={qt.value}>
            {qt.label}
          </option>
        ))}
      </select>

      <label htmlFor="justification" style={{ marginTop: 12 }}>
        Justificativa:
      </label>
      <textarea
        id="justification"
        value={justification}
        onChange={(e) => setJustification(e.target.value)}
        placeholder="Digite a justificativa da questão (opcional)"
        rows={3}
        style={{ width: "100%", padding: 10, borderRadius: 5, border: "1px solid #ccc" }}
      />

      {questionType === "Objetiva" && (
        <>
          <div className="input-button-container">
      <h2 style={{ margin: 0 }}>Alternativas</h2>
      <Button onClick={addAlternative}/>
    </div>
          {alternatives.map((alt, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 8,
                gap: 8,
              }}
            >
              <div className="alternative-line">
                <input
                  type="text"
                  placeholder="Texto da alternativa"
                  value={alt.text}
                  onChange={(e) => handleAlternativeChange(idx, "text", e.target.value)}
                />
                
                <button
                  type="button"
                  onClick={() => handleAlternativeChange(idx, "correct", !alt.correct)}
                  className={`correct-toggle-button ${alt.correct ? "correct" : ""}`}
                  aria-label="Marcar como correta"
                >
                  {alt.correct ? <CheckCircle size={18} /> : <Circle size={18} />}
                  Correta
                </button>

                <button
                  type="button"
                  onClick={() => removeAlternative(idx)}
                  className="trash-icon-button"
                  aria-label="Remover alternativa"
                >
                  <Trash2 size={18} />
                </button>
              </div>

            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default CreateEditQuestion;
