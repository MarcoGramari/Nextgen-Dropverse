import React, { useState } from "react";
import "../styles/Home.css";

export default function Home() {
  const [posts, setPosts] = useState([
  ]);

  const [input, setInput] = useState("");

  const publish = () => {
    if (!input.trim()) return;
    setPosts([
      { id: Date.now(), user: "Você", content: input, time: "Agora" },
      ...posts
    ]);
    setInput("");
  };

  return (
    <div className="home-container">
      <div className="post-box">
        <textarea
          placeholder="O que está acontecendo?"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button onClick={publish}>Postar</button>
      </div>

      <div className="feed">
        {posts.map((p) => (
          <div key={p.id} className="post">
            <strong>@{p.user}</strong>
            <p>{p.content}</p>
            <span>{p.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
