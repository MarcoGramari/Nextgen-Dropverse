import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import ProductCard from "../components/ProductCard";
import "../styles/Home.css";

export default function Home() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [activeFilter, setActiveFilter] = useState("Todos os Posts");
  const [input, setInput] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState({});

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

  const handleLike = async (postId) => {
    try {
      const res = await api.post(`/posts/${postId}/like`);
      const newLikes = res.data.likes ?? (posts.find(p => p.id === postId)?.likes + 1);
      const updatedPosts = posts.map(post => post.id === postId ? { ...post, likes: newLikes } : post);
      setPosts(updatedPosts);
      // Re-apply filter to update filteredPosts
      applyFilter(updatedPosts);
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  const getImageUrl = (filename) => {
    if (!filename) return null;
    const base = api.defaults.baseURL ? api.defaults.baseURL.replace(/\/api\/?$/, "") : "";
    return `${base}/uploads/${filename}`;
  };

  const toggleComments = async (postId) => {
    if (comments[postId]) {
      // Hide comments
      setComments(prev => ({ ...prev, [postId]: null }));
    } else {
      // Fetch comments
      try {
        const res = await api.get(`/posts/${postId}/comments`);
        setComments(prev => ({ ...prev, [postId]: res.data }));
      } catch (err) {
        console.error("Error fetching comments:", err);
      }
    }
  };

  const handleComment = async (postId) => {
    const content = newComment[postId]?.trim();
    if (!content) return;

    try {
      const res = await api.post(`/posts/${postId}/comments`, { conteudo: content });
      const newCommentObj = res.data.comment;
      setComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), newCommentObj]
      }));
      setNewComment(prev => ({ ...prev, [postId]: "" }));
      // Update comment count in posts
      const updatedPosts = posts.map(post =>
        post.id === postId ? { ...post, comments_count: (post.comments_count || 0) + 1 } : post
      );
      setPosts(updatedPosts);
      applyFilter(updatedPosts);
    } catch (err) {
      console.error("Error posting comment:", err);
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    if (!confirm("Tem certeza que deseja deletar este comentário?")) return;

    try {
      await api.delete(`/posts/${postId}/comments/${commentId}`);
      // Refresh comments
      const res = await api.get(`/posts/${postId}/comments`);
      setComments(prev => ({ ...prev, [postId]: res.data }));
      // Update comment count
      const updatedPosts = posts.map(post => post.id === postId ? { ...post, comments_count: Math.max((post.comments_count || 0) - 1, 0) } : post);
      setPosts(updatedPosts);
      applyFilter(updatedPosts);
    } catch (err) {
      console.error("Error deleting comment:", err);
      alert("Erro ao deletar comentário.");
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
      {/* Featured Content */}
      <section className="featured-section">
        <h2>DESTAQUES</h2>
        <div className="featured-grid">
          {posts.slice(0, 3).map((post) => (
            <div key={post.id} className="featured-card">
              <div className="featured-header">
                <Link to={`/profile/${post.author?.username}`}>
                  <img src={getImageUrl(post.author?.avatar)} alt="" className="avatar-small" />
                  <span>@{post.author?.username}</span>
                </Link>
              </div>
              <p className="featured-content">{post.content?.substring(0, 100)}...</p>
              {post.image && (
                <img src={getImageUrl(post.image)} alt="" className="featured-image" />
              )}
              <div className="featured-stats">
                <span>👍 {post.likes ?? 0}</span>
                <span>💬 {post.comments_count ?? 0}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Filters Section */}
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

      {/* Feed */}
      <div className="feed">
        {loading ? (
          <div>Loading posts...</div>
        ) : (
          filteredPosts.map((p) => (
            <div key={p.id} className="post">
              <div className="post-header">
                <Link to={`/profile/${p.author?.username}`}>
                  <img src={getImageUrl(p.author?.avatar)} alt="" className="avatar" />
                  <div>
                    <strong>@{p.author?.username}</strong>
                  </div>
                </Link>
              </div>
              {p.tipo !== "product" && <p className="post-content">{p.content}</p>}
              {p.tipo !== "product" && p.image && (
                <img src={getImageUrl(p.image)} alt="" className="post-image" />
              )}
              {p.tipo === "product" && (
                <div className="post-card">
                  <ProductCard product={p} onBuy={() => handleBuy(p.id)} />
                </div>
              )}
              <div className="post-actions">
                <button onClick={() => handleLike(p.id)}>👍 {p.likes ?? 0}</button>
                <button onClick={() => toggleComments(p.id)}>💬 Comentar ({p.comments_count ?? 0})</button>
              </div>

              {comments[p.id] && (
                <div className="comments-section">
                  {comments[p.id].map(comment => (
                    <div key={comment.id} className="comment">
                      <div>
                        <strong>@{comment.username}</strong>: {comment.conteudo}
                        <small>{new Date(comment.created_at).toLocaleString()}</small>
                      </div>
                      {user && user.id === comment.user_id && (
                        <button onClick={() => handleDeleteComment(p.id, comment.id)} className="delete-comment-btn">🗑️</button>
                      )}
                    </div>
                  ))}
                  <div className="comment-input">
                    <input
                      type="text"
                      placeholder="Escreva um comentário..."
                      value={newComment[p.id] || ""}
                      onChange={(e) => setNewComment(prev => ({ ...prev, [p.id]: e.target.value }))}
                      onKeyPress={(e) => e.key === 'Enter' && handleComment(p.id)}
                    />
                    <button onClick={() => handleComment(p.id)}>Enviar</button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
