// components/CreatePostPopup.jsx
import React, { useState } from "react";
import api from "../api/api";
import "../styles/CreatePostPopup.css";

export default function CreatePostPopup({ onClose }) {
  const [postType, setPostType] = useState("social");

  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);

  // Campos de produto
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");
  const [categoria, setCategoria] = useState("");
  const [file, setFile] = useState(null);

  const [loading, setLoading] = useState(false);

  //////////// UPLOAD ////////////
  const uploadFile = async (fileToUpload) => {
    const form = new FormData();
    form.append("file", fileToUpload);

    try {
      const res = await api.post("/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 60000,
      });
      return res.data.filename;
    } catch (err) {
      console.error("Erro no upload:", err);
      throw err;
    }
  };

  //////////// SUBMIT ////////////
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageName = null;
      let fileName = null;

      // Upload da imagem se existir
      if (image) imageName = await uploadFile(image);

      // Upload do arquivo de produto se existir
      if (file && postType === "product") fileName = await uploadFile(file);

      // valida preco
      let precoNum = null;
      if (postType === "product") {
        precoNum = preco !== "" ? parseFloat(preco) : null;
        if (precoNum !== null && Number.isNaN(precoNum)) {
          throw new Error("Preço inválido");
        }
      }

      // Corpo final
      const postData = {
        tipo: postType,
        conteudo: content || null,
        imagem: imageName || null,
        titulo: postType === "product" ? titulo : null,
        descricao: postType === "product" ? descricao : null,
        preco: postType === "product" ? precoNum : null,
        categoria: postType === "product" ? categoria : null,
        file_path: fileName || null,
      };

      console.log("📤 Enviando post:", postData);

      await api.post("/posts", postData);

      onClose();
      window.location.reload();
    } catch (err) {
      console.error("🔥 ERRO ao criar post (COMPLETO):", err);

      const fullError = {
        message: err.message,
        code: err.code,
        responseStatus: err.response?.status,
        responseData: err.response?.data,
        requestExists: !!err.request,
        stack: err.stack,
      };

      alert("ERRO COMPLETO:\n" + JSON.stringify(fullError, null, 2));
    } finally {
      setLoading(false);
    }
  };

  //////////// JSX ////////////
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
            Social
          </button>

          <button
            type="button"
            className={postType === "product" ? "active" : ""}
            onClick={() => setPostType("product")}
          >
            Produto
          </button>
        </div>

        <form onSubmit={handleSubmit}>

          {/* SOCIAL */}
          {postType === "social" && (
            <>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="O que está acontecendo?"
              />

              <label>Imagem (opcional):</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
              />
            </>
          )}

          {/* PRODUTO */}
          {postType === "product" && (
            <>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Título do Produto"
                required
              />

              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Descrição do Produto"
                required
              />

              <input
                type="number"
                value={preco}
                step="0.01"
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

              <label>Imagem do Produto:</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
                required
              />

              <label>Arquivo do Produto (ZIP/PDF/etc):</label>
              <input
                type="file"
                accept=".zip,.pdf,.txt,.png,.jpg,.jpeg"
                onChange={(e) => setFile(e.target.files[0])}
              />

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Comentário adicional (opcional)"
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
