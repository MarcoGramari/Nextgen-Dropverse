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
            <FaHome className="icon" /> <span>Início</span>
          </Link>

          <Link to="/dashboard" className="sidebar-btn">
            <FaChartBar className="icon" /> <span>Dashboard</span>
          </Link>

          <Link to="/profile" className="sidebar-btn">
            <FaUser className="icon" /> <span>Perfil</span>
          </Link>

          <Link to="/settings" className="sidebar-btn">
            <FaCog className="icon" /> <span>Configurações</span>
          </Link>
        </nav>

        <button className="logout-btn" onClick={logout}>
          <FaSignOutAlt className="icon" /> <span>Sair</span>
        </button>

        <footer className="sidebar-footer">
          <p>© 2025 Dropverse</p>
        </footer>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}