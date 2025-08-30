"use client";
import React, { useEffect, useState } from "react";
import withAuth from "@/context/withAuth";
import axios from "@/services/axiosConfig";
import { useAuth } from "@/context/authContext";
import Button from "@/components/main/button";
import { ApiRoutes } from "@/services/constants";
import { toast } from "react-toastify";
import { useSearchParams } from "next/navigation";
import { Simulation, SimulationPayload, SimulationForm, Alternative } from "@/types/types";
import Select from "react-select";
import { format, parseISO, set } from "date-fns";
import QuestionSelectModal from "@/components/main/questionSelectModal";
import "react-toastify/dist/ReactToastify.css";
import "./editSimulation.css";

interface Group {
  id: string | number;
  name: string;
}

const CreateEditSimulation: React.FC = () => {
  const { user, token } = useAuth();
  const searchParams = useSearchParams();
  const simulationId = searchParams.get("id");
  const [form, setForm] = useState<SimulationForm>({
    title: "",
    description: "",
    deadline: "",
    max_attempts: 1,
    time_limit: 60,
    user_id: user!.id,
    group_ids: [],
    question_ids: [],
  });  
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<(string | number)[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<(string | number)[]>([]);
  const [questions, setQuestions] = useState<Simulation["questions"]>([]);
  const groupOptions = groups.map(g => ({ value: g.id, label: g.name }));
  

  useEffect(() => {
    if (token) {
      fetchGroups();
      if (simulationId) {
        fetchSimulation();
      } else {
        setSelectedGroupIds([]);
      }
    }
  }, [token, simulationId]);
  

  const fetchGroups = async () => {
    try {
      const { data } = await axios.get<Group[]>(ApiRoutes.GROUPS, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGroups(data);
    } catch {
      toast.error("Erro ao buscar grupos.");
    }
  };

  const fetchSimulation = async () => {
    try {
      const { data } = await axios.get<Simulation>(
        ApiRoutes.SIMULATION(simulationId),
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      setForm({
        title: data.title,
        description: data.description,
        deadline: data.deadline,
        max_attempts: data.max_attempts ?? 1,
        time_limit: data.time_limit ?? 60,
        user_id: user!.id,
        group_ids: data.groups?.map(group => group.id) || [],
        question_ids: data.questions?.map(q => q.id) || [],
      });
  
      setQuestions(data.questions || []);
      setSelectedGroupIds(data.groups?.map(group => group.id) || []);
    } catch {
      toast.error("Erro ao carregar simulação.");
    }
  };
  

const handleSaveSimulation = async (questionIds: (string | number)[]) => {
  if (!form.title.trim()) {
    toast.warn("Por favor, insira um nome para o simulado.");
    return;
  }

  const payload: SimulationPayload = {
    simulation: {
      ...form,
      question_ids: questionIds,
      group_ids: selectedGroupIds,
      user_id: user!.id,
      creation_date: new Date().toISOString(),
    },
  };

  try {
    if (simulationId) {
      await axios.put(ApiRoutes.SIMULATION(simulationId), payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Simulado atualizado com sucesso!");
    } else {
      const {data} =  await axios.post(ApiRoutes.SIMULATIONS, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Simulado criado com sucesso!");
      window.location.href = `/simulations/createEditSimulation?edit=true&id=${data.id}`;
    }

    setForm({
      title: "",
      description: "",
      deadline: "",
      max_attempts: 1,
      time_limit: 60,
      user_id: user!.id,
      group_ids: [],
      question_ids: [],
    });

    fetchGroups();
    if(simulationId)
      fetchSimulation();
  } catch {
    toast.error("Erro ao salvar simulado.");
  }
};


  function toInputDateTimeValue(isoString: string): string {
    if (!isoString) return "";
    console.log("ISO String:", isoString);
    const date = parseISO(isoString); 
    return format(date, "yyyy-MM-dd'T'HH:mm");
  }

  const handleSelectQuestionsAndSave = (ids: (string | number)[]) => {
  setSelectedQuestionIds(ids);
  handleSaveSimulation(ids);
  };


  return (
    <div className="create-group-container">
    <div className="input-button-container">
      <h2 style={{ margin: 0 }}>{simulationId ? "Editar Simulado" : "Criar Simulado"}</h2>
      <Button onClick={() => handleSaveSimulation(selectedQuestionIds)}>
          {simulationId ? "Salvar" : "Criar"}
        </Button>
    </div>
      <label htmlFor="simulation-name">Nome do Simulado:</label>
      <div className="input-button-container">
        <input
          id="simulation-name"
          type="text"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
          placeholder="Nome do simulado"
        />
      </div>

      <label htmlFor="simulation-description">Descrição:</label>
      <div className="input-button-container">
        <input
          id="simulation-description"
          type="text"
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
          placeholder="Descrição do simulado"
        />
      </div>

      <label htmlFor="simulation-deadline">Data de Vencimento:</label>
      <div className="input-button-container">
        <input
          id="simulation-deadline"
          type="datetime-local"
          value={toInputDateTimeValue(form.deadline)}
          onChange={e => {
            const iso = new Date(e.target.value).toISOString();
            setForm({ ...form, deadline: iso})
          }}
          placeholder="Selecione data e hora"
        />
        </div>

    <label htmlFor="simulation-max_attempts">Número de tentativas:</label>
      <div className="input-button-container">
        <input
          id="simulation-max_attempts"
          type="number"
          value={form.max_attempts}
          onChange={e => setForm({ ...form, max_attempts: parseInt(e.target.value) })}
          placeholder="Selecione data e hora"
        />
        </div>

        <label htmlFor="simulation-time_limit">Tempo de realização do simulado (minutos):</label>
      <div className="input-button-container">
        <input
          id="simulation-time_limit"
          type="number"
          value={form.time_limit}
          onChange={e => setForm({ ...form, time_limit: parseInt(e.target.value) })}
          placeholder="Selecione data e hora"
        />
        </div>


      <label htmlFor="groups-select">Selecione os grupos:</label>
      <div className="input-button-container">
        <div className="select-all-container">
          <label className="select-all-checkbox">
            <input
              type="checkbox"
              checked={selectedGroupIds.length === groups.length && groups.length > 0}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedGroupIds(groups.map(g => g.id));
                } else {
                  setSelectedGroupIds([]);
                }
              }}
            />
            Selecionar todos os grupos
          </label>
        </div>
        <Select
          isMulti
          options={groupOptions}
          value={groupOptions.filter(opt => selectedGroupIds.includes(opt.value))}
          onChange={opts => setSelectedGroupIds(opts.map(opt => opt.value))}
          classNamePrefix="custom-select"
          className="react-select-container"
        />
      </div>
      {[form.title, form.deadline].every(field => field && field.trim() !== "") && (
  <div className="input-button-container question-select-container">
    <p>Selecionar questões:</p>

    <div className="question-select-wrapper">
      <Button onClick={() => setModalOpen(true)} />
      <p className="question-count">
        {selectedQuestionIds.length} questão(ões) selecionada(s)
      </p>
    </div>
  </div>
)}


      {questions.map((question) => (
          <div key={question.id} className="question-card">
            <p><strong>Tipo:</strong> {question.question_type}</p>
            <p><strong>Enunciado:</strong> {question.statement}</p>
            {question.alternatives && question.alternatives.length > 0 && (
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

      <QuestionSelectModal
      isOpen={isModalOpen}
      onClose={() => setModalOpen(false)}
      onSave={handleSelectQuestionsAndSave}
      token={token!}
      selectedQuestionIds={selectedQuestionIds}
    />
    </div>
  );
};

export default withAuth(CreateEditSimulation);
