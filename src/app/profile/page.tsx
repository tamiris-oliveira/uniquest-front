"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/authContext";
import axios from "@/services/axiosConfig";
import ApiRoutes from "@/services/constants";
import { toast } from "react-toastify";
import { useDropzone } from "react-dropzone";
import { Pencil, Trash2 } from "lucide-react";
import { avatarPlaceholder } from "@/types/types";
import "./profile.css";
import Spinner from "@/components/main/spinner";

const Profile = () => {
  const { token, user, updateUserData } = useAuth();

  const [formData, setFormData] = useState({user: {
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    role: 0,
    avatar: "",
  }});

  const [loading, setLoading] = useState(true);

  // Busca os dados do perfil no backend
  const getProfile = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const response = await axios.get(ApiRoutes.PROFILE, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userData = response.data;
      setFormData({user: {
        name: userData.name || "",
        email: userData.email || "",
        password: userData.password || "",
        password_confirmation: "",
        role: userData.role || 0,
        avatar: userData.avatar || "",
      }});
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar perfil atualizado.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    getProfile();
  }, [getProfile]);

  // Upload da imagem e conversão para base64
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result?.toString() || "";
      setFormData((prev) => ({ ...prev, avatar: base64String }));
    };
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
    noClick: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      user: {
        ...prev.user,
        [e.target.name]: e.target.value
      }
    }));
  };
  
  const handleRemovePhoto = () => {
    setFormData((prev) => ({ ...prev, avatar: "" }));
  };

  // Atualiza perfil
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.put(ApiRoutes.PROFILE, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Perfil atualizado com sucesso!");

      const updatedUser = response.data;
      updateUserData({
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
      });

      // Limpa campo senha após salvar
      setFormData((prev) => ({
        ...prev,
        password: "",
      }));
    } catch (error) {
      console.error(error);
      toast.error("Erro ao atualizar perfil.");
    }
  };

  if (!token || loading) {
    return (
      <div className="profile-container">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="profile-container">
      <h2>Editar Perfil</h2>

      <div className="avatar-wrapper" {...getRootProps()}>
        <input {...getInputProps()} />
        <img
          src={formData.user.avatar || avatarPlaceholder}
          alt="Avatar"
          className="avatar-image"
          onClick={open}
          style={{ cursor: "pointer" }}
        />
        <div className="avatar-actions">
          <Pencil className="icon-button" onClick={open} />
          {formData.user.avatar && (
            <Trash2 className="icon-button danger" onClick={handleRemovePhoto} />
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="profile-form">
        <label>Nome</label>
        <input
          type="text"
          name="name"
          value={formData.user.name}
          onChange={handleChange}
          autoComplete="name"
        />

        <label>Email</label>
        <input
          type="email"
          name="email"
          value={formData.user.email}
          onChange={handleChange}
          autoComplete="email"
        />

        <label>Nova Senha</label>
        <input
          type="password"
          name="password"
          value={formData.user.password}
          onChange={handleChange}
          autoComplete="new-password"
        />

      <label>Confirme Sua Nova Senha</label>
        <input
          type="password"
          name="password_confirmation"
          value={formData.user.password_confirmation}
          onChange={handleChange}
          autoComplete="new-password"
        />

        <button type="submit">Salvar</button>
      </form>
    </div>
  );
};

export default Profile;
