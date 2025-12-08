import React from "react";
import api from "../api/api";

/* Card que mostra produto resumido */
const getImageUrl = (filename) => {
  if (!filename) return null;
  const base = api.defaults.baseURL ? api.defaults.baseURL.replace(/\/api\/?$/, "") : "";
  return `${base}/uploads/${filename}`;
};

export default function ProductCard({ product, onBuy }) {
  return (
    <div className="product-post">
      <h4>{product.titulo}</h4>
      <p className="product-description">{product.descricao}</p>
      <div className="product-details">
        <span className="product-price">R$ {product.preco?.toFixed(2)}</span>
        <span className="product-category">{product.categoria}</span>
      </div>
      {product.image && (
        <img src={getImageUrl(product.image)} alt="product" className="post-image" />
      )}
      {product.content && <p className="post-content">{product.content}</p>}
      {onBuy && <button onClick={onBuy} className="buy-btn">Comprar</button>}
    </div>
  );
}
