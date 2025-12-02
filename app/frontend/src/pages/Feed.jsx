import { useState, useEffect } from "react";
import "../styles/Feed.css";

export default function Feed() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5001/api/posts")
      .then(res => res.json())
      .then(data => setPosts(data));
  }, []);

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
