"use client";
import React, { useState, useEffect } from "react";
import withAuth from "@/context/withAuth";
import axios from "@/services/axiosConfig";
import { useAuth } from "@/context/authContext";
import { ArrowLeft } from "lucide-react";
import Button from "@/components/main/button";
import { ApiRoutes } from "@/services/constants";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSearchParams, useRouter } from "next/navigation";
import "./editCourse.css";

const CreateEditCourse = () => {
  const { user, token } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("id");
  const isEdit = searchParams.get("edit") === "true";

  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Verificar se o usuário tem permissão
    if (user && user.role !== 2) {
      toast.error("Acesso negado. Apenas superadmins podem gerenciar cursos.");
      router.push("/courses");
      return;
    }

    if (token && courseId && isEdit) {
      fetchCourse();
    }
  }, [token, courseId, isEdit, user, router]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await axios.get(ApiRoutes.COURSE(courseId!), {
        headers: { Authorization: `Bearer ${token}` },
      });

      const courseData = response.data;
      setCourseName(courseData.name);
      setCourseCode(courseData.code);
      setCourseDescription(courseData.description || "");
    } catch (error) {
      toast.error("Erro ao carregar curso.");
      console.error("Erro ao buscar curso:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCourse = async () => {
    if (!courseName.trim()) {
      toast.warn("Por favor, insira um nome para o curso.");
      return;
    }

    if (!courseCode.trim()) {
      toast.warn("Por favor, insira um código para o curso.");
      return;
    }

    const payload = {
      course: {
        name: courseName.trim(),
        code: courseCode.trim().toUpperCase(),
        description: courseDescription.trim(),
      },
    };

    try {
      setLoading(true);
      
      if (isEdit && courseId) {
        await axios.put(ApiRoutes.COURSE(courseId), payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Curso atualizado com sucesso!");
      } else {
        const { data } = await axios.post(ApiRoutes.COURSES, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Curso criado com sucesso!");
        router.push(`/courses/createEditCourse?edit=true&id=${data.id}`);
      }
    } catch (error: any) {
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        if (errors.code && errors.code.includes("has already been taken")) {
          toast.error("Este código de curso já está em uso.");
        } else {
          toast.error("Erro de validação. Verifique os dados inseridos.");
        }
      } else {
        toast.error("Erro ao salvar curso.");
      }
      console.error("Erro ao salvar curso:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push("/courses");
  };

  return (
    <div className="create-course-container">
      <div className="course-header">
        <button className="back-button" onClick={handleBack}>
          <ArrowLeft size={20} />
          Voltar
        </button>
        <h2>{isEdit ? "Editar Curso" : "Criar Curso"}</h2>
      </div>

      <div className="course-form">
        <div className="form-group">
          <label htmlFor="course-name">Nome do Curso *</label>
          <input
            type="text"
            id="course-name"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            placeholder="Ex: Engenharia de Software"
            maxLength={100}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="course-code">Código do Curso *</label>
          <input
            type="text"
            id="course-code"
            value={courseCode}
            onChange={(e) => setCourseCode(e.target.value.toUpperCase())}
            placeholder="Ex: ENG-SW"
            maxLength={20}
            disabled={loading}
          />
          <small className="field-hint">
            Código único para identificar o curso (será convertido para maiúsculas)
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="course-description">Descrição</label>
          <textarea
            id="course-description"
            value={courseDescription}
            onChange={(e) => setCourseDescription(e.target.value)}
            placeholder="Descrição opcional do curso..."
            maxLength={500}
            rows={4}
            disabled={loading}
          />
          <small className="field-hint">
            {courseDescription.length}/500 caracteres
          </small>
        </div>

        <div className="form-actions">
          <Button 
            onClick={handleSaveCourse} 
            disabled={loading || !courseName.trim() || !courseCode.trim()}
          >
            {loading ? "Salvando..." : (isEdit ? "Salvar Alterações" : "Criar Curso")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default withAuth(CreateEditCourse);
