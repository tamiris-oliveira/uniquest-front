"use client";
import React, { useState, useEffect } from "react";
import withAuth from "@/context/withAuth";
import axios from "axios";
import { useAuth } from "@/context/authContext";
import { X, Copy } from "lucide-react";
import Button from "@/components/main/button";
import { ApiRoutes } from "@/services/constants";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSearchParams } from "next/navigation"; 
import "./editGroup.css";
import { avatarPlaceholder } from "@/types/types";

const CreateEditGroup = () => {
  const { user, isAuthenticated, token } = useAuth();
  const searchParams = useSearchParams();
  const groupId = searchParams.get("id");

  const [groupName, setGroupName] = useState("");
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [participants, setParticipants] = useState<{ id: string; name: string; avatar: string }[]>([]);
  const [inviteCode, setInviteCode] = useState("null");

  useEffect(() => {
    if (token) fetchUsers();

    if (token && groupId) {
      fetchGroup();
    }
  }, [token, groupId]);

  const fetchGroup = async () => {
    try {
      const response = await axios.get(`${ApiRoutes.GROUPS}/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const groupData = response.data;
      setGroupName(groupData.name);
      setInviteCode(groupData.invite_code);
      setSelectedParticipants(groupData.users.map((u: any) => u.id));
    } catch (error) {
      toast.error("Erro ao carregar grupo.");
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(ApiRoutes.COURSE_USERS(user?.course_id), {
        headers: { Authorization: `Bearer ${token}` },
      });
      setParticipants(response.data);
    } catch (error) {
      toast.error("Erro ao buscar usuários.");
    }
  };


  const handleSelectParticipant = (id: string) => {
    if (!selectedParticipants.includes(id)) {
      setSelectedParticipants([...selectedParticipants, id]);
    }
  };

  const handleRemoveParticipant = (id: string) => {
    setSelectedParticipants(selectedParticipants.filter((participantId) => participantId !== id));
  };

  const generateInviteCode = () => {
    return Math.random().toString(36).substr(2, 8).toUpperCase();
  };

  const handleSaveGroup = async () => {
    if (!groupName.trim()) {
      toast.warn("Por favor, insira um nome para o grupo.");
      return;
    }
    const payload = {
      group: {
        name: groupName,
        invite_code: inviteCode !== "null" ? inviteCode : generateInviteCode(),
        users_id: selectedParticipants,
        creator_id: user?.id
      },
    };

    try {
      if (groupId) {
        await axios.put(`${ApiRoutes.GROUPS}/${groupId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Grupo atualizado com sucesso!");
      } else {
        const {data} = await axios.post(ApiRoutes.GROUPS, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Grupo criado com sucesso!");
        window.location.href = `/groups/createEditGroup?edit=true&id=${data.id}`;
      }

      setGroupName("");
      setSelectedParticipants([]);
      if(groupId)
        fetchGroup();
      fetchUsers();
    } catch (error) {
      toast.error("Erro ao salvar grupo.");
    }
  };

  return (
    <div className="create-group-container">
    <div className="input-button-container">
      <h2 style={{ margin: 0 }}>{groupId ? "Editar Grupo" : "Criar Grupo"}</h2>
      <Button onClick={handleSaveGroup}>
          {groupId ? "Salvar" : "Criar"}
        </Button>
    </div>
      <label htmlFor="group-name">Digite o nome do grupo:</label>
      <div className="input-button-container">
        <input
          type="text"
          id="group-name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="Nome do grupo"
        />
      </div>

      <p>Participantes selecionados:</p>
      <div className="selected-participants">
        {selectedParticipants.map((id) => {
          const participant = participants.find((p) => p.id === id);
          return participant ? (
            <div key={participant.id} className="selected-card">
              <img src={participant.avatar || avatarPlaceholder} alt={participant.name} className="participant-photo" />
              <span>{participant.name}</span>
              <button className="remove-button" onClick={() => handleRemoveParticipant(participant.id)}>
                <X size={16} />
              </button>
            </div>
          ) : null;
        })}
      </div>

      <p>Adicionar participantes:</p>
      <div className="input-button-container">
        <input
          type="text"
          placeholder="Filtrar por nome"
          value={search}
          onChange={(e) => setSearch(e.target.value.toLowerCase())}
        />
      </div>

      <div className="select-all-container">
        <label className="select-all-checkbox">
          <input
            type="checkbox"
            checked={selectedParticipants.length === participants.length && participants.length > 0}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedParticipants(participants.map(p => p.id));
              } else {
                setSelectedParticipants([]);
              }
            }}
          />
          Selecionar todos os participantes
        </label>
      </div>

      <div className="participants-list">
        {participants
          .filter((p) => p.name.toLowerCase().includes(search))
          .map((participant) => (
            <div
              key={participant.id}
              className={`participant-card ${selectedParticipants.includes(participant.id) ? "selected" : ""}`}
              onClick={() => handleSelectParticipant(participant.id)}
            >
              <img src={participant.avatar || avatarPlaceholder} alt={participant.name} className="participant-photo" />
              <span>{participant.name}</span>
            </div>
          ))}
      </div>
    </div>
  );
};

export default withAuth(CreateEditGroup);
