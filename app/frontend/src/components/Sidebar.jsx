import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { FaHome, FaChartBar, FaUser, FaCog, FaSignOutAlt, FaPlus } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import CreatePostPopup from "./CreatePostPopup";

/* Sidebar lateral com ícones - substitui topbar */
export default function Sidebar() {
  const { logout } = useAuth();
  const [showCreatePost, setShowCreatePost] = useState(false);

  const items = [
    { to: "/home", label: "Home", icon: <FaHome /> },
    { to: "/dashboard", label: "Dashboard", icon: <FaChartBar /> },
    { to: "/profile", label: "Perfil", icon: <FaUser /> },
    { to: "/settings", label: "Configurações", icon: <FaCog /> }
  ];

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-brand">Dropverse</div>
        <nav className="sidebar-nav">
          {items.map(i => (
            <NavLink key={i.to} to={i.to} className="sidebar-link">
              <span className="icon">{i.icon}</span>
              <span className="label">{i.label}</span>
            </NavLink>
          ))}
        </nav>

        <button className="create-post-btn" onClick={() => setShowCreatePost(true)}>
          <FaPlus className="icon" /> <span>Criar Post</span>
        </button>

        <button className="logout-btn" onClick={logout}>
          <FaSignOutAlt className="icon" /> <span>Sair</span>
        </button>

        <footer className="sidebar-footer">
          <p>© 2025 Dropverse</p>
        </footer>
      </aside>

      {showCreatePost && <CreatePostPopup onClose={() => setShowCreatePost(false)} />}
    </>
  );
}
