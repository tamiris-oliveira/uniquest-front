"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/authContext";
import withAuth from "@/context/withAuth";
import { useRouter } from "next/navigation";
import Filter from "@/components/main/filter";
import Card from "@/components/main/card";
import Link from "next/link";
import Button from "@/components/main/button";
import { ConfirmToast } from "@/components/main/confirmToast";
import "./group.css";
import axios from "axios";
import ApiRoutes from "@/services/constants";
import { toast } from "react-toastify";
import { format } from "date-fns"; 

const Groups = () => {
  const { user, isAuthenticated, token } = useAuth();
  const router = useRouter();
  const initialFilters = (): { [key: string]: string } => {
    if (user?.role === 1) {
      return { creator_id: String(user.id) };
    }
    return {};
  };
  
  const [filters, setFilters] = useState<{ [key: string]: string }>(initialFilters());
  
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    getGroups(filters);
  }, [filters]);

  const getGroups = async (params: { [key: string]: string }) => {
    try {
      const queryString = new URLSearchParams(params).toString();

      const response = await axios.get(`${ApiRoutes.GROUPS}?${queryString}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const formattedGroups = response.data.map((group: any) => ({
        id: group.id,
        "Nome": group.name,
        "Código": group.invite_code,
        "Data de criação": format(new Date(group.created_at), "dd/MM/yyyy HH:mm:ss"),
      }));

      setGroups(formattedGroups);
    } catch (error) {
      toast.error("Erro ao buscar grupos");
    }
  };

  const handleClickOutside = (selectedFilters: { [key: string]: string }) => {
    const keyMapping: { [key: string]: string } = {
      "Nome": "name",
      "Código": "invite_code",
      "Data de Criação": "created_at",
    };

    const desformattedFilters = Object.entries(selectedFilters).reduce((acc, [key, value]) => {
      const originalKey = keyMapping[key] || key;
      acc[originalKey] = value;
      return acc;
    }, {} as { [key: string]: string });

    if (user?.role === 1) {
      desformattedFilters["creator_id"] = String(user.id);
    } else {
      delete desformattedFilters["creator_id"];
    }

    setFilters(desformattedFilters);
  };

  useEffect(() => {
    if (token) getGroups(filters);
  }, [token]);

  const handleEdit = (id: number) => {
    window.location.href = `/groups/createEditGroup?edit=true&id=${id}`;
  };

  const handleDelete = (id: number) => {
    ConfirmToast({
      message: "Tem certeza que deseja excluir o grupo?",
      onConfirm: async () => {
        try {
          await axios.delete(`${ApiRoutes.GROUPS}/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          toast.success("Grupo excluído com sucesso!");
          getGroups(filters);
          router.push("/groups")
        } catch {
          toast.error("Erro ao excluir grupo.");
        }
      },
    });
  };


  return (
    <div className="create-group-container">
    <div className="input-button-container">
      <h2 style={{ margin: 0 }}>Grupos</h2>
      <Link href="/groups/createEditGroup">
        <Button>Criar</Button>
      </Link>
    </div>
      <Filter groups={groups} onClickOutside={handleClickOutside} />
      <Card
      items={groups}
      route="groups"
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
    </div>
  );
};

export default withAuth(Groups);
