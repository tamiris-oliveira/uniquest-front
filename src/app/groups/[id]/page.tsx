"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/authContext";
import axios from "axios";
import { ApiRoutes } from "@/services/constants";
import { toast } from "react-toastify";
import withAuth from "@/context/withAuth";
import "./page.css";

interface User {
  id: number;
  name: string;
  email: string;
  photo?: string; 
}

interface Group {
  id: number;
  name: string;
  invite_code: string;
  created_at: string;
  users: User[];
}

const GroupDetail = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    const fetchGroup = async () => {
      try {
        const response = await axios.get(`${ApiRoutes.GROUPS}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setGroup(response.data);
      } catch (error) {
        toast.error("Erro ao buscar grupo.");
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();
  }, [id]);

  const handleCopy = () => {
    if (group?.invite_code) {
      navigator.clipboard.writeText(group.invite_code);
      toast.success("Código copiado!");
    }
  };

  if (loading) return <p>Carregando...</p>;
  if (!group) return <p>Grupo não encontrado.</p>;

  return (
    <div className="create-group-container">
      <h1>Detalhes do Grupo</h1>
      <p><strong>Nome:</strong> {group.name}</p>

      <div className="invite-code-container">
        <span><strong>Código de convite:</strong> {group.invite_code}</span>
        <button className="copy-button" onClick={handleCopy}>Copiar</button>
      </div>

      <p><strong>Data de criação:</strong> {new Date(group.created_at).toLocaleString()}</p>

      <h2>Participantes</h2>
      <div className="participants-list">
        {group.users.length > 0 ? (
          group.users.map((user) => (
            <div key={user.id} className="participant-card">
              <img src={user.photo || "/default-avatar.png"} alt={user.name} />
              <div>
                <strong>{user.name}</strong><br />
                <span>{user.email}</span>
              </div>
            </div>
          ))
        ) : (
          <p>Nenhum participante.</p>
        )}
      </div>
    </div>
  );
};

export default withAuth(GroupDetail);
