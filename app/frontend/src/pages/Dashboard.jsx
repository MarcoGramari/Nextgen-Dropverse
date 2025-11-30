import React from "react";
import "../styles/Dashboard.css";

export default function Dashboard() {
  return (
    <div className="dashboard-container">
      <h2>Dashboard</h2>

      <div className="cards">
        <div className="card">
          <h3>Visitas</h3>
          <p>1.248</p>
        </div>

        <div className="card">
          <h3>Uploads</h3>
          <p>32</p>
        </div>

        <div className="card">
          <h3>Usuários ativos</h3>
          <p>87</p>
        </div>
      </div>
    </div>
  );
}
