"use client";
import React, { useState, useEffect, useCallback } from "react";
import withAuth from "@/context/withAuth";
import axios from "@/services/axiosConfig";
import { useAuth } from "@/context/authContext";
import { Edit, Users, BookOpen, UserPlus, X } from "lucide-react";
import Button from "@/components/main/button";
import { ApiRoutes } from "@/services/constants";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";
import "./course.css";

interface Course {
  id: string;
  name: string;
  code: string;
  description: string;
  users_count: number;
  created_at: string;
}

const CoursesPage = () => {
  const { user, token } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [adminForm, setAdminForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [creatingAdmin, setCreatingAdmin] = useState(false);

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(ApiRoutes.COURSES, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses(response.data);
    } catch (error) {
      toast.error("Erro ao carregar cursos.");
      console.error("Erro ao buscar cursos:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchCourses();
    }
  }, [token, fetchCourses]);

  const handleEditCourse = (id: string) => {
    router.push(`/courses/createEditCourse?edit=true&id=${id}`);
  };

  const handleCreateCourse = () => {
    router.push("/courses/createEditCourse");
  };

  const handleOpenAdminModal = (course: Course) => {
    setSelectedCourse(course);
    setShowAdminModal(true);
    setAdminForm({
      name: "",
      email: "",
      password: "",
      confirmPassword: ""
    });
  };

  const handleCloseAdminModal = () => {
    setShowAdminModal(false);
    setSelectedCourse(null);
    setAdminForm({
      name: "",
      email: "",
      password: "",
      confirmPassword: ""
    });
  };

  const handleAdminFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAdminForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCourse) return;
    
    if (adminForm.password !== adminForm.confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    if (adminForm.password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    try {
      setCreatingAdmin(true);
      
      const payload = {
        user: {
          name: adminForm.name.trim(),
          email: adminForm.email.trim(),
          password: adminForm.password,
          course_id: selectedCourse.id,
          role: 1, // Admin do curso
        },
      };
      
      await axios.post(ApiRoutes.USERS, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      toast.success(`Admin criado com sucesso para o curso ${selectedCourse.name}!`);
      handleCloseAdminModal();
      fetchCourses(); // Atualizar a lista de cursos
    } catch (error: any) {
      console.error("Erro ao criar admin:", error);
      const errorMessage = error?.response?.data?.errors?.[0] || 
                          error?.response?.data?.error || 
                          "Erro ao criar admin. Tente novamente.";
      toast.error(errorMessage);
    } finally {
      setCreatingAdmin(false);
    }
  };

  const filteredCourses = courses.filter((course) =>
    course.name.toLowerCase().includes(search.toLowerCase()) ||
    course.code.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="courses-container">
        <div className="loading">Carregando cursos...</div>
      </div>
    );
  }

  return (
    <div className="courses-container">
      <div className="courses-header">
        <h1>Cursos</h1>
        {user?.role === 3 && (
          <Button onClick={handleCreateCourse}>
            Criar Curso
          </Button>
        )}
      </div>

      <div className="search-container">
        <input
          type="text"
          placeholder="Buscar por nome ou código do curso..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
      </div>

      {filteredCourses.length === 0 ? (
        <div className="no-courses">
          <BookOpen size={48} />
          <p>Nenhum curso encontrado</p>
          {search && <p className="search-hint">Tente ajustar sua busca</p>}
        </div>
      ) : (
        <div className="courses-grid">
          {filteredCourses.map((course) => (
            <div key={course.id} className="course-card">
              <div className="course-header">
                <div className="course-info">
                  <h3>{course.name}</h3>
                  <span className="course-code">{course.code}</span>
                </div>
                {user?.role === 2 && (
                  <div className="course-actions">
                    <button
                      className="edit-button"
                      onClick={() => handleEditCourse(course.id)}
                      title="Editar curso"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="admin-button"
                      onClick={() => handleOpenAdminModal(course)}
                      title="Criar admin para este curso"
                    >
                      <UserPlus size={16} />
                    </button>
                  </div>
                )}
              </div>

              {course.description && (
                <p className="course-description">{course.description}</p>
              )}

              <div className="course-stats">
                <div className="stat-item">
                  <Users size={16} />
                  <span>{course.users_count} usuários</span>
                </div>
              </div>

              <div className="course-date">
                Criado em: {new Date(course.created_at).toLocaleDateString("pt-BR")}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para criar admin */}
      {showAdminModal && (
        <div className="modal-overlay" onClick={handleCloseAdminModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Criar Admin para {selectedCourse?.name}</h2>
              <button className="close-button" onClick={handleCloseAdminModal}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateAdmin} className="admin-form">
              <div className="form-group">
                <label htmlFor="name">Nome Completo *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={adminForm.name}
                  onChange={handleAdminFormChange}
                  required
                  placeholder="Digite o nome completo"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={adminForm.email}
                  onChange={handleAdminFormChange}
                  required
                  placeholder="Digite o email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Senha *</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={adminForm.password}
                  onChange={handleAdminFormChange}
                  required
                  placeholder="Digite a senha (mínimo 6 caracteres)"
                  minLength={6}
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmar Senha *</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={adminForm.confirmPassword}
                  onChange={handleAdminFormChange}
                  required
                  placeholder="Confirme a senha"
                />
              </div>

              <div className="form-info">
                <p><strong>Curso:</strong> {selectedCourse?.name} ({selectedCourse?.code})</p>
                <p><strong>Permissões:</strong> Admin do curso (pode gerenciar usuários e conteúdo)</p>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={handleCloseAdminModal}
                  className="cancel-button"
                  disabled={creatingAdmin}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="create-button"
                  disabled={creatingAdmin}
                >
                  {creatingAdmin ? "Criando..." : "Criar Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default withAuth(CoursesPage);
