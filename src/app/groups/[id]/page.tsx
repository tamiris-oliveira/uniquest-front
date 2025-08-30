"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/authContext";
import axios from "@/services/axiosConfig";
import { ApiRoutes } from "@/services/constants";
import { toast } from "react-toastify";
import {Copy } from "lucide-react";
import { useParams } from "next/navigation";
import { avatarPlaceholder } from "@/types/types";
import "./viewGroup.css";

interface Participant {
  id: string;
  name: string;
  avatar: string;
}

const ViewGroup = () => {
  const { token } = useAuth();
  const { id } = useParams();

  const [groupName, setGroupName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [selectedParticipants, setSelectedParticipants] = useState<Participant[]>([]);
  const [search, setSearch] = useState(""); // Se quiser pode remover pois filtro não será usado

  useEffect(() => {
    if (token && id) {
      fetchGroup();
    }
  }, [token, id]);

  const fetchGroup = async () => {
    try {
      const response = await axios.get(`${ApiRoutes.GROUPS}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const groupData = response.data;
      setGroupName(groupData.name);
      setInviteCode(groupData.invite_code);
      setSelectedParticipants(groupData.users || []);
    } catch (error) {
      toast.error("Erro ao carregar grupo.");
    }
  };

  return (
    <div className="view-group-container">
      <h2>Detalhes do Grupo</h2>

      <p><strong>Nome do grupo:</strong> {groupName}</p>

      <h3>Participantes do grupo:</h3>
      <ul className="participants-list">
        {selectedParticipants.length === 0 && <li>Nenhum participante no grupo.</li>}
        {selectedParticipants.map((participant) => (
          <li key={participant.id} className="participant-list-item">
            <img src={participant.avatar || avatarPlaceholder} alt={participant.name} className="participant-photo" />
            <span>{participant.name}</span>
          </li>
        ))}
      </ul>

    </div>
  );
};

export default ViewGroup;
