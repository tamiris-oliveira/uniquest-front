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
  const [requestingTeacherRole, setRequestingTeacherRole] = useState(false);

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
    if (!file) return;
    
    // Validar tamanho do arquivo (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB");
      return;
    }
    
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result?.toString() || "";
      setFormData((prev) => ({ 
        ...prev, 
        user: {
          ...prev.user,
          avatar: base64String 
        }
      }));
    };
    reader.onerror = () => {
      toast.error("Erro ao processar a imagem");
    };
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps, open, isDragActive } = useDropzone({
    onDrop,
    accept: { 
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/gif": [".gif"],
      "image/webp": [".webp"]
    },
    multiple: false,
    noClick: true,
    maxSize: 5 * 1024 * 1024, // 5MB
    onDropRejected: (fileRejections) => {
      const rejection = fileRejections[0];
      if (rejection.errors.some(e => e.code === 'file-too-large')) {
        toast.error("A imagem deve ter no máximo 5MB");
      } else if (rejection.errors.some(e => e.code === 'file-invalid-type')) {
        toast.error("Formato de arquivo não suportado. Use JPG, PNG, GIF ou WebP");
      } else {
        toast.error("Erro ao processar o arquivo");
      }
    }
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
    setFormData((prev) => ({ 
      ...prev, 
      user: {
        ...prev.user,
        avatar: "" 
      }
    }));
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

      // Limpa campos de senha após salvar
      setFormData((prev) => ({
        ...prev,
        user: {
          ...prev.user,
          password: "",
          password_confirmation: "",
        }
      }));
    } catch (error) {
      console.error(error);
      toast.error("Erro ao atualizar perfil.");
    }
  };

  const handleRequestTeacherRole = async () => {
    try {
      setRequestingTeacherRole(true);
      await axios.post(
        ApiRoutes.REQUEST_TEACHER_ROLE,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Solicitação para se tornar professor enviada com sucesso! Aguarde a aprovação.");
    } catch (error) {
      console.error('Erro ao solicitar role de professor:', error);
      toast.error("Erro ao enviar solicitação. Tente novamente.");
    } finally {
      setRequestingTeacherRole(false);
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

      <div className={`avatar-wrapper ${isDragActive ? 'drag-active' : ''}`} {...getRootProps()}>
        <input {...getInputProps()} />
        <img
          src={formData.user.avatar || avatarPlaceholder}
          alt="Avatar"
          className="avatar-image"
          onClick={open}
          style={{ cursor: "pointer" }}
        />
        <div className="avatar-actions">
          <button className="icon-button" onClick={open} title="Alterar foto">
            <Pencil size={16} />
          </button>
          {formData.user.avatar && (
            <button className="icon-button danger" onClick={handleRemovePhoto} title="Remover foto">
              <Trash2 size={16} />
            </button>
          )}
        </div>
        {isDragActive && (
          <div className="drag-overlay">
            <p>Solte a imagem aqui...</p>
          </div>
        )}
      </div>
      <p className="upload-hint">
        Clique no ícone de lápis ou arraste uma imagem aqui para alterar sua foto de perfil
        <br />
        <small>Formatos aceitos: JPG, PNG, GIF, WebP (máximo 5MB)</small>
      </p>

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

      {user?.role === 0 && (
        <div className="teacher-request-section">
          <h3>Solicitar Permissões de Professor</h3>
          <p>Se você é um educador e gostaria de criar simulados e questões, solicite permissões de professor.</p>
          <button 
            onClick={handleRequestTeacherRole}
            disabled={requestingTeacherRole}
            className="teacher-request-btn"
          >
            {requestingTeacherRole ? "Enviando..." : "Solicitar Permissões de Professor"}
          </button>
        </div>
      )}
    </div>
  );
};

export default Profile;
