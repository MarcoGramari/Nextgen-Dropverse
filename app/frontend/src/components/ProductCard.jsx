import React from "react";

/* Card que mostra produto resumido */
export default function ProductCard({ product }) {
  return (
    <article className="product-card">
      <div className="product-thumb">IMG</div>
      <div className="product-body">
        <h3>{product.titulo}</h3>
        <p className="muted">{product.descricao?.slice(0,120)}</p>
        <div className="product-footer">
          <span className="price">R$ {(product.preco||0).toFixed(2)}</span>
        </div>
      </div>
    </article>
  );
}
