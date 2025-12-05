import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import api from "../api/api";
import "../styles/Dashboard.css";

export default function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get("/admin/analytics");
        setAnalytics(res.data);
      } catch (err) {
        console.error("Erro ao buscar analytics:", err);
        setError("Falha ao carregar dados. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">Carregando Painel do Vendedor...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="dashboard-container">
        <div className="no-data">Nenhum dado disponível.</div>
      </div>
    );
  }

  const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const chartData = analytics.vendas_por_mes.map(item => ({
    mes: monthNames[item.mes - 1] || item.mes,
    vendas: item.vendas
  }));

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h2>Painel do Vendedor</h2>
        <p>Visão geral das suas vendas e produtos</p>
      </header>

      <div className="cards">
        <div className="card">
          <div className="card-icon">💰</div>
          <h3>Vendas Totais</h3>
          <p className="card-value">{analytics.total_vendas}</p>
        </div>

        <div className="card">
          <div className="card-icon">📦</div>
          <h3>Produtos Cadastrados</h3>
          <p className="card-value">{analytics.total_produtos}</p>
        </div>

        <div className="card">
          <div className="card-icon">👍</div>
          <h3>Curtidas na Semana</h3>
          <p className="card-value">{analytics.curtidas_semana}</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="top-products">
          <h3>Top 3 Produtos Mais Vistos</h3>
          {analytics.produtos_mais_vistos.length > 0 ? (
            <ul className="product-list">
              {analytics.produtos_mais_vistos.map((p, index) => (
                <li key={p.id} className="product-item">
                  <span className="rank">{index + 1}.</span>
                  <span className="title">{p.titulo}</span>
                  <span className="downloads">(Downloads: {p.downloads || 0})</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-products">Nenhum produto cadastrado ainda.</p>
          )}
        </div>

        <div className="chart-container">
          <h3>Vendas por Mês</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="vendas" fill="#00aaff" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="no-chart-data">Nenhum dado de vendas disponível.</p>
          )}
        </div>
      </div>
    </div>
  );
}
