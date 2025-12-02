import React from "react";
import Sidebar from "./Sidebar";
import "../styles/Layout.css";

/*
  Layout usado nas rotas privadas.
  Conteúdo das páginas será renderizado dentro de <main>.
*/

export default function Layout({ children }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            {/* opcional: breadcrumbs / page title */}
          </div>
          <div className="topbar-right">
            {/* avatar / notificações */}
            <div className="avatar">👨‍🚀</div>
          </div>
        </header>

        <main className="content-area">
          {children}
        </main>

        <footer className="site-footer">
          Desenvolvido por Gramari — Dropverse © {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  );
}
