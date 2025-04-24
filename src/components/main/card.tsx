import React from "react";
import Link from "next/link";
import axios from "axios";
import { useAuth } from "@/context/authContext";
import { ApiRoutes } from "@/services/constants";
import { Edit, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import "./card.css";

interface Item {
  [key: string]: any;
}

const CardGroup = ({ items, route }: { items: Item[], route: string }) => {
  const { user, isAuthenticated, token } = useAuth();

  const handleEdit = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    window.location.href = `/${route}/createEditGroup?edit=true&id=${id}`;
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    if (confirm("Tem certeza que deseja excluir?")) {
      await axios.delete(`${ApiRoutes.GROUPS}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Grupo excluído com sucesso!");
    }
  };

  return (
    <div className="card-group">
      {items.map((item, index) => (
        <Link key={index} href={`/${route}/${item.id}`}>
          <div className="card">
            <div className="card-actions">
              <Edit size={18} className="icon" onClick={(e) => handleEdit(e, item.id)} />
              <Trash2 size={18} className="icon delete" onClick={(e) => handleDelete(e, item.id)} />
            </div>
            {Object.keys(item).map((key) => (
              <div key={key} className="card-property">
                <strong>{key}: </strong>{String(item[key])}
              </div>
            ))}
          </div>
        </Link>
      ))}
    </div>
  );
};

export default CardGroup;
