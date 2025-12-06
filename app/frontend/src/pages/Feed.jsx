// pages/Feed.jsx
import { useState, useEffect } from "react";
import api from "../api/api";
import "../styles/Feed.css";

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState({});

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await api.get("/posts");
        setPosts(res.data);
      } catch (err) {
        console.error("Error fetching posts:", err);
      }
    };
    fetchPosts();
  }, []);

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
      setPosts(posts.map(post => post.id === postId ? { ...post, likes: newLikes } : post));
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  const getImageUrl = (filename) => {
    if (!filename) return null;
    const base = api.defaults.baseURL ? api.defaults.baseURL.replace(/\/api\/?$/, "") : "";
    return `${base}/uploads/${filename}`;
  };

  return (
    <div className="feed-container">
      <h1>Feed</h1>

      {posts.map(post => (
        <div key={post.id} className="feed-post">
          <div className="post-header">
            <img src={getImageUrl(post.author?.avatar)} alt="" className="avatar" />
            <div>
              <strong>@{post.author?.username}</strong>
              <p className="post-date">{new Date(post.created_at).toLocaleString()}</p>
            </div>
          </div>

          {post.tipo === "social" && (
            <>
              <p className="post-content">{post.content}</p>
              {post.image && (
                <img src={getImageUrl(post.image)} alt="" className="post-image" />
              )}
            </>
          )}

          {post.tipo === "product" && (
            <div className="product-post">
              <h3>{post.titulo}</h3>
              <p>{post.descricao}</p>
              <p><strong>Preço:</strong> R$ {post.preco}</p>
              <p><strong>Categoria:</strong> {post.categoria}</p>
              {post.image && (
                <img src={getImageUrl(post.image)} alt="" className="post-image" />
              )}
              {post.content && <p className="post-content">{post.content}</p>}
              <button onClick={() => handleBuy(post.id)}>Comprar</button>
            </div>
          )}

          <div className="post-actions">
            <button onClick={() => handleLike(post.id)}>👍 {post.likes ?? 0}</button>
            <button onClick={() => toggleComments(post.id)}>💬 Comentar ({post.comments_count ?? 0})</button>
          </div>

          {comments[post.id] && (
            <div className="comments-section">
              {comments[post.id].map(comment => (
                <div key={comment.id} className="comment">
                  <strong>@{comment.username}</strong>: {comment.conteudo}
                  <small>{new Date(comment.created_at).toLocaleString()}</small>
                </div>
              ))}
              <div className="comment-input">
                <input
                  type="text"
                  placeholder="Escreva um comentário..."
                  value={newComment[post.id] || ""}
                  onChange={(e) => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                  onKeyPress={(e) => e.key === 'Enter' && handleComment(post.id)}
                />
                <button onClick={() => handleComment(post.id)}>Enviar</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
