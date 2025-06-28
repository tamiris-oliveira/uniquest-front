"use client";
import React, { useEffect, useState } from "react";
import withAuth from "@/context/withAuth";
import axios from "axios";
import { useAuth } from "@/context/authContext";
import Button from "@/components/main/button";
import { ApiRoutes } from "@/services/constants";
import { toast } from "react-toastify";
import { useSearchParams } from "next/navigation";
import { Simulation, SimulationPayload } from "@/types/types";
import Select from "react-select";
import { format, parseISO } from "date-fns";
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
  const groupOptions = groups.map(g => ({ value: g.id, label: g.name }));
  

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
      ApiRoutes.SIMULATION(simulationId),
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setSimulationName(data.title);
    setSimulationDescription(data.description);
    setDeadline(data.deadline); 

    const groupIds = data.groups ? data.groups.map(group => group.id) : [];
    setSelectedGroupIds(groupIds);
  } catch {
    toast.error("Erro ao carregar simulação.");
  }
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
        deadline: new Date(deadline).toISOString(),
        user_id: user!.id,
        group_ids: selectedGroupIds,
      },
    };

    try {
      if (simulationId) {
        await axios.put<Simulation>(
                        ApiRoutes.SIMULATION(simulationId),
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("Payload:", payload);
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
      fetchGroups();
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
          value={toInputDateTimeValue(deadline)}
          onChange={e => {
            const iso = new Date(e.target.value).toISOString();
            setDeadline(iso);
          }}
          placeholder="Selecione data e hora"
        />


      </div>

      <label htmlFor="groups-select">Selecione os grupos:</label>
      <div className="input-button-container">
        <Select
        isMulti
        options={groupOptions}
        value={groupOptions.filter(opt => selectedGroupIds.includes(opt.value))}
        onChange={opts => setSelectedGroupIds(opts.map(opt => opt.value))}
        classNamePrefix="custom-select"
        className="react-select-container"
        />
      </div>
    </div>
  );
};

export default withAuth(CreateEditSimulation);
