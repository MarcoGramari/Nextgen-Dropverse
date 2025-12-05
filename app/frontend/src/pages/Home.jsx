import React, { useState, useEffect } from "react";
import api from "../api/api";
import "../styles/Home.css";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [activeFilter, setActiveFilter] = useState("Todos os Posts");
  const [input, setInput] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [posts, activeFilter]);

  const fetchPosts = async () => {
    try {
      const res = await api.get("/posts");
      setPosts(res.data);
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    let filtered = [...posts];

    switch (activeFilter) {
      case "Todos os Posts":
        // Show all posts as-is
        break;
      case "Seguindo":
        // For now, show all posts (would need following logic)
        break;
      case "Trending":
        // Sort by likes (most liked first)
        filtered.sort((a, b) => b.likes - a.likes);
        break;
      case "Recentes":
        // Sort by creation date (most recent first)
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      default:
        break;
    }

    setFilteredPosts(filtered);
  };

  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
  };

  const handleBuy = async (postId) => {
    try {
      await api.post(`/produtos/purchase/${postId}`);
      alert("Compra realizada com sucesso!");
    } catch (err) {
      console.error("Error buying product:", err);
      alert("Erro ao comprar produto.");
    }
  };

  const publish = async () => {
    if (!input.trim()) return;

    try {
      let imageUrl = null;
      if (image) {
        const formData = new FormData();
        formData.append("file", image);
        const uploadRes = await api.post("/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        imageUrl = uploadRes.data.filename;
      }

      const postData = {
        conteudo: input,
        imagem: imageUrl,
      };

      const res = await api.post("/posts", postData);
      setPosts([res.data.post, ...posts]);
      setInput("");
      setImage(null);
    } catch (err) {
      console.error("Error creating post:", err);
      alert("Failed to create post. Please try again.");
    }
  };

  return (
    <div className="home-container">
      <div className="filters-section">
        <button
          className={`filter-btn ${activeFilter === "Todos os Posts" ? "active" : ""}`}
          onClick={() => handleFilterClick("Todos os Posts")}
        >
          Todos os Posts
        </button>
        <button
          className={`filter-btn ${activeFilter === "Seguindo" ? "active" : ""}`}
          onClick={() => handleFilterClick("Seguindo")}
        >
          Seguindo
        </button>
        <button
          className={`filter-btn ${activeFilter === "Trending" ? "active" : ""}`}
          onClick={() => handleFilterClick("Trending")}
        >
          Trending
        </button>
        <button
          className={`filter-btn ${activeFilter === "Recentes" ? "active" : ""}`}
          onClick={() => handleFilterClick("Recentes")}
        >
          Recentes
        </button>
      </div>

      <div className="feed">
        {loading ? (
          <div>Loading posts...</div>
        ) : (
          filteredPosts.map((p) => (
            <div key={p.id} className="post">
              <div className="post-header">
                <img src={p.author.avatar} alt="" className="avatar" />
                <div>
                  <strong>@{p.author.username}</strong>
                  <p>{p.author.name}</p>
                </div>
              </div>
              <p className="post-content">{p.content}</p>
              {p.image && (
                <img src={p.image} alt="" className="post-image" />
              )}
              <div className="post-actions">
                <button>👍 {p.likes}</button>
                <button>💬 Comentar</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
