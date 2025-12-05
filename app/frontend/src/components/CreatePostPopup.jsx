import React, { useState } from "react";
import api from "../api/api";
import "../styles/CreatePostPopup.css";

export default function CreatePostPopup({ onClose }) {
  const [postType, setPostType] = useState("social");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");
  const [categoria, setCategoria] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
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
        conteudo: content,
        imagem: imageUrl,
      };

      await api.post("/posts", postData);
      onClose();
      // Optionally refresh posts in parent components
      window.location.reload(); // Simple refresh for now
    } catch (err) {
      console.error("Error creating post:", err);
      alert("Failed to create post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <div className="popup-header">
          <h2>Criar Novo Post</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="post-type-toggle">
          <button
            type="button"
            className={postType === "social" ? "active" : ""}
            onClick={() => setPostType("social")}
          >
            Post Social
          </button>
          <button
            type="button"
            className={postType === "product" ? "active" : ""}
            onClick={() => setPostType("product")}
          >
            Post Produto
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {postType === "social" ? (
            <>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="O que está acontecendo?"
                required
              />

              <input
                type="file"
                onChange={(e) => setImage(e.target.files[0])}
                accept="image/*"
              />
            </>
          ) : (
            <>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Título do produto"
                required
              />
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Descrição do produto"
                required
              />
              <input
                type="number"
                step="0.01"
                value={preco}
                onChange={(e) => setPreco(e.target.value)}
                placeholder="Preço"
                required
              />
              <input
                type="text"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                placeholder="Categoria"
                required
              />
              <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                placeholder="Arquivo do produto"
              />
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Comentário adicional (opcional)"
              />
              <input
                type="file"
                onChange={(e) => setImage(e.target.files[0])}
                accept="image/*"
                placeholder="Imagem do post (opcional)"
              />
            </>
          )}

          <div className="popup-actions">
            <button type="button" onClick={onClose}>Cancelar</button>
            <button type="submit" disabled={loading}>
              {loading ? "Postando..." : "Postar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
