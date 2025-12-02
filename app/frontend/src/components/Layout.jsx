import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FaHome,
  FaUser,
  FaCog,
  FaChartBar,
  FaSignOutAlt,
} from "react-icons/fa";
import "../styles/Layout.css";

export default function Layout() {
  const { logout } = useAuth();

  return (
    <div className="layout-container">
      <aside className="sidebar">

        <h1 className="sidebar-title">DROPVERSE</h1>

        <nav className="sidebar-nav">
          <Link to="/home" className="sidebar-btn">
            <FaHome /> Início
          </Link>

          <Link to="/dashboard" className="sidebar-btn">
            <FaChartBar /> Dashboard
          </Link>

          <Link to="/profile" className="sidebar-btn">
            <FaUser /> Perfil
          </Link>

          <Link to="/settings" className="sidebar-btn">
            <FaCog /> Configurações
          </Link>
        </nav>

        <button className="logout-btn" onClick={logout}>
          <FaSignOutAlt /> Sair
        </button>

        <footer className="sidebar-footer">
          © 2025 <span>Dropverse</span> — Desenvolvido por Gramari
        </footer>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
