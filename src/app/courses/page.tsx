"use client";
import React, { useState, useEffect, useCallback } from "react";
import withAuth from "@/context/withAuth";
import axios from "@/services/axiosConfig";
import { useAuth } from "@/context/authContext";
import { Edit, Users, BookOpen } from "lucide-react";
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
                  <button
                    className="edit-button"
                    onClick={() => handleEditCourse(course.id)}
                    title="Editar curso"
                  >
                    <Edit size={16} />
                  </button>
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
    </div>
  );
};

export default withAuth(CoursesPage);
