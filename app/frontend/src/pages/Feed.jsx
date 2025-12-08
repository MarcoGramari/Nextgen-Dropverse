// pages/Feed.jsx
import { useState, useEffect } from "react";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import "../styles/Feed.css";

export default function Feed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostImage, setNewPostImage] = useState(null);
  const [isPosting, setIsPosting] = useState(false);

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

  const toggleComments = async (postId) => {
    if (comments[postId]) {
      setComments(prev => ({ ...prev, [postId]: undefined }));
    } else {
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
      await api.post(`/posts/${postId}/comments`, { conteudo: content });
      setNewComment(prev => ({ ...prev, [postId]: "" }));
      // Refresh comments
      const res = await api.get(`/posts/${postId}/comments`);
      setComments(prev => ({ ...prev, [postId]: res.data }));
      // Update comment count
      setPosts(posts.map(post => post.id === postId ? { ...post, comments_count: (post.comments_count || 0) + 1 } : post));
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
      setPosts(posts.map(post => post.id === postId ? { ...post, comments_count: Math.max((post.comments_count || 0) - 1, 0) } : post));
    } catch (err) {
      console.error("Error deleting comment:", err);
      alert("Erro ao deletar comentário.");
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;

    setIsPosting(true);
    try {
      let imageUrl = null;
      if (newPostImage) {
        const formData = new FormData();
        formData.append("file", newPostImage);
        const uploadRes = await api.post("/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        imageUrl = uploadRes.data.filename;
      }

      const postData = {
        conteudo: newPostContent,
        imagem: imageUrl,
      };

      const res = await api.post("/posts", postData);
      setPosts([res.data.post, ...posts]);
      setNewPostContent("");
      setNewPostImage(null);
    } catch (err) {
      console.error("Error creating post:", err);
      alert("Failed to create post. Please try again.");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="feed-container">
      {/* Create Post Section */}
      <div className="create-post-section">
        <div className="create-post-card">
          <div className="create-post-header">
            <img src={getImageUrl(user?.avatar)} alt="" className="avatar-small" />
            <span>O que está acontecendo?</span>
          </div>
          <textarea
            className="create-post-input"
            placeholder="Compartilhe suas ideias..."
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            rows="3"
          />
          <div className="create-post-actions">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setNewPostImage(e.target.files[0])}
              style={{ display: 'none' }}
              id="image-upload"
            />
            <label htmlFor="image-upload" className="image-upload-btn">
              📷 Foto
            </label>
            <button
              className="post-btn"
              onClick={handleCreatePost}
              disabled={!newPostContent.trim() || isPosting}
            >
              {isPosting ? "Postando..." : "Postar"}
            </button>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="timeline">
        {posts.length === 0 ? (
          <div className="empty-feed">
            <div className="empty-icon">📱</div>
            <h3>Nenhum post ainda</h3>
            <p>Seja o primeiro a compartilhar algo incrível!</p>
          </div>
        ) : (
          posts.map(post => (
            <div key={post.id} className="feed-post">
              <div className="post-header">
                <img src={getImageUrl(post.author?.avatar)} alt="" className="avatar" />
                <div className="user-info">
                  <div className="user-details">
                    <strong className="username">@{post.author?.username}</strong>
                    <span className="post-date">{new Date(post.created_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="post-body">
                {post.tipo === "social" && (
                  <>
                    <p className="post-content">{post.content}</p>
                    {post.image && (
                      <div className="post-media">
                        <img src={getImageUrl(post.image)} alt="" className="post-image" />
                      </div>
                    )}
                  </>
                )}

                {post.tipo === "product" && (
                  <div className="product-post">
                    <div className="product-header">
                      <h4 className="product-title">{post.titulo}</h4>
                      <span className="product-category">{post.categoria}</span>
                    </div>
                    <p className="product-description">{post.descricao}</p>
                    <div className="product-price-section">
                      <span className="product-price">R$ {post.preco?.toFixed(2)}</span>
                    </div>
                    {post.image && (
                      <div className="post-media">
                        <img src={getImageUrl(post.image)} alt="" className="post-image" />
                      </div>
                    )}
                    {post.content && <p className="post-content">{post.content}</p>}
                    <button onClick={() => handleBuy(post.id)} className="buy-button">
                      🛒 Comprar
                    </button>
                  </div>
                )}
              </div>

              <div className="post-footer">
                <div className="engagement-actions">
                  <button
                    className={`action-btn like-btn ${post.user_liked ? 'liked' : ''}`}
                    onClick={() => handleLike(post.id)}
                  >
                    <span className="action-icon">❤️</span>
                    <span className="action-count">{post.likes ?? 0}</span>
                  </button>
                  <button
                    className="action-btn comment-btn"
                    onClick={() => toggleComments(post.id)}
                  >
                    <span className="action-icon">💬</span>
                    <span className="action-count">{post.comments_count ?? 0}</span>
                  </button>
                </div>
              </div>

              {comments[post.id] && (
                <div className="comments-section">
                  <div className="comments-list">
                    {comments[post.id].map(comment => (
                      <div key={comment.id} className="comment-item">
                        <div className="comment-content">
                          <div className="comment-header">
                            <strong className="comment-username">@{comment.username}</strong>
                            <span className="comment-date">{new Date(comment.created_at).toLocaleString()}</span>
                          </div>
                          <p className="comment-text">{comment.conteudo}</p>
                        </div>
                        {user && user.id === comment.user_id && (
                          <button
                            onClick={() => handleDeleteComment(post.id, comment.id)}
                            className="delete-comment-btn"
                            title="Deletar comentário"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="comment-input-section">
                    <img src={getImageUrl(user?.avatar)} alt="" className="comment-avatar" />
                    <div className="comment-input-wrapper">
                      <input
                        type="text"
                        placeholder="Escreva um comentário..."
                        value={newComment[post.id] || ""}
                        onChange={(e) => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                        onKeyPress={(e) => e.key === 'Enter' && handleComment(post.id)}
                        className="comment-input"
                      />
                      <button
                        onClick={() => handleComment(post.id)}
                        className="comment-submit-btn"
                        disabled={!newComment[post.id]?.trim()}
                      >
                        Responder
                      </button>
                    </div>
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
