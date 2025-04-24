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
import "./page.css";

const CreateEditGroup = () => {
  const { user, isAuthenticated, token } = useAuth();
  const searchParams = useSearchParams();
  const groupId = searchParams.get("id");

  const [groupName, setGroupName] = useState("");
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [participants, setParticipants] = useState<{ id: string; name: string; photo: string }[]>([]);
  const [inviteCode, setInviteCode] = useState("null");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(ApiRoutes.USERS, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setParticipants(response.data);
      } catch (error) {
        toast.error("Erro ao buscar usuários.");
      }
    };

    if (token) fetchUsers();

    if (token && groupId) {
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

      fetchGroup();
    }
  }, [token, groupId]);

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

    const data = {
      group: {
        name: groupName,
        invite_code: inviteCode !== "null" ? inviteCode : generateInviteCode(),
        users_id: selectedParticipants,
      },
    };

    try {
      if (groupId) {
        await axios.put(`${ApiRoutes.GROUPS}/${groupId}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Grupo atualizado com sucesso!");
      } else {
        await axios.post(ApiRoutes.GROUPS, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Grupo criado com sucesso!");
      }

      setGroupName("");
      setSelectedParticipants([]);
    } catch (error) {
      toast.error("Erro ao salvar grupo.");
    }
  };

  const handleCopyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode);
    toast.info("Código de convite copiado!");
  };

  return (
    <div className="create-group-container">
      <label htmlFor="group-name">Digite o nome do grupo:</label>
      <div className="input-button-container">
        <input
          type="text"
          id="group-name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="Nome do grupo"
        />
        <Button onClick={handleSaveGroup}>
          {groupId ? "Salvar alterações" : "Criar"}
        </Button>
      </div>

      {inviteCode !== "null" && (
        <div className="invite-code-container">
          <p>Código de convite: <strong>{inviteCode}</strong></p>
          <button className="copy-button" onClick={handleCopyInviteCode}>
            <Copy size={16} /> Copiar
          </button>
        </div>
      )}

      <p>Participantes selecionados:</p>
      <div className="selected-participants">
        {selectedParticipants.map((id) => {
          const participant = participants.find((p) => p.id === id);
          return participant ? (
            <div key={participant.id} className="selected-card">
              <img src={participant.photo} alt={participant.name} className="participant-photo" />
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

      <div className="participants-list">
        {participants
          .filter((p) => p.name.toLowerCase().includes(search))
          .map((participant) => (
            <div
              key={participant.id}
              className={`participant-card ${selectedParticipants.includes(participant.id) ? "selected" : ""}`}
              onClick={() => handleSelectParticipant(participant.id)}
            >
              <img src={participant.photo} alt={participant.name} className="participant-photo" />
              <span>{participant.name}</span>
            </div>
          ))}
      </div>
    </div>
  );
};

export default withAuth(CreateEditGroup);
