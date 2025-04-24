"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/authContext";
import withAuth from "@/context/withAuth";
import { useRouter } from "next/navigation";
import Filter from "@/components/main/filter";
import Card from "@/components/main/card";
import Link from "next/link";
import Button from "@/components/main/button";
import "./page.css";
import axios from "axios";
import ApiRoutes from "@/services/constants";
import { toast } from "react-toastify";
import { format } from "date-fns"; 

const Groups = () => {
  const { user, isAuthenticated, token } = useAuth();
  const router = useRouter();
  const [groups, setGroups] = useState([]);
  const [filters, setFilters] = useState<{ [key: string]: string }>({});

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
      "Data de criação": "created_at",
    };
  
    const desformattedFilters = Object.entries(selectedFilters).reduce((acc, [key, value]) => {
      const originalKey = keyMapping[key] || key; 
      acc[originalKey] = value; 
      return acc;
    }, {} as { [key: string]: string });
  
    setFilters(desformattedFilters);  
  };
  

  return (
    <div>
      <div className="button-container">
        <Link href="./groups/createEditGroup">
          <Button />
        </Link>
      </div>
      <Filter groups={groups} onClickOutside={handleClickOutside} />
      <Card items={groups} route="groups"/>
    </div>
  );
};

export default withAuth(Groups);
