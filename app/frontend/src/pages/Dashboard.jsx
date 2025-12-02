import React, { useState, useEffect } from "react";
import api from "../api/api";
import "../styles/Dashboard.css";

export default function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/analytics")
      .then(res => {
        setAnalytics(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erro ao buscar analytics:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="dashboard-container">Carregando Painel do Vendedor...</div>;
  }

  if (!analytics) {
    return <div className="dashboard-container">Erro ao carregar dados de análise.</div>;
  }

  return (
    <div className="dashboard-container">
      <h2>Painel do Vendedor</h2>

      <div className="cards">
        <div className="card">
          <h3>Vendas Totais</h3>
          <p>{analytics.total_vendas}</p>
        </div>

        <div className="card">
          <h3>Produtos Cadastrados</h3>
          <p>{analytics.total_produtos}</p>
        </div>

        <div className="card">
          <h3>Curtidas na Semana</h3>
          <p>{analytics.curtidas_semana}</p>
        </div>
      </div>

      <div className="top-products">
        <h3>Top 3 Produtos Mais Vistos</h3>
        {analytics.produtos_mais_vistos.length > 0 ? (
          <ul>
            {analytics.produtos_mais_vistos.map((p, index) => (
              <li key={p.id}>
                {index + 1}. {p.titulo} (Downloads: {p.downloads || 0})
              </li>
            ))}
          </ul>
        ) : (
          <p>Nenhum produto cadastrado ainda.</p>
        )}
      </div>
    </div>
  );
}
