"use client";
import { useState } from "react";
import { Menu as MenuIcon, X, ChevronDown, ChevronUp } from "lucide-react";  
import Link from "next/link";
import {  useAuth } from "@/context/authContext"; '@/context/authContext';
import { toast } from "react-toastify";
import "./menu.css";

const Menu = () => {
    const { logout, user } = useAuth(); 
    const [isOpen, setIsOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false); 

    const handleLogout = () => {
        logout();
        toast.success("Até a próxima!");
    };

    return (
        <>
            {isOpen && <div className="overlay" onClick={() => setIsOpen(false)}></div>}

            <nav className="navbar">
                <button className="menu-toggle" onClick={() => setIsOpen(true)}>
                    <MenuIcon size={24} />
                </button>
                
                <ul className="menu-horizontal">
                    <li className="user-info" onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}>
                    <img src="https://www.whiskas.com.br/sites/g/files/fnmzdf2156/files/2024-08/idade-dos-gatos-01.jpg" alt="Usuário" className="user-avatar" />
                        <p>{user?.name || ''}</p>
                        {isUserMenuOpen ? (
                            <ChevronUp size={20}/>
                        ) : (
                            <ChevronDown size={20}/>
                        )}
                        {isUserMenuOpen && (
                            <div className="user-actions">
                                <button onClick={() => alert("Abrir perfil")}>Perfil</button>
                                <button className="exit" onClick={handleLogout}>Sair</button>
                            </div>
                        )}
                    </li>
                </ul>
            </nav>

            <div className={`menu-sidebar ${isOpen ? "open" : "closed"}`}>
                <button className="menu-close" onClick={() => setIsOpen(false)}>
                    <X size={24} />
                </button>

                <ul>
                    <li><Link href="/">Home</Link></li>
                    <li><Link href="/groups">Grupos</Link></li>
                    <li><a href="/simulations">Simulados</a></li>
                    <li><a href="#">Contato</a></li>
                </ul>
            </div>
        </>
    );
};

export default Menu;
