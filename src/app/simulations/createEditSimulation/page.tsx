"use client";
import React, { useEffect, useState } from "react";
import withAuth from "@/context/withAuth";
import axios from "axios";
import { useAuth } from "@/context/authContext";
import Button from "@/components/main/button";
import { ApiRoutes } from "@/services/constants";
import { toast } from "react-toastify";
import { useSearchParams } from "next/navigation";
import { Simulation, SimulationPayload } from "@/types/simulation";
import "react-toastify/dist/ReactToastify.css";
import "./page.css";

interface Group {
  id: number;
  name: string;
}

const CreateEditSimulation: React.FC = () => {
  const { user, token } = useAuth();
  const searchParams = useSearchParams();
  const simulationId = searchParams.get("id");

  const [simulationName, setSimulationName] = useState<string>("");
  const [simulationDescription, setSimulationDescription] = useState<string>("");
  const [deadline, setDeadline] = useState<string>("");
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<number[]>([]);

  useEffect(() => {
    if (token) {
      fetchGroups();
      if (simulationId) fetchSimulation();
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
        `${ApiRoutes.SIMULATION}/${simulationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSimulationName(data.title);
      setSimulationDescription(data.description);
      setDeadline(data.deadline);
      setSelectedGroupIds(data.group_id || []);
    } catch {
      toast.error("Erro ao carregar simulação.");
    }
  };

  const handleGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = Array.from(e.target.selectedOptions);
    const ids = options.map(o => Number(o.value));
    setSelectedGroupIds(ids);
  };

  const handleSaveSimulation = async () => {
    if (!simulationName.trim()) {
      toast.warn("Por favor, insira um nome para o simulado.");
      return;
    }

    const payload: SimulationPayload = {
      simulation: {
        title: simulationName,
        description: simulationDescription,
        creation_date: new Date().toISOString(),
        deadline,
        user_id: user!.id,
        group_id: selectedGroupIds,
      },
    };

    try {
      if (simulationId) {
        await axios.put(
          `${ApiRoutes.SIMULATION}/${simulationId}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Simulado atualizado com sucesso!");
      } else {
        await axios.post(
          ApiRoutes.SIMULATIONS,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Simulado criado com sucesso!");
      }
      setSimulationName("");
      setSimulationDescription("");
      setDeadline("");
      setSelectedGroupIds([]);
    } catch {
      toast.error("Erro ao salvar simulado.");
    }
  };

  const handleRemoveGroup = (id: number) => {
  setSelectedGroupIds(prev => prev.filter(gid => gid !== id));
};


  return (
    <div className="create-group-container">
      <label htmlFor="simulation-name">Nome do Simulado:</label>
      <div className="input-button-container">
        <input
          id="simulation-name"
          type="text"
          value={simulationName}
          onChange={e => setSimulationName(e.target.value)}
          placeholder="Nome do simulado"
        />
        <Button onClick={handleSaveSimulation}>
          {simulationId ? "Salvar" : "Criar"}
        </Button>
      </div>

      <label htmlFor="simulation-description">Descrição:</label>
      <div className="input-button-container">
        <input
          id="simulation-description"
          type="text"
          value={simulationDescription}
          onChange={e => setSimulationDescription(e.target.value)}
          placeholder="Descrição do simulado"
        />
      </div>

      <label htmlFor="simulation-deadline">Data de Vencimento:</label>
      <div className="input-button-container">
        <input
          id="simulation-deadline"
          type="datetime-local"
          value={deadline}
          onChange={e => setDeadline(e.target.value)}
          placeholder="Selecione data e hora"
        />
      </div>

      <label htmlFor="groups-select">Selecione os grupos:</label>
      <div className="input-button-container">
      <select
        id="groups-select"
        multiple
        value={selectedGroupIds.map(String)}
        onChange={handleGroupChange}
      >
        {groups.map((g) => (
          <option key={g.id} value={g.id}>
            {g.name}
          </option>
        ))}
      </select>
      </div>

      {selectedGroupIds.length > 0 && (
  <div className="selected-groups">
    {selectedGroupIds.map((id) => {
      const group = groups.find((g) => g.id === id);
      if (!group) return null;
      return (
        <div key={id} className="selected-group-tag">
          <span>{group.name}</span>
          <button type="button" onClick={() => handleRemoveGroup(id)}>×</button>
        </div>
      );
    })}
  </div>
)}


    </div>
  );
};

export default withAuth(CreateEditSimulation);
