import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useAuth } from "../context/AuthContext";
import "../styles/Layout.css";

export default function Layout() {
  const { logout } = useAuth();

  return (
    <div className="layout-container">
      <Sidebar onLogout={logout} />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
