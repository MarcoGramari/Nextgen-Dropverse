import { useState, useEffect } from "react";
import api from "../api/api";
import "../styles/Feed.css";

export default function Feed() {
  const [posts, setPosts] = useState([]);

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

  return (
    <div className="feed-container">
      <h1>Feed</h1>

      {posts.map(post => (
        <div key={post.id} className="feed-post">
          <div className="post-header">
            <img src={post.author.avatar} alt="" className="avatar" />
            <div>
              <strong>@{post.author.username}</strong>
              <p>{post.author.name}</p>
            </div>
          </div>

          <p className="post-content">{post.content}</p>

          {post.image && (
            <img src={post.image} alt="" className="post-image" />
          )}

          <div className="post-actions">
            <button>👍 {post.likes}</button>
            <button>💬 Comentar</button>
          </div>
        </div>
      ))}
    </div>
  );
}
