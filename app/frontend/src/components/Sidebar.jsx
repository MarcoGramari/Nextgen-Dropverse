import React from "react";
import { NavLink } from "react-router-dom";
import { FaHome, FaChartBar, FaUser, FaUpload, FaCog } from "react-icons/fa";

/* Sidebar lateral com ícones - substitui topbar */
export default function Sidebar() {
  const items = [
    { to: "/home", label: "Home", icon: <FaHome /> },
    { to: "/dashboard", label: "Dashboard", icon: <FaChartBar /> },
    { to: "/profile", label: "Perfil", icon: <FaUser /> },
    { to: "/upload", label: "Upload", icon: <FaUpload /> },
    { to: "/settings", label: "Configurações", icon: <FaCog /> }
  ];

  return (
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
    </aside>
  );
}
