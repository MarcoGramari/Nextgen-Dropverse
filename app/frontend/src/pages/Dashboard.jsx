import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import api from "../api/api";
import "../styles/Dashboard.css";

export default function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get("/user/dashboard");
        setAnalytics(res.data);
      } catch (err) {
        console.error("Erro ao buscar dashboard:", err);
        setError("Falha ao carregar dados. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
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
  const chartData = analytics.vendas_por_mes ? analytics.vendas_por_mes.map(item => ({
    mes: monthNames[item.mes - 1] || item.mes,
    vendas: item.vendas
  })) : [];

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-text">
            <h1>Dashboard</h1>
            <p>
              {analytics.user_type === "seller" && "Visão geral das suas vendas e produtos"}
              {analytics.user_type === "buyer" && "Visão geral das suas compras e interesses"}
              {analytics.user_type === "general" && "Visão geral da sua atividade"}
            </p>
          </div>
          <div className="header-stats">
            <div className="quick-stat">
              <span className="stat-icon">
                {analytics.user_type === "seller" ? "📈" : analytics.user_type === "buyer" ? "🛒" : "👤"}
              </span>
              <div>
                <div className="stat-value">
                  {analytics.user_type === "seller" ? analytics.total_vendas :
                   analytics.user_type === "buyer" ? analytics.total_purchases :
                   analytics.followers_count}
                </div>
                <div className="stat-label">
                  {analytics.user_type === "seller" ? "Vendas Totais" :
                   analytics.user_type === "buyer" ? "Compras Totais" :
                   "Seguidores"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="metrics-grid">
        {analytics.user_type === "seller" && (
          <>
            <div className="metric-card">
              <div className="metric-header">
                <div className="metric-icon">
                  <span className="icon">💰</span>
                </div>
                <div className="metric-info">
                  <h3>Vendas Totais</h3>
                  <p className="metric-description">Total de vendas realizadas</p>
                </div>
              </div>
              <div className="metric-value">{analytics.total_vendas}</div>
              <div className="metric-trend positive">
                <span className="trend-icon">↗️</span>
                <span>+12.5%</span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <div className="metric-icon">
                  <span className="icon">📦</span>
                </div>
                <div className="metric-info">
                  <h3>Produtos</h3>
                  <p className="metric-description">Produtos cadastrados</p>
                </div>
              </div>
              <div className="metric-value">{analytics.total_produtos}</div>
              <div className="metric-trend neutral">
                <span className="trend-icon">→</span>
                <span>0%</span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <div className="metric-icon">
                  <span className="icon">👍</span>
                </div>
                <div className="metric-info">
                  <h3>Curtidas</h3>
                  <p className="metric-description">Esta semana</p>
                </div>
              </div>
              <div className="metric-value">{analytics.curtidas_semana}</div>
              <div className="metric-trend positive">
                <span className="trend-icon">↗️</span>
                <span>+8.2%</span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <div className="metric-icon">
                  <span className="icon">💰</span>
                </div>
                <div className="metric-info">
                  <h3>Total Ganho</h3>
                  <p className="metric-description">Valor recebido de vendas</p>
                </div>
              </div>
              <div className="metric-value">
                R$ {analytics.total_earned ? analytics.total_earned.toFixed(2) : "0.00"}
              </div>
              <div className="metric-trend positive">
                <span className="trend-icon">↗️</span>
                <span>+10.0%</span>
              </div>
            </div>
          </>
        )}

        {analytics.user_type === "buyer" && (
          <>
            <div className="metric-card">
              <div className="metric-header">
                <div className="metric-icon">
                  <span className="icon">🛒</span>
                </div>
                <div className="metric-info">
                  <h3>Compras Totais</h3>
                  <p className="metric-description">Produtos adquiridos</p>
                </div>
              </div>
              <div className="metric-value">{analytics.total_purchases}</div>
              <div className="metric-trend positive">
                <span className="trend-icon">↗️</span>
                <span>+5.0%</span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <div className="metric-icon">
                  <span className="icon">❤️</span>
                </div>
                <div className="metric-info">
                  <h3>Produtos Curtidos</h3>
                  <p className="metric-description">Seus favoritos</p>
                </div>
              </div>
              <div className="metric-value">{analytics.liked_products ? analytics.liked_products.length : 0}</div>
              <div className="metric-trend neutral">
                <span className="trend-icon">→</span>
                <span>0%</span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <div className="metric-icon">
                  <span className="icon">💰</span>
                </div>
                <div className="metric-info">
                  <h3>Total Ganho</h3>
                  <p className="metric-description">Valor recebido de vendas</p>
                </div>
              </div>
              <div className="metric-value">
                R$ {analytics.total_earned ? analytics.total_earned.toFixed(2) : "0.00"}
              </div>
              <div className="metric-trend positive">
                <span className="trend-icon">↗️</span>
                <span>+10.0%</span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <div className="metric-icon">
                  <span className="icon">👍</span>
                </div>
                <div className="metric-info">
                  <h3>Curtidas Recebidas</h3>
                  <p className="metric-description">Curtidas em seus posts/produtos</p>
                </div>
              </div>
              <div className="metric-value">{analytics.likes_received || 0}</div>
              <div className="metric-trend positive">
                <span className="trend-icon">↗️</span>
                <span>+8.2%</span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <div className="metric-icon">
                  <span className="icon">📅</span>
                </div>
                <div className="metric-info">
                  <h3>Última Compra</h3>
                  <p className="metric-description">Dias desde a última</p>
                </div>
              </div>
              <div className="metric-value">
                {analytics.recent_purchases && analytics.recent_purchases.length > 0
                  ? Math.floor((new Date() - new Date(analytics.recent_purchases[0].created_at)) / (1000 * 60 * 60 * 24))
                  : "Nunca"}
              </div>
              <div className="metric-trend neutral">
                <span className="trend-icon">→</span>
                <span>Dias</span>
              </div>
            </div>
          </>
        )}

        {analytics.user_type === "general" && (
          <>
            <div className="metric-card">
              <div className="metric-header">
                <div className="metric-icon">
                  <span className="icon">👥</span>
                </div>
                <div className="metric-info">
                  <h3>Seguidores</h3>
                  <p className="metric-description">Pessoas que te seguem</p>
                </div>
              </div>
              <div className="metric-value">{analytics.followers_count}</div>
              <div className="metric-trend positive">
                <span className="trend-icon">↗️</span>
                <span>+2.1%</span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <div className="metric-icon">
                  <span className="icon">📝</span>
                </div>
                <div className="metric-info">
                  <h3>Posts</h3>
                  <p className="metric-description">Publicações criadas</p>
                </div>
              </div>
              <div className="metric-value">{analytics.posts_count}</div>
              <div className="metric-trend positive">
                <span className="trend-icon">↗️</span>
                <span>+15.0%</span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <div className="metric-icon">
                  <span className="icon">🏆</span>
                </div>
                <div className="metric-info">
                  <h3>Badges</h3>
                  <p className="metric-description">Conquistas desbloqueadas</p>
                </div>
              </div>
              <div className="metric-value">{analytics.badges ? analytics.badges.length : 0}</div>
              <div className="metric-trend positive">
                <span className="trend-icon">↗️</span>
                <span>+1</span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <div className="metric-icon">
                  <span className="icon">❤️</span>
                </div>
                <div className="metric-info">
                  <h3>Atividade</h3>
                  <p className="metric-description">Interações recentes</p>
                </div>
              </div>
              <div className="metric-value">{analytics.recent_activity ? analytics.recent_activity.length : 0}</div>
              <div className="metric-trend positive">
                <span className="trend-icon">↗️</span>
                <span>+25.0%</span>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="dashboard-content">
        <div className="content-grid">
          {analytics.user_type === "seller" && (
            <>
              {/* Sessão de Análises */}
              <div className="analytics-section">
                <div className="section-header">
                  <h2>Analytics</h2>
                  <p>Performance dos últimos 12 meses</p>
                </div>

                <div className="chart-card">
                  <div className="chart-header">
                    <h3>Vendas por Mês</h3>
                    <span className="chart-period">Últimos 12 meses</span>
                  </div>
                  <div className="chart-wrapper">
                    {analytics.vendas_por_mes && analytics.vendas_por_mes.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analytics.vendas_por_mes.map(item => ({
                          mes: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"][item.mes - 1] || item.mes,
                          vendas: item.vendas
                        }))} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis
                            dataKey="mes"
                            stroke="#9ca3af"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis
                            stroke="#9ca3af"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#1a1a1a',
                              border: '1px solid #374151',
                              borderRadius: '8px',
                              color: '#ffffff'
                            }}
                          />
                          <Bar
                            dataKey="vendas"
                            fill="#6366f1"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="empty-chart">
                        <div className="empty-icon">📊</div>
                        <p>Nenhum dado de vendas disponível</p>
                        <span>Comece a vender para ver suas estatísticas</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Visão geral */}
              <div className="insights-section">
                <div className="top-products-card">
                  <div className="card-header">
                    <h3>Top Produtos</h3>
                    <p className="card-subtitle">Mais visualizados</p>
                  </div>
                  <div className="products-list">
                    {analytics.produtos_mais_vistos && analytics.produtos_mais_vistos.length > 0 ? (
                      analytics.produtos_mais_vistos.slice(0, 5).map((product, index) => (
                        <div key={product.id} className="product-rank-item">
                          <div className="rank-badge">{index + 1}</div>
                          <div className="product-info">
                            <h4 className="product-title">{product.titulo}</h4>
                            <div className="product-stats">
                              <div className="product-trend">+12%</div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="empty-products">
                        <div className="empty-icon">📦</div>
                        <h4>Nenhum produto ainda</h4>
                        <p>Adicione seus primeiros produtos para começar a acompanhar as estatísticas</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="recent-activity-card">
                  <div className="card-header">
                    <h3>Atividade Recente</h3>
                    <p className="card-subtitle">Últimas ações</p>
                  </div>
                  <div className="activity-list">
                    <div className="activity-item">
                      <div className="activity-icon">💰</div>
                      <div className="activity-content">
                        <p className="activity-text">Nova venda realizada</p>
                        <span className="activity-time">2 horas atrás</span>
                      </div>
                    </div>
                    <div className="activity-item">
                      <div className="activity-icon">📦</div>
                      <div className="activity-content">
                        <p className="activity-text">Produto adicionado ao catálogo</p>
                        <span className="activity-time">1 dia atrás</span>
                      </div>
                    </div>
                    <div className="activity-item">
                      <div className="activity-icon">👍</div>
                      <div className="activity-content">
                        <p className="activity-text">Novo like recebido</p>
                        <span className="activity-time">3 dias atrás</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="sales-history-card">
                  <div className="card-header">
                    <h3>Histórico de Vendas</h3>
                    <p className="card-subtitle">Produtos vendidos recentemente</p>
                  </div>
                  <div className="sales-list">
                    {analytics.sales_history && analytics.sales_history.length > 0 ? (
                      analytics.sales_history.map((sale, index) => (
                        <div key={index} className="sale-item">
                          <div className="sale-info">
                            <h4 className="product-title">{sale.produto_titulo}</h4>
                            <div className="sale-details">
                              <span className="buyer-name">Comprado por: {sale.comprador_nome} (@{sale.comprador_username})</span>
                              <span className="sale-price">R$ {sale.price_paid.toFixed(2)}</span>
                              <span className="sale-date">{new Date(sale.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="empty-sales">
                        <div className="empty-icon">💰</div>
                        <h4>Nenhuma venda ainda</h4>
                        <p>Quando seus produtos forem comprados, aparecerão aqui</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {analytics.user_type === "buyer" && (
            <>
              {/* Produtos comprados */}
              <div className="analytics-section">
                <div className="section-header">
                  <h2>Compras Recentes</h2>
                  <p>Seus últimos produtos adquiridos</p>
                </div>

                <div className="chart-card">
                  <div className="products-list">
                    {analytics.recent_purchases && analytics.recent_purchases.length > 0 ? (
                      analytics.recent_purchases.map((purchase, index) => (
                        <div key={index} className="product-rank-item">
                          <div className="rank-badge">{index + 1}</div>
                          <div className="product-info">
                            <h4 className="product-title">{purchase.titulo}</h4>
                            <div className="product-stats">
                              <div className="stat-item">
                                <span className="stat-icon">💰</span>
                                <span>R$ {purchase.price_paid.toFixed(2)}</span>
                              </div>
                              <div className="product-trend">
                                {new Date(purchase.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="empty-products">
                        <div className="empty-icon">🛒</div>
                        <h4>Nenhuma compra ainda</h4>
                        <p>Faça sua primeira compra para ver o histórico aqui</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Ganhos */}
              <div className="analytics-section">
                <div className="section-header">
                  <h2>Ganhos por Mês</h2>
                  <p>Seus ganhos de vendas nos últimos 12 meses</p>
                </div>

                <div className="chart-card">
                  <div className="chart-wrapper">
                    {analytics.earnings_por_mes && analytics.earnings_por_mes.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analytics.earnings_por_mes.map(item => ({
                          mes: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"][item.mes - 1] || item.mes,
                          ganho: item.ganho
                        }))} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis
                            dataKey="mes"
                            stroke="#9ca3af"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis
                            stroke="#9ca3af"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `R$ ${value.toFixed(0)}`}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#1a1a1a',
                              border: '1px solid #374151',
                              borderRadius: '8px',
                              color: '#ffffff'
                            }}
                            formatter={(value) => [`R$ ${value.toFixed(2)}`, 'Ganho']}
                          />
                          <Bar
                            dataKey="ganho"
                            fill="#10b981"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="empty-chart">
                        <div className="empty-icon">📊</div>
                        <p>Nenhum dado de ganhos disponível</p>
                        <span>Venda produtos para ver suas estatísticas</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Produtos linkados */}
              <div className="insights-section">
                <div className="top-products-card">
                  <div className="card-header">
                    <h3>Curtidas Recebidas</h3>
                    <p className="card-subtitle">Curtidas em seus posts/produtos</p>
                  </div>
                  <div className="products-list">
                    <div className="product-rank-item">
                      <div className="rank-badge">👍</div>
                      <div className="product-info">
                        <h4 className="product-title">Total de Curtidas Recebidas</h4>
                        <div className="product-stats">
                          <div className="stat-item">
                            <span className="stat-icon">❤️</span>
                            <span>{analytics.likes_received || 0} curtidas</span>
                          </div>
                          <div className="product-trend">
                            Continue criando conteúdo para receber mais curtidas!
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="recent-activity-card">
                  <div className="card-header">
                    <h3>Atividade de Compra</h3>
                    <p className="card-subtitle">Seu histórico real</p>
                  </div>
                  <div className="activity-list">
                    {analytics.purchase_activities && analytics.purchase_activities.length > 0 ? (
                      analytics.purchase_activities.map((activity, index) => (
                        <div key={index} className="activity-item">
                          <div className="activity-icon">
                            {activity.type === "purchase" ? "🛒" : "❤️"}
                          </div>
                          <div className="activity-content">
                            <p className="activity-text">
                              {activity.type === "purchase"
                                ? `Comprou "${activity.titulo}" por R$ ${activity.price_paid.toFixed(2)}`
                                : `Curtiu "${activity.titulo}"`
                              }
                            </p>
                            <span className="activity-time">
                              {new Date(activity.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="activity-item">
                        <div className="activity-icon">👤</div>
                        <div className="activity-content">
                          <p className="activity-text">Bem-vindo! Comece a comprar e curtir produtos</p>
                          <span className="activity-time">Agora</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {analytics.user_type === "general" && (
            <>
              {/* Visão geral do perfil */}
              <div className="analytics-section">
                <div className="section-header">
                  <h2>Seu Perfil</h2>
                  <p>Visão geral da sua presença na plataforma</p>
                </div>

                <div className="chart-card">
                  <div className="profile-overview">
                    <div className="profile-stat">
                      <div className="stat-icon">👤</div>
                      <div className="stat-content">
                        <h4>{analytics.user.nome}</h4>
                        <p>@{analytics.user.username}</p>
                      </div>
                    </div>
                    <div className="profile-stats-grid">
                      <div className="stat-item">
                        <span className="stat-number">{analytics.followers_count}</span>
                        <span className="stat-label">Seguidores</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-number">{analytics.following_count}</span>
                        <span className="stat-label">Seguindo</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-number">{analytics.posts_count}</span>
                        <span className="stat-label">Posts</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-number">{analytics.badges.length}</span>
                        <span className="stat-label">Badges</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Atividade geral do perfil */}
              <div className="insights-section">
                <div className="top-products-card">
                  <div className="card-header">
                    <h3>Seus Badges</h3>
                    <p className="card-subtitle">Conquistas desbloqueadas</p>
                  </div>
                  <div className="products-list">
                    {analytics.badges && analytics.badges.length > 0 ? (
                      analytics.badges.map((badge, index) => (
                        <div key={badge.id} className="product-rank-item">
                          <div className="rank-badge">🏆</div>
                          <div className="product-info">
                            <h4 className="product-title">{badge.nome}</h4>
                            <div className="product-stats">
                              <div className="stat-item">
                                <span className="stat-icon">📜</span>
                                <span>{badge.descricao}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="empty-products">
                        <div className="empty-icon">🏆</div>
                        <h4>Nenhum badge ainda</h4>
                        <p>Continue interagindo para desbloquear conquistas</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="recent-activity-card">
                  <div className="card-header">
                    <h3>Atividade Recente</h3>
                    <p className="card-subtitle">Suas últimas ações</p>
                  </div>
                  <div className="activity-list">
                    {analytics.recent_activity && analytics.recent_activity.length > 0 ? (
                      analytics.recent_activity.map((activity, index) => (
                        <div key={index} className="activity-item">
                          <div className="activity-icon">
                            {activity.type === "like" ? "❤️" : "📝"}
                          </div>
                          <div className="activity-content">
                            <p className="activity-text">{activity.post_title}</p>
                            <span className="activity-time">
                              {new Date(activity.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="activity-item">
                        <div className="activity-icon">👤</div>
                        <div className="activity-content">
                          <p className="activity-text">Bem-vindo à plataforma!</p>
                          <span className="activity-time">Agora</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
