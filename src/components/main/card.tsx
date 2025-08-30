"use client";
import React, { useEffect, useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import { useAuth } from "@/context/authContext";
import { ConfirmToast } from "./confirmToast";
import { useRouter } from "next/navigation";
import axios from "@/services/axiosConfig";
import ApiRoutes from "@/services/constants";
import { toast } from "react-toastify";
import "./card.css";

interface Item {
  [key: string]: any;
}

interface CardProps {
  items: Item[];
  route: string;
  onEdit?: (id: string | number) => void;
  onDelete?: (id: string | number) => void;
  linkOnClick?: boolean;
}

const Card = ({ items, route, onEdit, onDelete, linkOnClick = true }: CardProps) => {
  const { user, token } = useAuth();
  const router = useRouter();
  const [renderItems, setRenderItems] = useState<Item[]>([]);

  const parseDate = (dateStr: string) => {
    const [day, month, yearAndTime] = dateStr.split("/");
    const [year, time] = yearAndTime.split(" ");
    return new Date(`${year}-${month}-${day}T${time}`);
  };

  const isDeadlinePassed = (dateStr: string | undefined) => {
    if (!dateStr) return false;
    const deadline = parseDate(dateStr);
    return new Date() > deadline;
  };

  useEffect(() => {
    if (route === "simulations") {
      const enrichedItems = items.map((item) => {
        const deadlineRaw = item["Data de Vencimento"];
        const passed = isDeadlinePassed(deadlineRaw);
        const deadline = deadlineRaw ? parseDate(deadlineRaw) : null;
        return { ...item, deadlinePassed: passed, deadlineDate: deadline };
      });

      const valid = enrichedItems
        .filter((i) => !i.deadlinePassed)
        .sort((a, b) => {
          if (!a.deadlineDate || !b.deadlineDate) return 0;
          return a.deadlineDate.getTime() - b.deadlineDate.getTime();
        });

      const expired = enrichedItems.filter((i) => i.deadlinePassed);

      setRenderItems([...valid, ...expired]);
    } else {
      setRenderItems(items);
    }
  }, [items, route]);

  const handleTakeSimulation = async (simulationId: string | number) => {
    try {
      // Buscar dados da simulação para verificar tentativas
      const { data: simulation } = await axios.get(
        ApiRoutes.SIMULATION(simulationId),
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Buscar tentativas do usuário para esta simulação
      const { data: attempts } = await axios.get(
        `${ApiRoutes.ATTEMPTS}?simulation_id=${simulationId}&user_id=${user?.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const userAttempts = attempts.length;
      const maxAttempts = simulation.max_attempts || 1;

      if (userAttempts >= maxAttempts) {
        toast.error(`Você já atingiu o limite de ${maxAttempts} tentativa(s) para este simulado.`);
        return;
      }

      const remainingAttempts = maxAttempts - userAttempts;
      const attemptText = remainingAttempts === 1 ? "tentativa" : "tentativas";
      
      ConfirmToast({
        message: `Tem certeza que deseja iniciar o simulado? Isso contará como uma tentativa. Você tem ${remainingAttempts} ${attemptText} restante(s).`,
        onConfirm: async () => {
          router.push(`/simulations/${simulationId}/take`);
        },
      });
    } catch (error) {
      console.error("Erro ao verificar tentativas:", error);
      toast.error("Erro ao verificar tentativas. Tente novamente.");
    }
  };

  return (
    <div className="card-group">
      {renderItems.map((item, index) => {
        const isAdmin = user?.role === 1 || user?.role === 2;
        const clickable = route === "simulations" ? !item.deadlinePassed && !isAdmin : true;

        const cardContent = (
          <div className="card">
            {isAdmin && (
              <div className="card-actions">
                {onEdit && (
                  <Edit
                    size={18}
                    className="icon"
                    onClick={(e) => {
                      e.preventDefault();
                      onEdit(item.id);
                    }}
                  />
                )}
                {onDelete && (
                  <Trash2
                    size={18}
                    className="icon delete"
                    onClick={(e) => {
                      e.preventDefault();
                      onDelete(item.id);
                    }}
                  />
                )}
              </div>
            )}
            {Object.entries(item).map(([key, value]) => {
              if (key === "deadlinePassed" || key === "deadlineDate") return null;
              return (
                <div key={key} className="card-property">
                  <strong>{key}: </strong>
                  {String(value)}
                </div>
              );
            })}
          </div>
        );

        if (!linkOnClick) {
          return <div key={index}>{cardContent}</div>;
        }

        if (clickable) {
          return (
            <div
              key={index}
              className="card-link-wrapper"
              onClick={() =>
                isAdmin
                  ? router.push(`/${route}/${item.id}`)
                  : handleTakeSimulation(item.id)
              }
              style={{ cursor: "pointer" }}
            >
              {cardContent}
            </div>
          );
        } else {
          return (
            <div
              key={index}
              className={"card-link-wrapper disabled"}
              style={!isAdmin ? { cursor: "default", opacity: 0.6 }:{}}
            >
              {cardContent}
            </div>
          );
        }
      })}
    </div>
  );
};

export default Card;
