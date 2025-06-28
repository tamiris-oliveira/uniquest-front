"use client";
import { useState } from "react";
import { Menu as MenuIcon, X, ChevronDown, ChevronUp } from "lucide-react";  
import Link from "next/link";
import { useAuth } from "@/context/authContext";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import "./menu.css";

const Menu = () => {
    const { logout, user } = useAuth(); 
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false); 

    const handleLogout = () => {
        logout();
        toast.success("Até a próxima!");
    };

    const closeMenu = () => {
        setIsOpen(false);
    };

    return (
        <>
            {isOpen && <div className="overlay" onClick={closeMenu}></div>}

            <nav className="navbar">
                <button className="menu-toggle" onClick={() => setIsOpen(true)}>
                    <MenuIcon size={24} />
                </button>
                
                <ul className="menu-horizontal">
                    <li className="user-info" onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}>
                        <img src={user?.avatar} alt="Usuário" className="user-avatar" />
                        <p>{user?.name || ''}</p>
                        {isUserMenuOpen ? (
                            <ChevronUp size={20} />
                        ) : (
                            <ChevronDown size={20} />
                        )}
                        {isUserMenuOpen && (
                            <div className="user-actions">
                                <button onClick={() => router.push("/profile")}>Perfil</button>
                                <button className="exit" onClick={handleLogout}>Sair</button>
                            </div>
                        )}
                    </li>
                </ul>
            </nav>

            <div className={`menu-sidebar ${isOpen ? "open" : "closed"}`}>
                <button className="menu-close" onClick={closeMenu}>
                    <X size={24} />
                </button>

                <ul>
                    <li><Link href="/" onClick={closeMenu}>Home</Link></li>
                    <li><Link href="/groups" onClick={closeMenu}>Grupos</Link></li>
                    <li><Link href="/simulations" onClick={closeMenu}>Simulados</Link></li>
                    <li><Link href="/questions" onClick={closeMenu}>Questões</Link></li>
                    <li><Link href="/contact" onClick={closeMenu}>Contato</Link></li>
                </ul>
            </div>
        </>
    );
};

export default Menu;
