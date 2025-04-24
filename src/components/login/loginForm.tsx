"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/authContext";
import axios from "axios";
import Cookies from "js-cookie";
import { ApiRoutes } from "@/services/constants";
import Link from "next/link";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./loginForm.css";

type LoginFormProps = {
  type: "login" | "register";
};

const LoginForm: React.FC<LoginFormProps> = ({ type }) => {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
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
    try {
      await axios.post(ApiRoutes.USERS, {
        user: {
          name: formData.name,
          email: formData.email,
          password: formData.password,
        },
      });
      toast.success("Cadastro realizado! Redirecionando...");
      router.push("/login");
    } catch (error) {
      toast.error("Erro ao registrar. Tente novamente.");
    }
  };

  return (
    <div className="login-page-container">
      <div className="logo-container">
        <img
          src="https://www.itabirito.mg.leg.br/imagens/insta.png/image"
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
                  <label htmlFor="name">Nome</label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
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
                  <label htmlFor="confirmPassword">Confirme a Senha</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  <button type="submit">Registrar</button>
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
