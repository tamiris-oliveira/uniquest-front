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
import "./simulation.css";
import axios from "@/services/axiosConfig";
import ApiRoutes from "@/services/constants";
import { toast } from "react-toastify";
import { format } from "date-fns"; 
import { Simulation } from "@/types/types";

const Simulations = () => {
  const { user, isAuthenticated, token } = useAuth();
  const router = useRouter();
  const [simulations, setSimulations] = useState([]);
  const [filters, setFilters] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    getSimulations(filters); 
  }, [filters]); 

  const getSimulations = async (params: { [key: string]: string }) => {
    try {
      const queryString = new URLSearchParams(params).toString();

      const response = await axios.get(`${ApiRoutes.SIMULATIONS}?${queryString}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const formattedSimulations = response.data.map((simulation: any) => ({
        id: simulation.id,
        "Nome": simulation.title,
        "Data de Criação": format(new Date(simulation.created_at), "dd/MM/yyyy HH:mm:ss"),
        "Data de Vencimento": format(new Date(simulation.deadline), "dd/MM/yyyy HH:mm:ss"),
      }));

      setSimulations(formattedSimulations);
    } catch (error) {
      toast.error("Erro ao buscar simulados");
    }
  };

   const handleEdit = (id: string | number) => {
    window.location.href = `/simulations/createEditSimulation?edit=true&id=${id}`;
  };

  const handleDelete = (id: string | number) => {
    ConfirmToast({
      message: "Tem certeza que deseja excluir o simulado?",
      onConfirm: async () => {
        try {
          await axios.delete<Simulation>(
                ApiRoutes.SIMULATION(id), {
            headers: { Authorization: `Bearer ${token}` },
          });
          toast.success("Simulado excluído com sucesso!");
          getSimulations(filters);
        } catch {
          toast.error("Erro ao excluir simulado.");
        }
      },
    });
  };


  useEffect(() => {
    if (token) getSimulations(filters);
  }, [token]);

  const handleClickOutside = (selectedFilters: { [key: string]: string }) => {
    const keyMapping: { [key: string]: string } = {
      "Nome": "title",
      "Data de Criação": "creation_date",
      "Data de Vencimento": "deadline",
    };
  
    const desformattedFilters = Object.entries(selectedFilters).reduce((acc, [key, value]) => {
      const originalKey = keyMapping[key] || key; 
      acc[originalKey] = value; 
      return acc;
    }, {} as { [key: string]: string });
  
    setFilters(desformattedFilters);  
  };
  
  return (
      <div className="create-group-container">
      {(user?.role === 1 || user?.role === 2 || user?.role === 3) && (
    <div className="input-button-container">
      <h2 style={{ margin: 0 }}>Simulados</h2>
      <Link href="/simulations/createEditSimulation">
        <Button>Criar</Button>
      </Link>
    </div>
    )}
      <Filter groups={simulations} onClickOutside={handleClickOutside} />
      <Card
      items={simulations}
      route="simulations"
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
    </div>
  );
};

export default withAuth(Simulations);
