import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../api/api";
import ProductCard from "../components/ProductCard";
import "../styles/SearchResults.css";

const getImageUrl = (filename) => {
  if (!filename) return null;
  const base = api.defaults.baseURL ? api.defaults.baseURL.replace(/\/api\/?$/, "") : "";
  return `${base}/uploads/${filename}`;
};

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const q = searchParams.get("q") || "";
  const [results, setResults] = useState({ produtos: [], usuarios: [], posts: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (q.trim()) {
      fetchResults();
    } else {
      setLoading(false);
    }
  }, [q]);

  const fetchResults = async () => {
    try {
      const res = await api.get(`/search?q=${encodeURIComponent(q)}`);
      setResults(res.data);
    } catch (err) {
      console.error("Error fetching search results:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async (productId) => {
    try {
      await api.post(`/produtos/purchase/${productId}`);
      alert("Compra realizada com sucesso!");
    } catch (err) {
      console.error("Error buying product:", err);
      alert("Erro ao comprar produto.");
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="search-results-container">
      <h1>Search Results for "{q}"</h1>

      {/* Users Section */}
      <section className="results-section">
        <h2>Profiles</h2>
        {results.usuarios.length === 0 ? (
          <p>No profiles found.</p>
        ) : (
          <div className="profiles-grid">
            {results.usuarios.map((user) => (
              <div
                key={user.id}
                className="profile-banner"
                onClick={() => navigate(`/profile/${user.username}`)}
              >
                <img
                  src={getImageUrl(user.avatar) || "https://via.placeholder.com/80"}
                  alt="avatar"
                  className="profile-avatar"
                />
                <div className="profile-info">
                  <h3 className="profile-username">@{user.username}</h3>
                  <p className="profile-bio">{user.bio || "No bio yet."}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Products Section */}
      <section className="results-section">
        <h2>Products</h2>
        {results.produtos.length === 0 ? (
          <p>No products found.</p>
        ) : (
          <div className="products-list">
            {results.produtos.map((produto) => (
              <div key={produto.id} className="post-card">
                <ProductCard product={produto} onBuy={() => handleBuy(produto.id)} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Posts Section */}
      <section className="results-section">
        <h2>Posts</h2>
        {results.posts.length === 0 ? (
          <p>No posts found.</p>
        ) : (
          <div className="posts-list">
            {results.posts.map((post) => (
              <div key={post.id} className="post-item">
                <p>{post.content}</p>
                <span>{new Date(post.created_at).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
