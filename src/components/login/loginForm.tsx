"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/authContext";
import axios from "@/services/axiosConfig";
import Cookies from "js-cookie";
import { ApiRoutes } from "@/services/constants";
import Link from "next/link";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./loginForm.css";

type LoginFormProps = {
  type: "login" | "register";
};

interface Course {
  id: string | number;
  name: string;
  code: string;
  description?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ type }) => {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    course_id: "",
    role: "0", // 0 = student, 1 = teacher
  });
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  // Buscar cursos disponíveis quando o componente for montado (apenas para registro)
  useEffect(() => {
    if (type === "register") {
      fetchCourses();
    }
  }, [type]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await axios.get(ApiRoutes.COURSES);
      
      setCourses(response.data);
    } catch (error) {
      console.error("Erro ao buscar cursos:", error);
      toast.error("Erro ao carregar cursos disponíveis");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(ApiRoutes.LOGIN, {
        email: formData.email,
        password: formData.password,
      });

      const { token, user } = response.data;

      login(user, token); 

      toast.success("Login realizado com sucesso!");
    } catch (error) {
      toast.error("Credenciais inválidas");
    }
  };


  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }
    
    // Validar se o curso foi selecionado
    if (!formData.course_id) {
      toast.error("Por favor, selecione um curso");
      return;
    }
    
    try {
      setLoading(true);
      
      // Converter o índice de volta para o ID real do curso
      const courseIndex = parseInt(formData.course_id);
      const selectedCourse = courses[courseIndex];
      const realCourseId = selectedCourse?.id;
      
      const payload = {
        user: {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          course_id: realCourseId,
          role: parseInt(formData.role),
        },
      };
      
      await axios.post(ApiRoutes.USERS, payload);
      toast.success("Cadastro realizado! Redirecionando...");
      router.push("/login");
    } catch (error: any) {
      console.error("Erro no cadastro:", error);
      const errorMessage = error.response?.data?.errors?.[0] || 
                          error.response?.data?.error || 
                          "Erro ao registrar. Tente novamente.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      <div className="logo-container">
        <img
          src="/logo.png"
          alt="Imagem do logo"
        />
      </div>
      <div className="form-container">
        <div className="login-form-container">
          <div className="login-form">
            {type === "login" ? (
              <>
                <h1>Login</h1>
                <form onSubmit={handleLogin}>
                  <label htmlFor="email">Email</label>
                  <input
                    type="text"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  <label htmlFor="password">Senha</label>
                  <input
                    type="password"
                    id="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button type="submit">Entrar</button>
                </form>
                <Link href="/register">
                  <span>Ainda não possui uma conta? Registre-se</span>
                </Link>
                <span>Esqueceu a senha?</span>
              </>
            ) : (
              <>
                <h1>Registrar</h1>
                <form onSubmit={handleRegister}>
                  <label htmlFor="name">Nome Completo</label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Digite seu nome completo"
                  />
                  
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Digite seu email"
                  />
                  
                  <label htmlFor="role">Tipo de Usuário</label>
                  <select
                    id="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                  >
                    <option value="0">Estudante</option>
                    <option value="1">Professor</option>
                  </select>
                  
                  <label htmlFor="course_id">Curso</label>
                  <select
                    id="course_id"
                    value={formData.course_id}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  >
                    <option value="">Selecione um curso</option>
                    {courses.map((course, index) => (
                      <option key={course.id} value={index.toString()}>
                        {course.code} - {course.name}
                      </option>
                    ))}
                  </select>
                  
                  <label htmlFor="password">Senha</label>
                  <input
                    type="password"
                    id="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Digite uma senha segura"
                    minLength={6}
                  />
                  
                  <label htmlFor="confirmPassword">Confirme a Senha</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="Confirme sua senha"
                  />
                  
                  <button type="submit" disabled={loading}>
                    {loading ? "Registrando..." : "Registrar"}
                  </button>
                  
                  <Link href="/login">
                    <span>Já possui uma conta? Faça Login</span>
                  </Link>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
